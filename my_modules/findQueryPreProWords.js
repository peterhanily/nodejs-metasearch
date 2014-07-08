var forEach = require('async-foreach').forEach;
var nounTest = require('./clustering/partOfSpeechAnalyzer').nounTest;//Noun test
var verbTest = require('./clustering/partOfSpeechAnalyzer').verbTest;//Verb Test


/**************************************
*Function is used in clustering.js file as that file does the tf-idf scores for docs
*This uses those scores to find words to rewrite the query
***************************************/

function queryRewriteWords (tokenUniqArr, uniqObjArr, cb){

   //Create a vaiable to store the combined tf-idf score of each term in all docs
   var wordScores = Array.apply(null, new Array(tokenUniqArr.length)).map(Number.prototype.valueOf,0);
   forEach(tokenUniqArr,//Uniq list of terms
      function(word, index, arr){
         forEach(uniqObjArr,//Uniq list of documents with tf-idf vectors
            function(item, itemIndex, itemArr){
               wordScores[index] += item.tfIdf[index];//create a tf-idf array with the combined scores of all tf-idf weights
            })
      })

   //Make 2 5 element arrays of 0's The first for scores second for Index positions in unique list of terms
   var top5WordsScore = [0, 0, 0, 0, 0];
   var top5WordsIndex = [0, 0, 0, 0, 0];
   for(var i = 0; i < 5; i++){
      for(var j = 0; j < tokenUniqArr.length; j++){
         //Get 5 highest scored words and test if word is noun
         if(wordScores[j] > top5WordsScore[i]  && (nounTest(tokenUniqArr[j]) === true || verbTest(tokenUniqArr[j]) === true )){
            top5WordsIndex[i] = j; //set index of term to be in top5Words array
            top5WordsScore[i] = wordScores[j]
            wordScores[j] = 0;//Set that score to be 0 so can continue to find next highest scores index's
         }
      }
   }

   //Use index positions to find words
   var top5Words = new Array(5);
   for(var i = 0; i < 5; i++){
      top5Words[i] = tokenUniqArr[top5WordsIndex[i]];//Make top 5 word position i which contains index of term the term
   }

   //Not really back to meta search here but back to query rewrite
   cb(null, top5Words.join(' '));
}

exports.queryRewriteWords = queryRewriteWords;