//Require Modules
var async = require('async');
var forEach = require('async-foreach').forEach;
var computeCen = require('./computeCentroids');
var compareCen = require('./compareCentroids');
var genDistMatrix = require('./clusterDistanceMatrix');
var assign = require('./assignToClusters');
var find = require('./findClusterName');
var validate = require('./silloutte');

//K-Means function takes a k number an array of objects (docs) to be clustered
function kMeans (k, docs, docFreq, terms) {
   //Create an array size of k number of seeds for each cluster
   //The seeds will be documents selected at random
   var seeds = new Array(k);
   var tmpSeed;
   for(var i = 0; i < k; i++){
      tmpSeed = Math.floor(Math.random() * (docs.length -1));//Generate random seeds
      if(seeds.indexOf(tmpSeed) === -1)//Check if random number has already been used
         seeds[i] = tmpSeed
      else
         i--;//If random number has already been used try again
   }

   //Create function to create k number of arrays inside an array to store clustered objects
   function createClusterArrs(arr){
      for(var i = 0; i < k; i++){
         arr[i] = new Array();
      }
   }

   //Create an array to store cluster arrays
   var curClusters = new Array(k);
   createClusterArrs(curClusters);

   //Create an array to store k number of centroids
   var curCentroids = new Array(k);
   var prevCentroids = new Array(k);

   //Create array to store the distance matrix of the distances between all docs and each centroid
   var clustersDistMatrix = new Array(k);
   for(var i = 0; i < k; i++)
      clustersDistMatrix[i] = new Array(docs.length);


   //From seeds put documents first clusters
   forEach(docs,
      function(item, index, arr){
         var nearest = 1;
         var clustToAssign;
         var docToAsign;
         for(var i = 0; i < k; i++){
            //Assign object to the seed that it is closest too (dist = 0 for doc that is seed no cluster without 1 doc)
            if(item.cosineSimDists[seeds[i]] <= nearest){
               nearest = item.cosineSimDists[seeds[i]];
               docToAsign = seeds[i];
               clustToAssign = i;
            }
         }
         try{
            //Assign doc to seed cluster
            //Sometimes the document cannot be assigned to a cluster due there being
            //no unique terms in the snippet i.e all stop words or all special chars such as ࡱ
            //Splice this document and continue
            curClusters[clustToAssign].push(docs[docToAsign])
         }
         catch(e){
            docs.splice(item.position, 1);
         }
      });


   //Create new centroid vectors (mean of points in each cluster OR if cluster with 1 doc that docs cluster)
   curCentroids = computeCen.computeNewCentroid(curClusters, curCentroids);


   do{
      //Generate Distance Matrix of centroids to each document
      genDistMatrix.popDistMatrix(docs, curCentroids, clustersDistMatrix);

      //Clear cluster Arrays
      createClusterArrs(curClusters);

      //Assign docs to clusters
      assign.toCluster(k, docs, curClusters, clustersDistMatrix);

      //Clone Centroids
      prevCentroids = curCentroids.slice(0);

      //Compute new centroids
      curCentroids = computeCen.computeNewCentroid(curClusters, curCentroids);

   } while(compareCen.compareCentroids(curCentroids, prevCentroids) != true)



   //Create a name for clusters names
   var clusterNamesArr = new Array(curClusters.length);
   //Find the Names of the clusters 
   forEach(curClusters,
      function (cluster, index, arr){
         //Put cluster name in temporary variable
         var tmpName = find.clusterName(cluster, docFreq, terms);
         //If the cluster name function returns false this is an empty cluster remove it from the arrays
         if(tmpName === false){
            //Splice the position from the arrays
            clusterNamesArr.splice(index, 1);
            curClusters.splice(index, 1);
         }
         //else set the name to be 
         else
            clusterNamesArr[index] = tmpName;
      });


   //Test clusters validity by getting its silloutte score
   var silloutteScore = validate.silloutte(curClusters, docs);
   
   var kmeansObj = {
      silloutteScore: silloutteScore,
      clusters: curClusters,
      clusterNames: clusterNamesArr
   };

   return kmeansObj;
}

exports.kMeans = kMeans;