var async = require('async');
var forEach = require('async-foreach').forEach;
var math = require('mathjs');
var num = require("number-extended");

function popDistMatrix (docs, troids, distMatrix){

   forEach(troids,
      function(indivCen, index, arr){

         var indivCenVecLen = centroidNormVecLen(indivCen);

         forEach(docs,
            function(indivDoc, docIndex, arr){
               //Generate the cosine similarity between the document and all others
               //NOTE Very important to round the cosine similarity here as it may be a very small decimal number
               //Javascript has a problem with decimals like all programming languages due to binary numbers
               //num.round(arg, percision) rectifys this error as I found that the error is always the last digit
               distMatrix[index][indivDoc.position] = num.round(cosineSim(indivCen, indivDoc, indivCenVecLen),12);
               //Convert the coinse similariry to dist by using the formula Dist = 1 - cosineSim
               distMatrix[index][indivDoc.position] = 1 - distMatrix[index][indivDoc.position]; 
            });
      });

   return distMatrix;

}


//Function to find the cosine similarity between doc and centroid
function cosineSim(cen, doc, cenVecLen, theata){
   var cosineSimScore;
   var prodOf2Diems;
   var sumOfDiems = 0;
   for(var i = 0; i < cen.length; i++){
      prodOf2Diems = cen[i] * doc.tfIdf[i];
      sumOfDiems += prodOf2Diems;
   }
   cosineSimScore = sumOfDiems / (cenVecLen * doc.normVecLen);
   return cosineSimScore;
}


//Normalise centroid vector lengths
function centroidNormVecLen (centroid){

   var squaredWeights = [];
   var sum = 0;

   async.map(centroid,
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
   return math.sqrt(sum);
}


//Export the popDistMatrix function to be used in k-means.js
exports.popDistMatrix = popDistMatrix;
