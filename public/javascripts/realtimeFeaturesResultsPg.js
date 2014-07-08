
//on the clients page you need to connect to the server for socket io
var socket = io.connect('http://metasearch.stage1.ng.bluemix.net/');

//This function listens for a suggests event from the server and then
//updates jquerys autocomplete funcionality with the array of the suggestions
//only the top 7 suggestions are used as otherwise the list is too long
$(function () {
  var availableTags = [];
  socket.on('suggests', function (data) {
  var sugObj = data;
  availableTags = sugObj.sugs[1].slice(0,6);
  $( "#searchboxResultpg" ).autocomplete({
      source: availableTags
      });
  });
})

//listen for answer event replace illegal charc with commas
//print left hand side and right hand side of sum
socket.on('answer', function (data) {
   console.log(data)
   var rhs = data.answer.rhs.replace(/�/g, '\,');
   var lhs = data.answer.lhs.replace(/�/g, '\,');
   document.getElementById("display").innerHTML = rhs;
   document.getElementById("prevsum").innerHTML = lhs;
});
