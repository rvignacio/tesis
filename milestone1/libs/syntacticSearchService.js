/* Servicio
 *
 */
module.exports.check = function(word,callback){
	
	var $ = require('jquery'),
		http = require('http'),
		data = '';

	var options = {
			host: 'www.wordreference.com',
			port: 80,
			path: '/definicion/'+word,
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
					syntacticFunction = [];

				
				//Para cada entrada en el diccionario
				html.find('ol.entry').each(function(index, entry){
				
					//toma el texto de la primer definición, esta es la que contiene la 
					//abreviatura que indica la función sintáctica
					var first_entry = $(entry).children('li:first').text();

					if (/^(v|tr|intr|prnl)\./.test(first_entry) || conj){
						var sf = 'verbo'
						if (conj){
							sf += ' (conjugado)';
						}
						syntacticFunction.push(sf);
					}

					if (/^adv\./.test(first_entry)){
						syntaxFunction.push('adverbio');
					}
					if (/^prep\./.test(first_entry)){
						syntaxFunction.push('preposición');
					}
					if (/^adj\./.test(first_entry)){
						syntaxFunction.push('adjetivo');
					}
					if (/^art\./.test(first_entry)){
						syntaxFunction.push('artículo');
					}
					if (/^(f|m|s)\./.test(first_entry)){
						syntaxFunction.push('sustantivo');
					}

				});
				
				console.log('Respuesta de '+options.host+': ' + res.statusCode);
				
				callback(syntaxFunction);
			
			});
			//end res.on('end...
	});
	//end function(res){...
	
	req.end();

}
