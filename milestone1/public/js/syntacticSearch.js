(function($){
	
	$.fn.syntacticSearch = function(){
		
		/* función que envía al server la consulta al servicio syntactiSearchService 
		 * y procesa la respuesta
		 */
		function search($this) {
		
			var word = $this.find( '.word' ).val();
				
			$.ajax({
				type : 'GET',
				url : '/syntacticSearch',
				data : 'word='+word,
				success : function(syntacticFunctions){
						
				/* result es un array con las funciones sintácticas de 
				 * la palabra consultada, hay que mostrar todos los valores
				 * que contiene.
				 *
				 * definitions es el wrapper para las definiciones, cada vez que
				 * se ejecuta el evento, se borra su contenido
				 * de búsquedas anteriores.
				 */
					var definitions = $this.find( '.definitions' ).html('');
					
					$.each(syntacticFunctions, function(index, value){

						$('<li>',{
							
							'class' : 'definition',
							text : value

						}).appendTo(definitions)
						  .hide()
						  .slideDown(1500);

					});

					//Si no se encontró una definición
					if( definitions.children().length === 0 ){

						$('<li>',{
							'class' : 'definition',
							text : word+' no fue encontrada en el diccionario.'
						}).appendTo(definitions)
						  .hide()
						  .slideDown(1500);

					}
					
					//console.log(result);

				}
			});
			
		}
		//end of function search()
		
		return this.each(function(){
			
			//cache this
			var $this = $( this );
			
			//delega la función search al evento click del botón
			$this.find( '.search' ).click( function(){
				
				search($this);
				return false;

			});

			//delega la función search al evento keypress de la tecla enter en el formulario
			$this.find( '.word' ).keypress( function(e){

				if( e.which === 13 ){

					search($this);
					return false;

				}
				
			});
		
		});

	};

})(jQuery);
