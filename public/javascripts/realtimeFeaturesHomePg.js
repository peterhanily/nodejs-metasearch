//Connect socket.io to the server on the url below 
var socket = io.connect('http://metasearch.stage1.ng.bluemix.net/');

//The client is listening for a suggest event and when it recieves on updates the jquery autocomplete array with suggestions
$(function () {
	var availableTags = [];

	socket.on('suggests', function (data) {
	  var sugObj = data;
	  availableTags = sugObj.sugs[1].slice(0,6);
	  console.log(availableTags);
	  $( "#searchbox" ).autocomplete({
	    source: availableTags
	   });
	});
});
