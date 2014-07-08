//require modules
var async = require('async');
var request = require('request');
var metasearch = require('./metaSearch');

//enclose functionality in function so it can be exported as one piece
var preProcess = function (res, Query, clientIp, toggleCluster, date, isQueryPrePro, preProComplete, originalQuery) {

	//Do Query preprocessing 3 versions in parellel + check if its a calculation
	async.parallel([
		//1.Bing Preprocessing
		function (callback) {
			var bingQry = Query.replace(/\s{2,}/g, ' ');//remove 2 or more spaces together
				bingQry = encodeURIComponent(bingQry);//Encode query
			callback(null, bingQry );
		},
		//2.Bellko preprocessing
		function (callback) {
			var blekQry = Query.replace(/OR/g, ' ')//Remove OR
			                   .replace(/\*/g, ' ')//Remove wildcard
			                   .replace(/AND/g, ' ')//Remove AND
			                   .replace(/\s{2,}/g, ' ');//Remove 2 or more spaces together

			if(Query.match(/NOT/g)){//If query has NOT edit to fit Blekko "tiger" -woods format etc
				var blekTmp = blekQry.match(/^.*NOT/g);
				blekQry = blekQry.replace(/^.*NOT/g, '"' + blekTmp + '" -');
				blekQry = blekQry.replace(/NOT\s{0,}/g, '');
				blekQry = blekQry.replace(/\s{0,}\"/g, '"');
				blekQry = blekQry.replace(/\-\s{0,}/g, '-');
			}

			blekQry = encodeURIComponent(blekQry);//Encode Query
			callback(null, blekQry);
		},
		//3.Google Preprocessing
		function (callback) {
			if(Query.match(/AND/g) === true){//If the query has AND use tiger "woods" format instead of old google version + operator
				var googQry = Query.replace(/AND\s*/g, '"')
								   .replace(/\s{0,}\"/g, '" "')
								   .replace(/$/g, '"')
								   .replace(/\"/g, '');
			}
			var googQry = Query.replace(/NOT\s{0,}/g, '-')//Replace Not and spaces with "-"
							   .replace(/AND/g, ' ')//Remove AND
			                   .replace(/\s{2,}/g, ' ')//Remove extra spaces
			googQry = encodeURIComponent(googQry);//Encode Query
			callback(null, googQry);

		},
		//4.Check if Query is maths expression
		function (callback) {
    		var isCalcBool = true;
    		if(Query.match(/[^x\+\/\-\*\d\s\)\(\.]/g))//if the query contains expressions beside */+x- or numbers set is calc off
      			isCalcBool = false;

			//If its still a calculation turn query pre processing off
      		//as its a maths expression so it is not needed due to calculator
      		if(isCalcBool)
      			isQueryPrePro = false

      		callback(null, isCalcBool);
		}],
		//Callback function to collect results and pass to next module
		function(err, results) {
			if(err) {
				console.log('ERROR In QueryPreProcessing');
			}
			else{
			var bingQuery = results[0];
			var blekQuery = results[1];
			var googQuery = results[2];
			var isCalcBool = results[3];

			//Pass variables to metasearch module
			metasearch.metaSearch(res, bingQuery ,googQuery, blekQuery,
								  clientIp, date, isCalcBool, Query, toggleCluster, isQueryPrePro, preProComplete, originalQuery);
			}
	});
};

//Export preProcess module
exports.preProcess = preProcess;