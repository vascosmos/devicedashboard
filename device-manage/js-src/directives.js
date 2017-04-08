// This directive is forked from https://github.com/anandthakker/angular-multirange-slider
app.directive('slider', function ($document, $timeout) {
    return {
        restrict: 'E',
        scope: {
            model: '=',
            property: '@',
            step: '@',
            ngModel: '=',
            ngChange: '='
        },
        replace: true,
        template: '<div class="slider-control">\n<div class="slider">\n</div>\n</div>',
        link: function (scope, element, attrs) {
            var fn, getP, handles, i, j, len, mv, pTotal, ref, setP, step, updatePositions;
            element = element.children();
            element.css('position', 'relative');
            handles = [];
            pTotal = 0;
            
            // Call the ng-change method when the ng-model collection object changes
            scope.$watchCollection('ngModel', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    scope.$eval(attrs.ngChange);
                }
            });
            
            step = function () {
                if (scope.step != null) {
                    return parseFloat(scope.step);
                } else {
                    return 0;
                }
            };
            getP = function (i) {
                if (scope.property != null) {
                    return scope.model[i][scope.property];
                } else {
                    return scope.model[i];
                }
            };
            setP = function (i, p) {
                var s = step();
                if (s > 0) {
                    p = Math.round(p / s) * s;
                }
                if (scope.property != null) {
                    return scope.model[i][scope.property] = p;
                } else {
                    return scope.model[i] = p;
                }
            };
            updatePositions = function () {
                var handle, i, j, len;
                pTotal = scope.model.reduce(function (sum, item, i) {
                    return sum + getP(i);
                }, 0);
                var pRunningTotal = 0;
                var results = [];
                for (i = j = 0, len = handles.length; j < len; i = ++j) {
                    handle = handles[i];
                    var p = getP(i);
                    pRunningTotal += p;
                    var x = pRunningTotal / pTotal * 100;
                    results.push(handle.css({
                        left: x + '%',
                        top: '-' + handle.prop('clientHeight') / 2 + 'px'
                    }));
                    if(x === 100){
                        handle.css('z-index', len - i);
                    }else{
                        handle.css('z-index', i);
                    }
                }
                return results;
            };
            ref = scope.model;
            fn = function (mv, i) {
                var handle, startPleft, startPright, startX;
                if (i === scope.model.length - 1) {
                    return;
                }
                handle = angular.element('<div class="slider-handle"></div>');
                handle.css('position', 'absolute');
                handles.push(handle);
                element.append(handle);
                startX = 0;
                startPleft = startPright = 0;
                return handle.on('mousedown', function (event) {
                    var mousemove, mouseup;
                    mousemove = function (_this) {
                        return function (event) {
                            return scope.$apply(function () {
                                var dp;
                                dp = (event.screenX - startX) / element.prop('clientWidth') * pTotal;
                                if (dp < -startPleft || dp > startPright) {
                                    return;
                                }
                                setP(i, startPleft + dp);
                                setP(i + 1, startPright - dp);
                                return updatePositions();
                            });
                        };
                    }(this);
                    mouseup = function () {
                        $document.unbind('mousemove', mousemove);
                        return $document.unbind('mouseup', mouseup);
                    };
                    event.preventDefault();
                    startX = event.screenX;
                    startPleft = getP(i);
                    startPright = getP(i + 1);
                    $document.on('mousemove', mousemove);
                    return $document.on('mouseup', mouseup);
                });
            };
            for (i = j = 0, len = ref.length; j < len; i = ++j) {
                mv = ref[i];
                fn(mv, i);
            }
            return scope.$watch('model', updatePositions, true);
        }
    };
})

app.directive('ngUpdateHidden',function() {
    return function(scope, el, attr) {
        var model = attr['ngModel'];
        scope.$watch(model, function(nv) {
            el.val(nv);
        });

    };
})
