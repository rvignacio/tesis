(function(){
	$('.syntacticSearch').syntacticSearch();
	
	$(':file').change(function(){
		var $this = $(this).attr('disabled', 'disabled'), reader = new FileReader(), initText = $this.val();
		$this.val('Procesando...');
		reader.readAsText(this.files[0]);
		reader.onload = function(){
			$('.syntacticSearch').search(reader.result, function(){
				$this.val(initText).removeAttr('disabled');
			});
		};
	});
	/* Función del botón Analizar del textarea. Envía todo el texto pegado al server para que este lo separe y
	 * devuelva etiquetado
	 */
	$('.txtArea :button').on('click', function(){
		var $this = $(this).attr('disabled', 'disabled'), text = $this.closest('.txtArea').find('textarea').val(), initText = $this.val();
		$this.val('Procesando...');
		$('.syntacticSearch').search(text, function(){
			$this.val(initText).removeAttr('disabled');
		});
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
