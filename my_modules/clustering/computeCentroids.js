var forEach = require('async-foreach').forEach;


function computeNewCentroid(allClusters, troids) {


	forEach(allClusters,
		function(indivCluster, index, arr){
			if(indivCluster.length > 1){
				//vector array to be same length as other vector lengths initalise with 0's
				var newCentroidVec = Array.apply(null, new Array(indivCluster[0].tfIdf.length)).map(Number.prototype.valueOf,0);
				for(var i = 0; i < newCentroidVec.length; i++){//For each point in vector
					for(var j = 0; j < indivCluster.length; j++){//For each doc in cluster
						newCentroidVec[i] += indivCluster[j].tfIdf[i];//add all the points of the vector
					}
					newCentroidVec[i] = newCentroidVec[i] / indivCluster.length;//divide by the length of cluster
				}
				troids[index] = newCentroidVec;
			}
			else{
				if(indivCluster.length > 0)
					troids[index] = indivCluster[0].tfIdf;
			}
		});

	return troids;
}


exports.computeNewCentroid = computeNewCentroid;


