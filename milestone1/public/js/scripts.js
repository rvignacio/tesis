$(function(){
	$('.syntacticSearch').syntacticSearch();
	$(':file').change(function(){
		var reader = new FileReader();
		reader.readAsText(this.files[0]);
		reader.onload = function(){
			reader.result.match(/[a-zA-Z0-9áéíóú]+/g).forEach(function(val){
				search.call($('.syntacticSearch'),val.toLowerCase());
			});
		}
	});
});
