// Converts a decimal to a percentage display format with a configurable number of decimals.
// Usage: [[myDecimal | percentage:2]]
app.filter('percentage', [ '$filter', function($filter) {
	return function(input, decimals) {
		return $filter('number')(input * 100, decimals) + '%';
	};
} ])