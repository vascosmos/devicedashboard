$(function() {
	
	$('select').select2();
	
	$('#view-select').change(function (evt) {
		var selectedView = $('#view-select').select2('val');
		if(selectedView === 'view-by-category'){
			$('#cpn-view').hide(500);
			$('#category-view').show(500);
		}else{
			$('#category-view').hide(500);	
			$('#cpn-view').show(500);
		}
	});
	
});