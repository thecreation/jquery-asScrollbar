$(document).ready(function($){
	$('#scroller').asScrollable();

	$('#move_to').on('click',function(){
		$('#scroller').data('asScrollable').to('#info1', true);

	});
});

