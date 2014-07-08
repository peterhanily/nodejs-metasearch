// app.js
// This file contains the server side JavaScript code for your application.
// This sample application uses express as web application framework (http://expressjs.com/),
// and jade as template engine (http://jade-lang.com/).

var express = require('express')
  , realTime = require('./my_modules/realTimeFeatures').realTimeFeatures
  , query = require('./my_modules/query');
  
// setup middleware
var app = express();
app.use(app.router);
app.use(express.errorHandler());
app.use(express.compress());//compress content using gzip
app.use(express.static(__dirname + '/public')); //setup static public directory
app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); //optional since express defaults to CWD/views

//Index Page
app.get('/', function(req,res){
	res.render('index', { title: 'MetaSearch It' });
});


//Results Page
app.get('/q',function(req, res) {
    //Check if query string is empty/all spaces if so redirect to homepage
    if(req.query.search.query === undefined || req.query.search.query.trim() === "")
      res.redirect('/');

    else {
    	var Query = req.query.search.query;//Set Query

      var toggleCluster = true;
      if(req.query.toggleCluster === 'OFF')//If toggle cluster option set to off set to false
        toggleCluster = false;

      var isQueryPrePro = false;

      if(req.query.isQueryPrePro === 'ON'){//If PreProcessing is switched on change bool to true
        isQueryPrePro = true;
      }

      var date = new Date();//Set start timestamp

      var clientIp = req.connection.remoteAddress;//Set User IP address

      //false is for PreProcess already completed and empty string is for orignal query (when query preprocessing)
      query.preProcess(res, Query, clientIp, toggleCluster, date, isQueryPrePro, false, "");//PreProcess Query(Complex Search)
    }
});
	

// There are many useful environment variables available in process.env,
// please refer to the following document for detailed description:
// http://ng.w3.bluemix.net/docs/FAQ.jsp#env_var

// VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
// TODO: Get application information and use it in your app.

// VCAP_SERVICES contains all the credentials of services bound to
// this application. For details of its content, please refer to
// the document or sample of each service.
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
// TODO: Get service credentials and communicate with bluemix services.

// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
var server = app.listen(port, host);
console.log('App started on port ' + port);

//Socket.io required
//In express 3.X it must listen to server onject create above
var io = require('socket.io').listen(server);


//Socket.io production settings (enable gzip compression)
//https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file
io.set('log level', 1);                    // reduce logging

// enable all transports (optional if you want flashsocket support, please note that some hosting
// providers do not allow you to create servers that listen on a port different than 80 or their
// default port)
io.set('transports', [
    'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
]);

//realTimeFeatures File (for socket.io suggestions realtime && calculator realtime api)
realTime(io);