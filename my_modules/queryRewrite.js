var forEach = require('async-foreach').forEach;
var stopWords = require('./clustering/stopWords').stopWordList;
var async = require('async');
var error = require('./errorCheckResults');
var cluster = require('./clustering/clustering.js').cluster;
var natLang = require('./clustering/naturalLanguagePreProcess');
var norm = require('./normalizeUrls');
var queryPre = require('./query');

function rewrite(Query, apiCallsArr, getFunction, clientIp, date, isCalcBool, toggleCluster, res, isQueryPrePro, orignalQuery) {

	//Request all api calls in parallel
	async.map(apiCallsArr,
		getFunction,
		function(err, results){
			if(err)
				console.log(err)
			else{
				var goog1to10 = JSON.parse(results[0]);
				var goog11to20 = JSON.parse(results[1]);
				var goog21to30 = JSON.parse(results[2]);
				var goog31to40 = JSON.parse(results[3]);
				var goog41to50 = JSON.parse(results[4]);
				var bing1to50 = JSON.parse(results[5]);

				//create 50 result list check not empty
				var bingList = {};
				bingList.items = error.checkBing(bing1to50);

				//Concatenate Google results into an object with an array of 50 results
				var googList = {};
				googList.items = error.checkGoogle(goog1to10, goog11to20, goog21to30, goog31to40, goog41to50);

				//Need to include an empty blekko list due to the way the modules were created
				var blekList = {};
				blekList.RESULT = [];

				//In parallel normalise Urls and pre process snippets
				async.parallel([
					function (cb){
						//Normalize Urls
						norm.normUrl(googList, bingList, blekList, date);
						cb(null, true);
					},
					function (cb){
						if(toggleCluster === true || isQueryPrePro === true ){
							//NLP Pre Process Snippets
							natLang.natLangPrePro(googList, bingList, blekList);
						}
						cb(null, true);
					}
					],
					function (err, results) {
						if(err)
							console.log(err);
					});    

				async.series([
					function(cb){
						if(bingList.items.length > 0 || googList.items > 0){
							//Use the first part of the clustering module that I created to get top 5 tfidf rated words
							cluster(googList, blekList,	bingList, cb, isQueryPrePro);
						}
						else {
							//If there are no results to calculate tf-idf weights on then send back empty string
							cb(null, "");
						}
					}],
					function(err, results) {
						if(err)
							console.log(err);
						else {
							var tmpQuery = results[0];
							orignalQuery = Query;//Put original query into variable for display purposes
							Query = Query + " " + tmpQuery;
							console.log(Query);
							queryPre.preProcess(res, Query, clientIp, toggleCluster, date, isQueryPrePro, true, orignalQuery)
						}
					});
			}
		});

}

exports.rewrite = rewrite;
