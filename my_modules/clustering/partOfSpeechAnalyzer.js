//Require part of speech module (POS)
var pos = require('pos');

//This function tests if the term is a noun
//If it is it returns true else it returns false
//This uses the part of speech database from the wordnet database
//created by princeton university http://wordnet.princeton.edu/
function nounTest (term){
	var partOfSpeech;

	//First need to lex the term
	var words = new pos.Lexer().lex(term);

	//Then tag the term
	var taggedWords
	try{
		taggedWords = new pos.Tagger().tag(words);
	}
	catch(e){
		return false;
	}

	//The part of speech stored in a multidiemsional array [0][1]
	partOfSpeech = taggedWords[0][1];
	//If the part of speech matches the 4 different types of nouns
	if(partOfSpeech === 'NNP' || partOfSpeech === 'NNPS' || partOfSpeech === 'NNS' || partOfSpeech === 'NN'){
		return true;
	}
	else
		return false;
}

//Test if verb adverb or adjective 
function verbTest (term){
	var partOfSpeech;
	//First need to lex the term
	var words = new pos.Lexer().lex(term);
	//Then tag the term
	var taggedWords = new pos.Tagger().tag(words);
	//The part of speech stored in a multidiemsional array [0][1]
	partOfSpeech = taggedWords[0][1];
	//If the part of speech matches the different types of verbs
	if(partOfSpeech === 'VB' || partOfSpeech === 'VBD' || partOfSpeech === 'VBG' || partOfSpeech === 'VBN'
	   || partOfSpeech === 'VBP' || partOfSpeech === 'VBZ' || partOfSpeech === 'JJR' || partOfSpeech === 'JJS'
	   || partOfSpeech === 'RBR' || partOfSpeech === 'RBS'){
		return true;
	}
	else
		return false;
}


//Export function to be used in findClusterName moduel && in the cluster module (when query is being preprocessed)
exports.nounTest = nounTest;
exports.verbTest = verbTest;
