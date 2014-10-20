$(document).ready(function(){
	$('#side').asScrollSide();
	$('#move_to').on('click',function(){
		$('#side').data('asScrollSide').to('#target1', true);
	});
});
