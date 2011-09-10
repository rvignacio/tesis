(function(){
	$('.syntacticSearch').syntacticSearch();
	
	$(':file').change(function(){
		var reader = new FileReader();
		reader.readAsText(this.files[0]);
		reader.onload = function(){
			var p = $('p#file_text').hide(), matches = reader.result.match(/[a-zA-Z0-9áéíóú]+/g), result = reader.result.replace(/([a-zA-Z0-9áéíóú]+)/g,'{$1}');
			matches.forEach(function(val, idx){
				var word = val.toLowerCase();
				search.call($('.syntacticSearch'),word,function(data){
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


	//agrega un select a las palabras indeterminadas
	$('#indeterminadas ul','#listas').bind('contentChanged', function(){
		$(this).find('li').addDefinition();
	});
	
})();
