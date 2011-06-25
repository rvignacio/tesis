(function($){
	$.fn.syntacticSearch = function(){
		return this.each(function(){
			
			//cache this
			var $this = $(this);
			
			$this.find('.search').click(function(){
		
				var word = $this.find('.word').val();
				
				$.ajax({
					type : 'GET',
					url : '/syntacticSearch',
					data : 'word='+word,
					success : function(result){
						
						/* result es un array con las funciones sint�cticas de 
						 * la palabra consultada hay que mostrar todos los valores
						 * que contiene
						 */
						$this.find('definition');
						console.log(result);
					}
				});
			
				//devuelve false para anular la acción por default del botón
				return false;
			
			});
		});
	}
})(jQuery);
