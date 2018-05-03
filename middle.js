function check_duplicate_username() {
var settings = {
  "async": true,
  "crossDomain": true,
  "url": "http://localhost:8000/accounts",
  "method": "GET",
  "headers": {
    "Cache-Control": "no-cache",
    "Postman-Token": "5c310e85-bcd4-402c-8b4a-9e607270675e"
  }
}
$(document).ready(function() {
	var isUserNameInDB = false
	$.ajax(settings).done(function (response) {
	  console.log(response);
	  var incomingUserName = document.getElementsByClassName("username").username.value;
	  for(name in response){
	  	console.log(incomingUserName)
	  	if (response[name].username ==  incomingUserName){
	  		isUserNameInDB = true
	  		alert("Username already exists, please choose another one");
	  		location.reload();
	  		return
	  	}
	  }
	});
});
}


function displayData() {
	var slackchannel = document.getElementById("slackchannel").value
	console.log(slackchannel)
	var refreshbutton = document.getElementById("refreshbutton");
	refreshbutton.style.display = "none";
	document.getElementById("slackchannel").style.display = "none";
	$(document).ready(function() {
			//$.ajax(settings).done(function (response) {
			  table = $('#example').DataTable({
		        "ajax": "messages?q=" + slackchannel,
		        "columnDefs": [
	    		{ "width": "2%", "targets": 0 }
	  			],
		        "columns": [
			            { "data": "platform" },
			            { "data": "sender_id" },
			            { "data": "message" },
			            { "data": "time_stamp" }
		        	]
		    	});
			  console.log(table)
			});
}

function check_username_exists() {
var settings = {
  "async": true,
  "crossDomain": true,
  "url": "http://localhost:8000/accounts",
  "method": "GET",
  "headers": {
    "Cache-Control": "no-cache",
    "Postman-Token": "5c310e85-bcd4-402c-8b4a-9e607270675e"
  }
}
$(document).ready(function() {
	var isUserNameInDB = false
	$.ajax(settings).done(function (response) {
	  console.log(response);
	  var incomingUserName = document.getElementsByClassName("username").username.value;
	  for(name in response){
	  	console.log(incomingUserName)
	  	if (response[name].username ==  incomingUserName){
	  		isUserNameInDB = true
	  		
	  	}
	  }
	  if(isUserNameInDB == false){
	  	alert("Invalid Username or Password!");
	  		location.reload();
	  		return
	  }
	});
});
}