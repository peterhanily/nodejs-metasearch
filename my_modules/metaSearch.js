//Require modules
var async = require('async');
var set = require('./setCalls');
var norm = require('./normalizeUrls');
var request = require('request');
var combRank = require('./combmnzrank');
var recipRank = require('./reciprocalrankfuse');
var natLang = require('./clustering/naturalLanguagePreProcess');
var cluster = require('./clustering/clustering.js').cluster;
var error = require('./errorCheckResults');
var query = require('./queryRewrite.js');


var metaSearch = function (res, bingQuery, googQuery, blekQuery, clientIp, date, isCalcBool, Query, toggleCluster, isQueryPrePro, preProComplete, originalQuery) {

	//Set api calls with preprocessed query and the clients ip address (for location)
	set.calls(bingQuery, googQuery, blekQuery, clientIp);

	//Function to do GET requests for every object
	var getFunc = function(reqobj, cb){
		//Uses request module response should be 200 OK and json held in body
		request(reqobj, function(err,response,body){
			if (err){//Check for error
					cb(err);
			} else {
					cb(null, body); //null means no error
			}
		});
	};

	//If Query preprocessing is switched ON (it is off by default)
	//preProComplete is set to false by default in the  query rewrite module it is set to true so to avoid recursion
	if(isQueryPrePro === true && preProComplete === false){
		//Array that stores a list of objects that will be sent for api calls
		//Query pre processing on top 50 google and top 50 bing docs of original Query
		var apiCallsPreProArr = [set.goog1, set.goog2, set.goog3, set.goog4, set.goog5, set.bing1];

		query.rewrite(Query, apiCallsPreProArr, getFunc, clientIp, date, isCalcBool, toggleCluster, res, isQueryPrePro, originalQuery);//Query Rewrite module for preprocessing
	}


	//If query preprocessing OFF OR if query pre processing has been completed 
	else if(preProComplete === true || isQueryPrePro === false){

		//Array that stores a list of objects that will be sent for api calls
		var apiCallsArr = [set.goog1, set.goog2, set.goog3, set.goog4, set.goog5, set.goog6, set.goog7, set.goog8, set.goog9,
						   set.goog10, set.bing1, set.bing2, set.blekko, set.ipinfo, set.bingRelSearch, set.thesarus]

		//Async map applies getFunc to all obj's and gets results in callback
		async.map(apiCallsArr,
		    getFunc
			, function(err, results){

			if (err){//If error print error
				console.log(err);
			} else {//Else Deal with results
				//Parse Results and but into object variables
				var goog1to10 = JSON.parse(results[0]);
				var goog11to20 = JSON.parse(results[1]);
				var goog21to30 = JSON.parse(results[2]);
				var goog31to40 = JSON.parse(results[3]);
				var goog41to50 = JSON.parse(results[4]);
				var goog51to60 = JSON.parse(results[5]);
				var goog61to70 = JSON.parse(results[6]);
				var goog71to80 = JSON.parse(results[7]);
				var goog81to90 = JSON.parse(results[8]);
				var goog91to100 = JSON.parse(results[9]);
				var bing1to50 = JSON.parse(results[10]);
				var bing51to100 = JSON.parse(results[11]);
				var ipinfo = JSON.parse(results[13]);
				var bingRelated = JSON.parse(results[14]);
				try{//Depending on the query no results may be returned try parsing json
					var relatedWords = JSON.parse(results[15]);
				}
				catch(e){//if error catch error set variable to bool false
					var relatedWords = false
				}

				//check Blekko is not empty
				var blekList = {}
				blekList.RESULT = error.checkBlekko(results[12]);


				//create 100 result list check not empty
				var bingList = {};
				bingList.items = error.checkBing(bing1to50, bing51to100);


				//Concatenate Google results into an object with an array of 100 results
				var googList = {};
				googList.items = error.checkGoogle(goog1to10, goog11to20, goog21to30, goog31to40, goog41to50,
				                                   goog51to60, goog61to70, goog71to80, goog81to90, goog91to100);


				//In parallel normalise Urls and pre process snippets
				async.parallel([
					function (cb){
						//Normalize Urls
						norm.normUrl(googList, bingList, blekList, date);
						cb(null, true);
					},
					function (cb){
						if(toggleCluster === true){
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


				//Perform Url normalization + 2 aggregation functions in parellel
				async.parallel([
				    function(cbToMeta){
				    	//If google is the only engine to return results then it is the aggregated list
				    	if(googList.items.length > 0 && bingList.items.length  === 0 && blekList.RESULT.length === 0){
				    		cbToMeta(null, googList);
				    	}
				    	//If bing is the only engine to return results then it is the aggregated list
				    	else if (googList.items.length === 0 && bingList.items.length  > 0 && blekList.RESULT.length === 0){
				    		cbToMeta(null, bingList);
				    	}
				    	//If blekko is the only engine to return results then it is the aggregated list
				    	else if(googList.items.length === 0 && bingList.items.length  === 0 && blekList.RESULT.length > 0){
				    		var blekTmp = {};//aggreg list must be in the form {items:[]} so create tmp variable and put array in it then return
				    		blekTmp.items = blekList.RESULT;
				    		cbToMeta(null, blekTmp);
				    	}
				    	else if(googList.items.length === 0 && bingList.items.length  === 0 && blekList.RESULT.length  === 0){
				    		cbToMeta(null, {items:[]})
				    	}
				    	else{//Do the reciprocal rank fusion algorithm
				    	//Reciprocal Rank Fusion Agregation
				        recipRank.RRF(googList, blekList, bingList, cbToMeta);
				    	}
				    },
				    function(cbToMeta){
				    	//If google is the only engine to return results then it is the aggregated list
				    	if(googList.items.length > 0 && bingList.items.length  === 0 && blekList.RESULT.length === 0){
				    		cbToMeta(null, googList);
				    	}
				    	//If bing is the only engine to return results then it is the aggregated list
				    	else if (googList.items.length === 0 && bingList.items.length  > 0 && blekList.RESULT.length === 0){
				    		cbToMeta(null, bingList);
				    	}
				    	//If blekko is the only engine to return results then it is the aggregated list
				    	else if(googList.items.length === 0 && bingList.items.length  === 0 && blekList.RESULT.length > 0){
				    		var blekTmp = {};//aggreg list must be in the form {items:[]} so create tmp variable and put array in it then return
				    		blekTmp.items = blekList.RESULT;
				    		cbToMeta(null, blekTmp);
				    	}
				    	else if(googList.items.length === 0 && bingList.items.length  === 0 && blekList.RESULT.length  === 0){
				    		cbToMeta(null, {items:[]})
				    	}
				    	else{//Do combMNZ aggregation
				    	//CombMNZ Rank aggregation
				        combRank.combMNZ(googList, blekList, bingList, cbToMeta);
				    	}
				    },
				    function(cbToMeta){
				    	//If toggle cluster set to true and at least one search engine returns results
				    	if(toggleCluster === true && (bingList.items.length > 0 || googList.items.length > 0 || blekList.RESULT.length > 0)){
							try{
								cluster(googList, blekList, bingList, cbToMeta, false);
							}
							catch(e){
								console.log(e);
								console.log("Error Thrown in clustering");
								cbToMeta(null,false);								
							}
				    	}
				    	else{
				    		//If clustering is set to off return boolean false
				    		cbToMeta(null, false);
				    	}
				    }
				],
				function(err, results) {
					if(err)//If error print error
						console.log(err);
					else{
					    rrfRes = results[0];//RRF ranked list
					    combRes = results[1];//CombMNZ ranked list
					    clusterObj = results[2];//Cluster lists, names and silloute scores

					    if(originalQuery === "")//If orignal Query not empty put query into it to be sent to page
					    	originalQuery = Query;

					    //Objects to send to page
					    res.render('results.jade', 
						{
						 	title: 'Metasearch It Results',
						 	layout: false,
							googJson: googList,
							blekJson: blekList,
							bingJson: bingList,
							aggreg: rrfRes,
							aggreg2: combRes,
							clusterObj: clusterObj,
							ipinfoJson : ipinfo,
							time:(new Date() - date),
							isCalcBool : isCalcBool,
							Query: originalQuery,
							bingRelated: bingRelated,
							relatedWords: relatedWords,
							toggleCluster: toggleCluster,
							isQueryPrePro: isQueryPrePro
						});
					}
				});
			}
		});

	}
};


//Export metasearch from node_modules to app.js
exports.metaSearch = metaSearch;
