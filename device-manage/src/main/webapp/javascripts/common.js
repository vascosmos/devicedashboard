
// Helper function for compiling and rendering Handlebars partials
function renderPartial(partialName, data){
	var compiledPartial = Handlebars.compile(Handlebars.partials[partialName]);
	var renderedHtml = compiledPartial(data);
	return renderedHtml;
}

// Takes data from the server, displaying error messages and redirecting as needed.
// Returns whether or not the data from the server indicates success.
function unpackErrorAndMsg(data){
	if (data.success === false) {
		$('#main-alert span.message').html(data.msg);
		$('#main-alert').slideDown();
	}
	if (data.redirect !== null) {
		window.location.href = data.redirect;
	}
	return data.success;
}

$(function() {
	
	$("#main-alert button.close").on("click", function(){
		$("#main-alert").hide();
    });

	// Add common JS code here as needed
	$('#logout').click(function(evt) {
		$.ajax({
			type : "POST",
			url : 'api/logout',
			success : function(data) {
				window.location.replace(data.redirect);
			}
		});
		evt.preventDefault();
	});
	
	$('.new-version-btn').click(function(evt) {
		$.ajax({
			type : "POST",
			url : 'api/switchVersion',
			data : {
				'v' : $(this).data('version')
			},
			success : function(data) {
				location.reload();
			}
		});
		evt.preventDefault();
	});
	
	// Initialize tooltips
	$('[data-toggle="tooltip"]').tooltip();
	
});
