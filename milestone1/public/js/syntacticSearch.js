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
						
						console.log(result);
						
					}
				});
			
				//devuelve false para anular la acción por default del botón
				return false;
			
			});
		});
	}
})(jQuery);
