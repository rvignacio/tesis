//Definiciones de las distintas funciones sintácticas
var syntacticNames = ['',
					  'sustantivo',
					  'verbo',
					  'adjetivo',
					  'artículo',
					  'adverbio',
					  'preposición',
					  'conjunción',
					  'pronombre'];

function searchSuccess(syntacticFunctions,word){
		/* result es un array con las funciones sintácticas de 
		 * la palabra consultada, hay que mostrar todos los valores
		 * que contiene.
		 *
		 * definitions es el wrapper para las definiciones, cada vez que
		 * se ejecuta el evento, se borra su contenido
		 * de búsquedas anteriores.
		 */
			var definitions = this.find( '.definitions' ).html('');
			$.each(syntacticFunctions, function(index, value){
				$('<li>',{
					'class' : 'definition',
					text : value
				}).appendTo(definitions)
				  .hide()
				  .fadeIn(500);
				addToList( value, word );
			});
			//Si no se encontró una definición
			if( !definitions.children().length ){
				$('<li>',{
					'class' : 'definition',
					text : word+' no fue encontrada en el diccionario.'
				}).appendTo(definitions)
				  .hide()
				  .fadeIn(500);
				addToList( null, word );
			}
}


/* Función que envía al server la consulta al servicio syntactiSearchService 
 * y procesa la respuesta
 */
function search(word,cb) {
	var $this = this;
	$.get('/syntacticSearch','word='+word,function(data){
		searchSuccess.call($this,data,word);
		if (typeof cb !== 'undefined'){
			cb(data);
		}
	});
}
//end of function search()


function addToList( value, word ){
	
	var speed = 500,
		uls = [];

	if( value === 'sustantivo'){
		uls.push('#sustantivos ul');
	}
	if( (value === 'verbo') || (value === 'verbo conjugado') ){
		uls.push('#verbos ul');
	}

	if( value === 'adjetivo' ){
		uls.push('#adjetivos ul');
	}

	if( value === 'artículo' ){
		uls.push('#articulos ul');
	}

	if( value === 'adverbio' ){
		uls.push('#adverbios ul');
	}

	if( value === 'preposición' ){
		uls.push('#preposiciones ul');
	}

	if( value === 'conjunción' ){
		uls.push('#conjunciones ul');
	}
	if( value === 'pronombre' ){
		uls.push('#pronombres ul');
	}
	if( value === null ){
		//uls.push('#indeterminadas ul');
		ul = $('#indeterminadas ul');
		if (!ul.find('li').filter(function(){
			return $(this).text() === word;
		}).length){
			$('<li>',{
				text: word
			}).appendTo(ul)
			  .hide()
			  .fadeIn(speed);
		}
	   /* Indica que cambió el contenido y debe agregarse un elemento select para
		* permitir al usuario seleccionar la función sintáctica de la palabra
		*/
		$('#indeterminadas ul','#listas').trigger('contentChanged');
	}

	uls.forEach(function(ul){
		ul = $(ul);
		if (!ul.find('li').filter(function(){
			return $(this).text() === word;
		}).length){
			$('<li>',{
				text: word
			}).appendTo(ul)
			  .hide()
			  .fadeIn(speed);
		}
	});
	
}
//end of function addToList()

(function($){
	
	$.fn.syntacticSearch = function(){
		return this.each(function(){
			//cache this
			var $this = $( this ),
				wordEl = $this.find('.word');
			
			//delega la función search al evento click del botón
			$this.find( '.search' ).click( function(){
				search.call($this,wordEl.val());
				return false;
			});
			//delega la función search al evento keypress de la tecla enter en el formulario
			wordEl.keypress( function(e){
				if( e.which === 13 ){
					search.call($this,wordEl.val());
					return false;
				}
			});
		});
	};
	//end of plugin syntacticSearch

	$.fn.addDefinitionSelect = function(){

		return this.each(function(){

			//cache this
			var $this = $(this);

			if($this.find('select').length === 0){
				var	select = $('<select/>', {
						'class': 'chosen'
					}).appendTo($this);

				syntacticNames.forEach(function(def){

					$('<option>',{
						value: def,
						text: def
					}).appendTo(select);

				});
				//end of forEach
			}
			//end of if

		});
		//end of return

	};
	//end of plugin addDefinitionSelect

})(jQuery);
