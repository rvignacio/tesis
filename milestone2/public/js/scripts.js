(function(){
	$('.syntacticSearch').syntacticSearch();
	
	$(':file').change(function(){
		var reader = new FileReader();
		reader.readAsText(this.files[0]);
		reader.onload = function(){
			var p = $('p#file_text').hide(), matches = reader.result.match(/[a-zA-Z0-9áéíóú]+/g), result = reader.result.replace(/([a-zA-Z0-9áéíóú]+)/g,'{$1}');
			matches.forEach(function(val, idx){
				var word = val.toLowerCase();
				$('.syntacticSearch').search(word,function(data){
					var re = new RegExp('{'+word+'}','g'), title = data.join(', ').replace(/, ([^,]*)$/,' y $1');
					if (title){
						result = result.replace(re,'<span class="classified">'+word+' <span class="tooltip">'+title+'</span></span>');
					}else{
						result = result.replace(re,word);
					}
					if (idx == matches.length-1){
						var h3 = p.append(result).fadeIn('slow').css('border','1px solid green').prev();
						if (!h3.length){
							h3 = $('<h3/>');
						}
						h3.append('Texto etiquetado: ').insertBefore(p);
					}
				});
			});
		}
	});


	/* Evento para agregar un select a las palabras indeterminadas, se ejecuta cada vez que
	 * se inserta una palabra a la lista de indeterminadas
	 */
	$('#indeterminadas ul','#listas').bind('contentChanged', function(){
		$(this).find('li').addDefinitionSelect();
	});

	$('.chosen').live('change', function(){
		var val = $(this).val(), li = $(this).closest('li'), word = li.find('span').text();
		$.post('/words/assign','function='+val+'&word='+word, function(ret){
			if (ret){
				addToList(val,word);
				li.fadeOut('slow', function(){
					li.remove();
				});	
			}
		});
	});
	
})();
