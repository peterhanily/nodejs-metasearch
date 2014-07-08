var async = require('async');
var forEach = require('async-foreach').forEach;
var noun = require('./partOfSpeechAnalyzer');
var math = require('mathjs');
var jquery = require('jquery');

function clusterName (cluster, docFreq, terms){
	
	if(cluster.length == 0)
	{
		return "Empty";
	}

	//Array to store Document frequency of terms in cluster
	//Initialze array with 0
	var clusterDocFreq =  Array.apply(null, new Array(terms.length)).map(Number.prototype.valueOf,0);

	//
	forEach(cluster, 
		function(doc, docIndex, allDocs) {
			var pos;
			forEach(terms,
				function (term, termIndex, allTerms){
					//Check if the tfIdf weight is greater than 0 i.e it appears and that it is a noun
					if(doc.tfIdf[termIndex] > 0 && noun.nounTest(term)){
							clusterDocFreq[termIndex] += doc.tfIdf[termIndex];
						}
				});
		});

	var highestDF =0;
	var highestDFTerm;
	//Find term with highest tf-idf score
	//This will be the word that describes the cluster
	forEach(clusterDocFreq,
		function(df, index, arr){
			if(df > highestDF){
				highestDF = df;
				highestDFTerm = index;
			}
		});

	try{
		//Test if cluster name has length
		//If it doesn't it is undefined
		terms[highestDFTerm].length;
	}
	catch(e){
		//if cluster does not have a name it is an empty cluster so return false
		return false;
	}
	//If the word is a parial word due to preprocessing
	//This regex will find the full version of the word in the snippet
	//gi in regex means "g" search globally and "i" is ignore case which is very important here
	//due to stemming words that end with rry e.g jerry change to jerri if the words remove the i
	if(terms[highestDFTerm][terms[highestDFTerm].length - 1] === 'i')
		var regex = new RegExp(terms[highestDFTerm].slice(0, terms[highestDFTerm].length - 1) + '\\w*', 'gi');
	else
		var regex = new RegExp(terms[highestDFTerm] + '\\w*', 'gi');

	//Variable to store full word
	var fullTerm;

	//In parallel go through each doc and if the doc has that word (it will be > 0 in that words tfIdf position)
	//Assign the word match in the snippet
	forEach(cluster,
		function (doc, index, arr) {
			if(doc.tfIdf[highestDFTerm] > 0)
				//Google uses link for url
				if(doc.hasOwnProperty('link'))
					fullTerm = doc.snippet.toLowerCase().match(regex);
				else if(doc.hasOwnProperty('url'))
					//During preporcessing I left the main blekko snippet alone and used the string copy instead
					fullTerm = doc.strSnippet.toLowerCase().match(regex);
				//Bing snippets have the name Description
				else if(doc.hasOwnProperty('Description'))
					fullTerm = doc.Description.toLowerCase().match(regex);
		});

	//use jquery function to see if if object is empty 
	//If it is return the term if not return the parital as it is already a full word
	if(jquery.isEmptyObject(fullTerm) != true){
		return String(fullTerm[0]);
	}
	else{
		return terms[highestDFTerm];
	}
}

//Export function so it can be used in other modules
exports.clusterName = clusterName;
