var gulp = require('gulp');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint'); // https://www.npmjs.com/package/gulp-jshint
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');

if (gutil.env.devel) {
    gutil.log('Building in development mode');
}

// Uglify non-Angular JS code
gulp.task('uglify', function() {
    gulp.src('src/main/webapp/javascripts/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

// Bundle and uglify AngularJS files
gulp.task('angular', function () {
	   gulp.src(['js-src/**/module.js', 'js-src/**/*.js'])
	    .pipe(sourcemaps.init())
	    .pipe(concat('app.js'))
	    .pipe(ngAnnotate())
	    .pipe(uglify())
	    .pipe(gulp.dest('src/main/webapp'))
});

// Build Angular code, but don't uglify
gulp.task('dev-angular', function () {
	  gulp.src(['js-src/**/module.js', 'js-src/**/*.js'])
	    .pipe(sourcemaps.init())
	    .pipe(concat('app.js'))
	    .pipe(ngAnnotate())
	    .pipe(gulp.dest('src/main/webapp'))
});

// Check non-Angular code for JS problems
gulp.task('lint', function() {
	  return gulp.src('./src/main/webapp/javascripts/*.js')
	    .pipe(jshint())
	    .pipe(jshint.reporter('default'));
});

gulp.task('build', ['lint', 'angular','uglify']);

gulp.task('default', ['dev-angular', 'watch']);

gulp.task('watch', function() {
	gulp.watch('js-src/**/*.js', ['dev-angular']);
});

gulp.task('test', function() {
	  console.log('gulp test!');
});