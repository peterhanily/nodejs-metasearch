/**************************************************************
This file is used to store the request objects for 16 of the api's used
in this project (the suggestion and calulator api stored elsewhere)
the variables can be set with the proper query and then
exported to be used when requesting in the metasearch module.
***************************************************************/


//Create API call objects
var goog1 = {};
var goog2 = {};
var goog3 = {};
var goog4 = {};
var goog5 = {};
var goog6 = {};
var goog7 = {};
var goog8 = {};
var goog9 = {};
var goog10 = {};
var bing1 = {};
var bing2 = {};
var blekko = {};
var ipinfo = {};
var bingRelSearch = {};
var thesarus = {};


var calls = function(bingQuery, googQuery, blekQuery, clientIp){


	//Get google 1 to 100 in 10 * 10 sections
	goog1.url = 'https://www.googleapis.com/customsearch/v1?' +
			 'key=<GOOGLE CUSTOM SEARCH API KEY>' +
			 '&cx=<GOOGLE CUSTOM SEARCH CX PROJECT CODE>&q='+ googQuery +'&alt=json';

	goog2.url = 'https://www.googleapis.com/customsearch/v1?' +
		     'key=<GOOGLE CUSTOM SEARCH API KEY>' +
		     '&cx=<GOOGLE CUSTOM SEARCH CX PROJECT CODE>&q='+ googQuery +'&alt=json&start=11';

	goog3.url = 'https://www.googleapis.com/customsearch/v1?' +
		     'key=<GOOGLE CUSTOM SEARCH API KEY>' +
		     '&cx=<GOOGLE CUSTOM SEARCH CX PROJECT CODE>&q='+ googQuery +'&alt=json&start=21';

	goog4.url = 'https://www.googleapis.com/customsearch/v1?' +
		     'key=<GOOGLE CUSTOM SEARCH API KEY>' +
		     '&cx=<GOOGLE CUSTOM SEARCH CX PROJECT CODE>&q='+ googQuery +'&alt=json&start=31';

	goog5.url = 'https://www.googleapis.com/customsearch/v1?' +
		     'key=<GOOGLE CUSTOM SEARCH API KEY>' +
		     '&cx=<GOOGLE CUSTOM SEARCH CX PROJECT CODE>&q='+ googQuery +'&alt=json&start=41';

	goog6.url = 'https://www.googleapis.com/customsearch/v1?' +
		     'key=<GOOGLE CUSTOM SEARCH API KEY>' +
		     '&cx=<GOOGLE CUSTOM SEARCH CX PROJECT CODE>&q='+ googQuery +'&alt=json&start=51';

	goog7.url = 'https://www.googleapis.com/customsearch/v1?' +
		     'key=<GOOGLE CUSTOM SEARCH API KEY>' +
		     '&cx=<GOOGLE CUSTOM SEARCH CX PROJECT CODE>&q='+ googQuery +'&alt=json&start=61';

	goog8.url = 'https://www.googleapis.com/customsearch/v1?' +
		     'key=<GOOGLE CUSTOM SEARCH API KEY>' + 
		     '&cx=<GOOGLE CUSTOM SEARCH CX PROJECT CODE>&q='+ googQuery +'&alt=json&start=71';

	goog9.url = 'https://www.googleapis.com/customsearch/v1?' +
		     'key=<GOOGLE CUSTOM SEARCH API KEY>' +
		     '&cx=<GOOGLE CUSTOM SEARCH CX PROJECT CODE>&q='+ googQuery +'&alt=json&start=81';

	goog10.url = 'https://www.googleapis.com/customsearch/v1?' +
		     'key=<GOOGLE CUSTOM SEARCH API KEY>' + 
		     '&cx=<GOOGLE CUSTOM SEARCH CX PROJECT CODE>&q='+ googQuery +'&alt=json&start=91';


    //Get bing 100 results in 50 * 2 sections
	bing1.url = "https://api.datamarket.azure.com/Bing/Search/Web?" +
		     "Query=%27"+ bingQuery +"%27&$format=json&$top=50";
    
    //Send basic auth in headers no username api key as pasword
	bing1.headers = {
		"Authorization" : "Basic " +
		new Buffer(":" + "<BING SEARCH API KEY>").toString("base64")
		};

	bing2.url = "https://api.datamarket.azure.com/Bing/Search/Web?" +
		     "Query=%27"+ bingQuery +"%27&$format=json&$skip=50&$top=50";

	bing2.headers = { 
		"Authorization" : "Basic " + 
		new Buffer(":" + "<BING SEARCH API KEY>").toString("base64")
		};


	//Get blekko 100 results
	blekko.url = 'http://blekko.com/?q=' + blekQuery + '+/json+/ps=20&p=0';
	
	//Get IP detalis like location region and city
	ipinfo.url = 'http://api.ipinfodb.com/v3/ip-city/?' +
		     'key=<IPINFO API KEY>' +
		     '&ip=' + clientIp +'&format=json';

  
    //Get bing realeated search results ie query mining logs
    bingRelSearch.url = "https://api.datamarket.azure.com/Bing/Search/RelatedSearch?Query=%27" + bingQuery + "%27&$format=json";

    bingRelSearch.headers = {
    	"Authorization" : "Basic " + 
		new Buffer(":" + "<BING SEARCH API KEY>").toString("base64")
    };


    //Get thesaurus syynoms found that the google query works the best here
    thesarus.url = "http://words.bighugelabs.com/api/1/<BIG HUGE LABS API KEY>/" + googQuery + "/json"
};

//Export setter function and variables
exports.calls = calls;
exports.goog1 = goog1;
exports.goog2 = goog2;
exports.goog3 = goog3;
exports.goog4 = goog4;
exports.goog5 = goog5;
exports.goog6 = goog6;
exports.goog7 = goog7;
exports.goog8 = goog8;
exports.goog9 = goog9;
exports.goog10 = goog10;
exports.bing1 = bing1;
exports.bing2 = bing2;
exports.blekko = blekko;
exports.ipinfo = ipinfo;
exports.bingRelSearch = bingRelSearch;
exports.thesarus = thesarus;
