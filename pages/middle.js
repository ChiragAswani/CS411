function lookup() {
	var settings = {
	  "async": true,
	  "crossDomain": true,
	  "url": "http://localhost:8000/db",
	  "method": "GET",
	  "headers": {
	    "Postman-Token": "3d49e990-5beb-428c-8643-4f2aa6305bb9"
	   }
	}
	$(document).ready(function() {
		$.ajax(settings).done(function (response) {
			console.log(document.cookie)
		});
	});              
}





