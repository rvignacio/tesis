/* Servicio que busca la función sintáctica una palabra 
 *
 */
exports.search = function(word, callback){
	
	var $ = require('jquery'),
		http = require('http'),
		data = '';

	var options = {
			host: 'www.wordreference.com',
			port: 80,
			path: '/definicion/'+encodeURIComponent(word),
			method: 'GET',
			headers: {
				'User-Agent': "Im a fake and you know it"
			}
		};
	
	var req = http.request(options, function(res) {
			
			res.on('error', function(e) {
				
				var msj = 'Got error from '+options.host+': ' +e.message;
				console.log(msj);
				callback(msj);
			
			});

			res.on('data', function(chunk){
				data += chunk;
			});

			res.on('end',function(){
				
				var html = $(data), 
					conj = html.find('dt:contains(\'Del verbo\')').length,
					syntacticFunctions = [];

				
				//Para cada entrada en el diccionario
				html.find('ol.entry').each(function(index, entry){
				
					/*toma el texto de la primer definición, esta es la que contiene la 
					 *abreviatura que indica la función sintáctica
					 */
					var first_entry = $(entry).children('li:first').text();
					
					if ( /(^| y )(f|m|s)\./.test(first_entry) ){

						if( $.inArray( 'sustantivo' , syntacticFunctions ) === -1 ){
							syntacticFunctions.push( 'sustantivo' );
						}

					}
					if ( /(^| y )(v|tr|intr|prnl|aux)\./.test(first_entry) || conj){
						var sf = 'verbo'
						if (conj){
							sf += ' conjugado';
						}
						
						/*Issue 7: si no existe este valor en syntacticFunctions, 
						 *el método $.inArray devuelve -1
						 */
						if( $.inArray( sf, syntacticFunctions ) === -1 ){
							syntacticFunctions.push( sf );
						}
					}
					if ( /(^| y )adj\./.test(first_entry) ){

						if( $.inArray( 'adjetivo' , syntacticFunctions ) === -1 ){
							syntacticFunctions.push( 'adjetivo' );
						}

					}
					if ( /(^| y )art\./.test(first_entry) ){
						if( $.inArray( 'artículo' , syntacticFunctions ) === -1 ){
							syntacticFunctions.push( 'artículo' );
						}

					}
					if ( /(^| y )adv\./.test(first_entry) ){

						if( $.inArray( 'adverbio' , syntacticFunctions ) === -1 ){
							syntacticFunctions.push( 'adverbio' );
						}

					}
					if ( /(^| y )prep\./.test(first_entry) ){

						if( $.inArray( 'preposición' , syntacticFunctions ) === -1 ){
							syntacticFunctions.push( 'preposición' );
						}

					}
					if ( /(^| y )conj\./.test(first_entry) ){

						if( $.inArray( 'conjunción' , syntacticFunctions ) === -1 ){
							syntacticFunctions.push( 'conjunción' );
						}

					}

				});
				
				console.log( '->syntacticSearchService: respuesta de '+options.host+': ' + res.statusCode );
				console.log( '->syntacticSearchService: funciones dentro del req: '+syntacticFunctions.join(', ') );
				callback(syntacticFunctions);
			
			});
			//end res.on('end...
	});
	//end function(res){...
	
	req.end();
	
}
