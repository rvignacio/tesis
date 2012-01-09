//Definiciones de las distintas funciones sintácticas
var syntacticNames = ['sustantivo',
					  'verbo',
					  'adjetivo',
					  'artículo',
					  'adverbio',
					  'preposición',
					  'conjunción',
					  'pronombre',
					  ''];

$.fn.searchSuccess = function(syntacticFunctions, word, appearances){
		/* result es un array con las funciones sintácticas de 
		 * la palabra consultada, hay que mostrar todos los valores
		 * que contiene.
		 *
		 * definitions es el wrapper para las definiciones, cada vez que
		 * se ejecuta el evento, se borra su contenido
		 * de búsquedas anteriores.
		 */
			var definitions = this.find( '.definitions' ).html('');
			if (syntacticFunctions[0]){
				$.each(syntacticFunctions, function(index, obj){
					$('<li>',{
						'class' : 'definition',
						text : obj.fn
					}).appendTo(definitions)
					  .hide()
					  .fadeIn(500)
					  .delay(2000)
					  .fadeOut(500);
					addToList( obj, word, appearances );
				});	
			}else{
				$('<li>',{
					'class' : 'definition',
					text : word+' no fue encontrada en el diccionario.'
				}).appendTo(definitions)
				  .hide()
				  .fadeIn(500)
				  .delay(2000)
				  .fadeOut(500);
				addToList( null, word, appearances );
			}
}
$('#listas > ul > li > a').bind('click', function(){
	var fn = syntacticNames[$('li.ui-state-active').index()] || 'encontrada';
	$('span.classified').fadeTo('fast', 0.2).filter('[data-fn~='+fn+']').fadeTo('fast', 1);
});
function showSearchResult(text){
	var p = $('p#file_text').hide().html(''), h3 = p.append(text).fadeIn('slow').css('border','1px solid green').prev();
	if (!h3.length){
		h3 = $('<h3/>');
	}
	h3.html('Texto etiquetado: ').insertBefore(p);
	$('#listas li.ui-state-active a').trigger('click');
}

/* Función que envía al server la consulta al servicio syntactiSearchService 
 * y procesa la respuesta
 */
$.fn.search = function(text) {
	var $this = this;
	$.get('/syntacticSearch','text='+encodeURIComponent(text),function(data){
		var funcs = data.funcs, counts = data.counts, len = Object.keys(funcs).length;
		text = text.replace(/([a-zA-Z0-9áéíóú]+)/g,'{$1}');
		for (word in funcs){
			if (funcs.hasOwnProperty(word)){
				var re = new RegExp('{'+word+'}','g'), appearances = counts[word], title = funcs[word].map(function(obj){
					if (obj.fn){
						return obj.fn + ' (' + obj.weight + ')';
					}else{
						return 'no encontrada';
					}
				}).join(', ').replace(/, ([^,]*)$/,' y $1');
				if (title){
					text = text.replace(re,'<span class="classified" data-fn="'+title+'">'+word+' <span class="tooltip">'+title+'</span></span>');
				}else{
					text = text.replace(re,word);
				}
				len -= 1;
				if (!len){
					showSearchResult(text);
				}
				$this.searchSuccess(funcs[word], word, appearances);
			}
		}
	});
}
//end of function search()


function addToList( obj, word, appearances ){
	var speed = 500, ul, value = obj.fn;
	switch (value){
		case 'sustantivo':
			ul = $('.sustantivos ul');
			break;
		case 'verbo':
		case 'verbo conjugado':
			ul = $('.verbos ul');
			break;
		case 'adjetivo':
			ul = $('.adjetivos ul');
			break;
		case 'artículo':
			ul = $('.articulos ul');
			break;
		case 'adverbio':
			ul = $('.adverbios ul');
			break;
		case 'preposición':
			ul = $('.preposiciones ul');
			break;
		case 'conjunción':
			ul = $('.conjunciones ul');
			break;
		case 'pronombre':
			ul = $('.pronombres ul');
			break;
		default:
			ul = $('.indeterminadas ul');
			break;
	}
	var span = ul.find('li span.word').filter(function(){
		return $(this).text() === word;
	});
	if (!span.length){
		//Agrega una palabra nueva a la lista, junto con el contador
		$('<li>',{
			html: '<span class="word">'+word+'</span> <span class="counter">'+(appearances || 1)+'</span>'
		}).appendTo(ul)
		  .hide()
		  .data('info', obj)
		  .fadeIn(speed).trigger('contentChanged');
	}else{
		//Suma 1 aparición más de esa palabra en el texto
		var counter = span.next('.counter');
		counter.text(parseInt(counter.text())+1);
	}
}
//end of function addToList()

(function($){
	
	$.fn.syntacticSearch = function(){
		return this.each(function(){
			//cache this
			var $this = $( this ),
				wordEl = $this.find('.word');
			
			//delega la función search al evento click del botón
			$this.find( '.search' ).on('click', function(){
				$this.search(wordEl.val());
				return false;
			});
			//delega la función search al evento keypress de la tecla enter en el formulario
			wordEl.keypress( function(e){
				if( e.which === 13 ){
					$this.search(wordEl.val());
					return false;
				}
			});
		});
	};
	//end of plugin syntacticSearch

	$.fn.addDefinitionSelect = function(){

		return this.each(function(){
			//cache this
			var $this = $(this), info = $this.data('info');
			if(!$this.find('select').length && info){
				var	select = $('<select/>', {
					'class': 'chosen'
				}),
				inputPeso = $('<input/>',{
					'class': 'weight',
					type: 'range',
					value: info.weight || '50',
					min: '1',
					max: '100',
					step: '1'
				}),
				submit = $('<input/>', {
					'class': 'add_new_word',
					type: 'submit',
					value: 'Enviar>>'
				});
				if (!info.fn){
					$this.append(select).append(inputPeso);
					var names = syntacticNames.slice();
					names.pop();
					names.unshift('');
					names.forEach(function(def, idx){
						$('<option>',{
							value: def,
							text: def || 'elija una función'/*,
							selected: $this.index() === idx*/
						}).appendTo(select);
					}); //end of forEach
					$this.append(submit);
				}else{
					inputPeso.appendTo($this).show();
					submit.appendTo($this).show();
				}
			}
			//end of if

		});
		//end of return

	};
	//end of plugin addDefinitionSelect

})(jQuery);
