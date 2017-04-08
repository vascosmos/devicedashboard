$(function() {

	$('#login-form').submit(function(evt) {
		$('#main-alert').hide();
		$('#login-form button').append('<span class="ajax-spinner">&nbsp;&nbsp;<i class="fa fa-spinner fa-spin"></i></span>');
		$.ajax({
			type : "POST",
			url : 'api/login',
			data : $('#login-form').serialize(),
			success : function(data) {
				unpackErrorAndMsg(data);
			},
			complete : function(data) {
				$('#login-form button span.ajax-spinner').remove();
			}
		});
		evt.preventDefault();
	});

});