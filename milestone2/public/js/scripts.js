(function(){
	$('.syntacticSearch').syntacticSearch();
	
	$(':file').change(function(){
		var reader = new FileReader();
		reader.readAsText(this.files[0]);
		reader.onload = function(){
			$('.syntacticSearch').search(reader.result);
		}
	});

	/* Función del botón Analizar del textarea. Envía todo el texto pegado al server para que este lo separe y
	 * devuelva etiquetado
	 */
	$('.txtArea :button').on('click', function(){
		var text = $(this).closest('.txtArea').find('textarea').val();
		$('.syntacticSearch').search(text);
	});

	/* Evento para agregar un select a las palabras indeterminadas, se ejecuta cada vez que
	 * se inserta una palabra a la lista de indeterminadas
	 */
	$('.indeterminadas ul','#listas').on('contentChanged', function(){
		$(this).find('li').addDefinitionSelect();
	});

	$('.indeterminadas ul','#listas').on('click', '.add_new_word',function(){
		var li = $(this).closest('li'),
			val = li.find('.chosen').val(),
			weight = li.find('.weight').val(),
			word = li.find('span').text();
		$.post('/words/assign','function='+val+'&word='+word+'&weight='+weight, function(ret){
			if (ret){
				addToList(val,word);
				li.fadeOut('slow', function(){
					li.remove();
				});	
			}
		});
		//end post
		return false;
	});
	//end live
})();
