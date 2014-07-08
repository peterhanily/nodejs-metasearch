//Require modules norm is temp
var async = require('async');
var forEach = require('async-foreach').forEach;//Async fucntion that gives you the index of the element
var num = require("number-extended");
var math = require('mathjs');
var kMeans = require('./kMeans');
var findRewriteWords = require('../findQueryPreProWords').queryRewriteWords;

function cluster (goog, blek, bing, cbToMeta, isQueryPrePro) {

   var blekLen = blek.RESULT.length;
   var bingLen = bing.items.length;  
   var googLen = goog.items.length;
   
   //Set blekko length
   if(blekLen <= 40 && blekLen > 0){
      //Do nothing
   }
   else if(blekLen != 0){
      blekLen = 40;
   }

   //set google length
   if(googLen <= 40 && googLen > 0){
      //Do nothing
   }
   else if(googLen != 0){
      googLen = 40;
   }

   //Set bing lentgth
   if(bingLen <= 40 && bingLen > 0){
      //do nothing
   }
   else if(bingLen != 0){
      bingLen = 40;
   } 

   //Create oject to store a uniqList
   var clustUniqs = {};

   //Create combinded unique list
   for(var i = blekLen -1; i >= 0; i--){
     /*Check if blekko has a snippet if it does add it
     if it doesn't we don't add it as it can't be clustered
     but this is why blekko's results are added first 
     as a bing or google result can replace it if they also reuturend it*/
     if(blek.RESULT[i].hasOwnProperty('tokenArr'))
        clustUniqs[blek.RESULT[i].url] = blek.RESULT[i];
   }
   for(var i = bingLen - 1; i >=0; i--){
     clustUniqs[bing.items[i].Url] = bing.items[i];
   }
   for(var i = googLen -1 ; i >= 0; i--){
     clustUniqs[goog.items[i].link] = goog.items[i];
   }


   //Convert unique object list  to unique array of objects
   //Create an attribute in each object of the array which stores in poisiton in the array
   uniqObjArr = [];
   var pos = 0
   for(var key in clustUniqs){
   	uniqObjArr.push(clustUniqs[key]);
      uniqObjArr[pos].position = pos;
      pos++
   }


   //Create a unique list of of terms
   var tokenUniqObj = {};
   //Do to all Unique objects
   forEach(uniqObjArr,
      function(item, index, arr) {
         //Do to all terms of Unique objects
         forEach(item.tokenArr,
            function(token, index, arr) {
               tokenUniqObj[token] = 1;
            });
      });


   //Create an array of Unique terms from the object keys
   var tokenUniqArr = Object.keys(tokenUniqObj);

   //Function to find raw Term frequency of Term in Documents
   //Then use this raw term frequency to calculate the termrequency logarithmic weights
   //using the formula (1 + log10(count))
   //Or 0 if the count is 0
   var countTermFreq = function(array, term) {
      var count = 0;
      for(var i = 0; i < array.length; i++){
         if(array[i] === term)
            count++;
      }
      if(count < 1)
         return 0;
      else
         return 1 + math.log(count,10);
   };

   //array to store docs to be spliced no terms in their tokenArr
   //These are usually the results which contain unicode characters such as chinese symbols
   var docsToSplice = [];

   //Create a new array in unique result objects called termFreq
   //Create a another new array for the tfIdf score later
   //Create an attribute to store the normalised vector length (for later when calculating cosine similarity)
   //Create an array in each object to hold the cosine similarity between it and every other object
   forEach(uniqObjArr,
      function(item, index, arr) {
         item.termFreq = new Array(tokenUniqArr.length);
         item.tfIdf = new Array(tokenUniqArr.length);
         item.termAppears = new Array(tokenUniqArr.length);
         item.normVecLen;
         item.cosineSimDists = new Array(uniqObjArr.length);
         if(item.tokenArr.length === 0)
            docsToSplice.push(index);
      });

   //In reverse order NOTE:very important in reverse order or else will remove wrong results as array indexes have change
   //splice items in array
   for(var i = docsToSplice.length - 1; i >= 0; i--){
      uniqObjArr.splice(docsToSplice[i], 1);
   }


   //array to store document frequency for each term
   var docFreq = new Array(tokenUniqArr.length);
   //Initialse all docment frequncy to 0
   for(var i = 0; i < docFreq.length; i++)
      docFreq[i] = 0;


   //Calculate logarithmic Term Frequency weights of all terms in all documents in parallel
   forEach(uniqObjArr,
      function(item, index, arr) {

         forEach(tokenUniqArr,
            function(token, index, arr) {
               var count = countTermFreq(item.tokenArr, token);
               var termPos = tokenUniqArr.indexOf(token);
               item.termFreq[termPos] = count;
               if(count > 0){
                  docFreq[termPos]++;
                  item.termAppears[termPos] = 1;
               }
               else
                  item.termAppears[termPos] = 0;
            });
      });   

   //Calculate Document frequency using log(N/df) formula in parellel
   var numOfDocs = uniqObjArr.length;
   async.map(docFreq,
      function(item, cb) {
         item = math.log((numOfDocs/item),10);
         cb(null, item);
      },
      function(err, results){
         if(err)
            console.log(err);
         else{
            docFreq = results;
         }
      });



   //Multiply doc Frequncy x term Frequncy for to get tf-idf scores
   //Do this for all documents and tokens in parellel 
   forEach(uniqObjArr,
      function(item, index, arr) {
         forEach(docFreq,
            function (point, pointIndex, pointArr){
            item.tfIdf[pointIndex] = point * item.termFreq[pointIndex];
         });
      });



   /********************************************************************************************************************************
   *If Query PreProcessing is true then I exit here
   *Using the tf-idf matrix on the snippets 
   *With the top weighted tf-Idf terms I will 
   *re do the search
   *********************************************************************************************************************************/
   if(isQueryPrePro === true){
      findRewriteWords(tokenUniqArr, uniqObjArr, cbToMeta)
   }
   /*************************************************************************************************************************************
   * END OF QUERT PRE PROCESSING SECTION (Below is rest of k-means clustering)
   **************************************************************************************************************************************/
   
   else{//Continue with k-means clustering
      //Normalise vector lengths
      forEach(uniqObjArr,
         function(item, index, arr) {

            var squaredWeights = [];
            var sum = 0;

            async.map(item.tfIdf,
               function(weight, cbInner) {
                  weight = weight*weight;
                  cbInner(null, weight)
               },
               function(err, result){
                  if(err)
                     console.log(err);
                  else{
                     squaredWeights = result;
                  }
               });

            for(var i = 0; i < squaredWeights.length; i++){
               sum += squaredWeights[i];
            }
            item.normVecLen = math.sqrt(sum);
         });



      //Function to find the cosine similarity between two objects
      function cosineSim(doc1, doc2){
         var cosineSimScore;
         var prodOf2Diems;
         var sumOfDiems = 0;
         for(var i = 0; i < doc1.tfIdf.length; i++){
            prodOf2Diems = doc1.tfIdf[i] * doc2.tfIdf[i];
            sumOfDiems += prodOf2Diems;
         }
         cosineSimScore = sumOfDiems / (doc1.normVecLen * doc2.normVecLen);
         return cosineSimScore;
      }


      //Find the cosine similarity between each Result object (document) between 0 (not similar) and 1 (the same)
      //Put these into an array within each object which holds the similarity between it
      //and every other object
      //The similarity between the object and itself will be 1 as they are identical
      forEach(uniqObjArr,
         function(item, index, arr){
            forEach(uniqObjArr,
               function(otherItem, index, arr){
                  //Generate the cosine similarity between the document and all others
                  item.cosineSimDists[otherItem.position] = num.round(cosineSim(item, otherItem), 12);
                  //Convert the coinse similariry to dist by using the formula Dist = 1 - cosineSim
                  item.cosineSimDists[otherItem.position] = num.round(1 - item.cosineSimDists[otherItem.position], 12); 
               });
         });


      //Range of k
      var kValues= [5,8,10];
      //Array to store objects returned by k means (cluster, clusterNames, silloutte scores)
      var collection = [ [[],[],[]] , [[],[],[]], [[],[],[]] ];
      //number of iteration (each number represents 1 iteration) so 1 to 5 = 5 iterations for each k value
      var iterations = [1,2];

      //Perform k means 9 times in parallel
      forEach(kValues,
         function (k, index, arr){
            forEach(iterations,
               function (iteration, iterateIndex, itArr) {
                  if(k === 5){
                     collection[0][iterateIndex] = kMeans.kMeans(k, uniqObjArr, docFreq, tokenUniqArr);
                  }
                  else if(k === 8)
                     collection[1][iterateIndex] = kMeans.kMeans(k, uniqObjArr, docFreq, tokenUniqArr);
                  else
                      collection[2][iterateIndex] = kMeans.kMeans(k, uniqObjArr, docFreq, tokenUniqArr);
               });
         });


      //Sort the array for each k value with the silloutte score 
      forEach(collection,
         function (indivArray, index, arr){
            indivArray.sort(function(a,b){return b.silloutteScore-a.silloutteScore});
         });

      var topClusters = {};
      topClusters.k5 = collection[0][0];
      topClusters.k8 = collection[1][0];
      topClusters.k10 = collection[2][0];

      console.log('Clustering complete');
      cbToMeta(null, topClusters);
   }
}

exports.cluster = cluster;
