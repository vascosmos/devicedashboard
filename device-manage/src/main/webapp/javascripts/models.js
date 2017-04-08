$(function() {

	// Deletes an entire model
	$('.model-delete-btn').click(function(evt) {
		var _this = $(this);
		$(_this).append('<span class="ajax-spinner">&nbsp;&nbsp;<i class="fa fa-spinner fa-spin"></i></span>');
		$.ajax({
			type : 'POST',
			url : 'api/deleteModel',
			data : {
				'id' : $(_this).closest('tr').data('model-id')
			},
			success : function(data) {
				if(unpackErrorAndMsg(data)){
					$(_this).closest('tr').next().remove();
					$(_this).closest('tr').remove();
				}
			}
		});
		evt.preventDefault();
	});
	
	// Deletes a single change from a model
	$('.model-change-delete-btn').click(function(evt) {
		var _this = $(this);
		var parentRow = $(_this).closest('tr.model-details-container').prev();
		$(_this).append('<span class="ajax-spinner">&nbsp;&nbsp;<i class="fa fa-spinner fa-spin"></i></span>');
		console.log('modelId: ' + parentRow.data('model-id'));
		console.log('componentId: ' + $(_this).closest('tr').data('component-id'));	
		$.ajax({
			type : 'POST',
			url : 'api/deleteModelChange',
			data : {
				'modelId' : parentRow.data('model-id'),
				'componentId' : $(_this).closest('tr').data('component-id')
			},
			success : function(data) {
				if(unpackErrorAndMsg(data)){
					// If there are no more changes left in the model, remove the entire model from the parent table
					if($(_this).closest('tr').siblings().size() === 0){
						parentRow.remove();
						$(_this).closest('tr.model-details-container').remove();
						// Refresh the page so that the model dropdown repopulates
						location.reload();
					}else{
						$(_this).closest('tr').remove();
					}
				}
			}
		});
		evt.preventDefault();
	});
	
	$('.model-details-btn').click(function(evt) {
		var detailRow = $(this).closest('tr').next();
		detailRow.toggle();
		// Update the View Details button
		if(!detailRow.is(':visible')){
			$(this).html('<i class="fa fa-plus-circle fa-lg"></i> View Details');
		}else{
			$(this).html('<i class="fa fa-minus-circle fa-lg"></i> Hide Details');
		}
		evt.preventDefault();
	});
	
});