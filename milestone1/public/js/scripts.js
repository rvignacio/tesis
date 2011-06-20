$(function(){
	$('#txt_wordcheck').bind('keydown',function(e){
		if (e.keyCode==13){
			$('#btn_wordcheck').trigger('click');
		}
	}).trigger('focus');
	$('#btn_wordcheck').bind('click',function(){
		var val = $('#txt_wordcheck').val(), elem = $(this), oldVal = elem.val(), span = $('#span_wordcheck').text('');
		if (val){
			elem.attr('disabled','disabled').val('Checking...');
			$.get('/wordcheck','word='+val,function(data){
				span.hide().text(data).show('slide');
				elem.removeAttr('disabled').val(oldVal);
			});
		}
	});
});
