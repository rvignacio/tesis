(function(){
	$('.syntacticSearch').syntacticSearch();
	
	$(':file').change(function(){
		var reader = new FileReader();
		reader.readAsText(this.files[0]);
		reader.onload = function(){
			$('.syntacticSearch').search(reader.result);
		};
	});
	/* Función del botón Analizar del textarea. Envía todo el texto pegado al server para que este lo separe y
	 * devuelva etiquetado
	 */
	$('.txtArea :button').on('click', function(){
		var text = $(this).closest('.txtArea').find('textarea').val();
		$('.syntacticSearch').search(text);
		$('.lista li').remove();
	});

	/* Evento para agregar un select a las palabras indeterminadas, se ejecuta cada vez que
	 * se inserta una palabra a la lista de indeterminadas
	 */
	$('#listas')
	.on('contentChanged', 'li', function(){
		$(this).addDefinitionSelect();
	})
	.on('click', '.add_new_word',function(){
		var el = $(this), li = el.closest('li'),
			oldFn = li.data('info').fn,
			newFn = li.find('.chosen').val(),
			weight = li.find('.weight').val(),
			word = li.find('span.word').text(),
			appearances = li.find('.counter').text(),
			btnText = el.val();
		el.attr('disabled', 'disabled').val('Enviando...');
		$.post('/words/assign','oldFn='+oldFn+'&newFn='+(newFn || oldFn)+'&word='+word+'&weight='+weight, function(ret){
			if (ret){
				el.removeAttr('disabled').val(btnText);
				if (newFn){
					addToList({
						fn: newFn,
						weight: weight
					}, word, appearances);
					li.fadeOut('slow', function(){
						li.remove();
					});
				}
			}
		});
		//end post
		return false;
	});
	$('.lista').on('change', 'select.chosen', function(){
		var el = $(this), nextEls = el.nextAll(), speed = 'fast';
		if (el.val()){
			nextEls.show(speed);
		}else{
			nextEls.hide(speed);
		}
	});
	//end live
})();
