//JS para layout de la página
(function(){
	//Quita los bordes que sobran de las listas de palabras
	$('.lista:first').css('border-top', '0px');
	$('.lista:last').css('border-bottom', '0px');

	//Genera las tabs para las listas de palabras organizadas según su función sintáctica
	$('.tabs').tabs();
})();
