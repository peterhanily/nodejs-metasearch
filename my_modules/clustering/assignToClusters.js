var forEach = require('async-foreach').forEach;

function toCluster (k, docs, clusters, distMatrix){
   //From the distance martix computed from the distance to new centroids
   //put documents into the new clusters
   forEach(docs,
      function(item, index, arr){
         var nearest = 1;
         var clustToAssign;
         for(var i = 0; i < k; i++){
            //Assign object to the seed that it is closest too (dist = 0 for doc that is seed no cluster without 1 doc)
            if(distMatrix[i][item.position] <= nearest){
               nearest = distMatrix[i][item.position];
               clustToAssign = i;
            }
         }
         clusters[clustToAssign].push(item);//assign doc to cluster
      });
}

exports.toCluster = toCluster;