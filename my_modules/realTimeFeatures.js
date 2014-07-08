var request = require('request');


/*
* This is the socket io server code here it deals with the query suggestion and 
* the query adjustment in the form of the calculator
*/
var realTimeFeatures = function (io) {

  //Listen for connection event from client
	io.sockets.on('connection', function (socket) {

      //Query Suggestion Script
  		socket.on('typing', function (data) {
  			var curQuery = data;
        var encodedQry = encodeURIComponent(curQuery.typed);
  			var googSug = {
				url: 'http://suggestqueries.google.com/complete/search?q=' + encodedQry + '&client=firefox'
			};
			if(curQuery.typed === "")
      			socket.emit('suggests', { sugs: {sugs: []} });
    		else{
      			request(googSug, function(err,response,body){
      				if (err){
         			  console.log(err);
        			} else {
                  try{
                    var gsug = JSON.parse(body);
		                socket.emit('suggests', { sugs: gsug });
                  }
                  catch(e){
                    console.log(e);
                  }
          			}
      			});
    		}
  		});




      //Calculator Script
      socket.on('calculate', function (data) {
        var curCal = data;
        var encodedCal = encodeURIComponent(curCal.cal);

        var googCalc = {
          url: "http://www.google.com/ig/calculator?hl=en&q=" + encodedCal
        };
        //Check if current equation is empty string
        if(curCal.cal === "")
            socket.emit('answer', { answer: {} });
        else{
            request(googCalc, function(err,response,body){
              if (err){
                console.log(err);
              } else {
                    //Google sens error if out of bounds
                    try{
                //RESPONSE IS BAD JSON STRING, KEYS NOT IN "" 
                //USED REGEX's TO ADD "" THEN DO JSON.parse()
                //eval() could be used but is a massive security risk
                //Especially as it is not running on the client but on the server
                //So using this regex method is better instead
                      var obj = body.replace(/\{/g, '{"')
                                  .replace(/,/g,',"')
                                  .replace(/:/g, '":');
                       obj = JSON.parse(obj);
                       socket.emit('answer', { answer: obj });
                    }//catch error
                    catch(e){
                      var obj = {};
                      obj.lhs = curCal.cal;//Equation that client sent to server
                      obj.rhs = "Out of Bounds";//Display message
                      socket.emit('answer', { answer: obj });
                    }
                }
            });
        }
      });



	});
};

//export realtime features module
exports.realTimeFeatures = realTimeFeatures;