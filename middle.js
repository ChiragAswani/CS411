function check_duplicate_username() {
					var settings = {
			  "async": true,
			  "crossDomain": true,
			  "url": "http://localhost:8000/accounts",
			  "method": "GET",
			  "headers": {
			    "Cache-Control": "no-cache",
			    "Postman-Token": "637fe213-6a01-4aee-9968-7162a5e40dea"
			  }
			}

			ajax(settings).done(function (response) {
			  console.log(response);
			});             
				}