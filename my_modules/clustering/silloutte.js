var async = require('async');
var forEach = require('async-foreach').forEach;

/***************************************************************************************************************
*Silloutte coefficent measures both seperation and cohesion
*formula => SilloutteCoeff = (bi - ai) /max{ai,bi}
*Source: https://docs.google.com/viewer?url=http%3A%2F%2Fwww-users.cs.umn.edu%2F~kumar%2Fdmbook%2Fch8.pdf , Page 55/56
*by getting the silloute score for each document we can the average those find the measure of how well the data
*was clustered
****************************************************************************************************************/

function silloutte (clusters, docs) {
	//Average silloutte score
	var avgSilloute = 0;

	//For all docs (async)
	forEach(docs,
		function (indivDoc, docIndex, allDocs) {

			//Average distance to its cluster
			var avgDistToSameClust = 0;
			//Other cluster
			var avgDistsToOtherClusts = Array.apply(null, new Array(clusters.length)).map(Number.prototype.valueOf,0);
			//Docs silloutte scroe
			var sillCoeff = 0;

			//For all clusters
			forEach(clusters,
				function (indivCluster, clustIndex, allClusts) {

					var docInThisClust = false;//Boolean set to true if doc in the cluster being tested
					//Async function to see if the current document is one of the documents in the cluster
					forEach(indivCluster,
						function (docsInClust, docsInClustIndex, allDocsInClust){
							if(indivDoc.position === docsInClust.position)
								docInThisClust = true;
						});

					//If this is the documents cluster
					if(docInThisClust === true){

						//Find the average disimalrity to other documents in its own cluster (ai)
						forEach(indivCluster,
							function (docsInClust, docsInClustIndex, allDocsInClust){
								avgDistToSameClust += indivDoc.cosineSimDists[docsInClust.position];
							});

						//Get the average distance to its own cluster
						avgDistToSameClust = avgDistToSameClust / indivCluster.length;
						avgDistsToOtherClusts[clustIndex] = 'Docs Cluster';//Set that to the docs own cluster
					}
					//If the doc is not in this cluster
					else{

						//If this is not the docs cluster find the avergae similarity to docs in other clusters (bi)
						forEach(indivCluster,
							function (docsInClust, docsInClustIndex, allDocsInClust){
								avgDistsToOtherClusts[clustIndex] += indivDoc.cosineSimDists[docsInClust.position];
							});

						avgDistsToOtherClusts[clustIndex] = avgDistsToOtherClusts[clustIndex] / indivCluster.length;
					}
				});
	
			//smallest Dist to other cluster started at 1 (the max distance)
			//for loop through variables if smaller(closer) dist is found that is the most similar
			var smallestDistToOtherClust = 1;
			for(var i = 0; i < clusters.length; i++){
				if(avgDistsToOtherClusts[i] < smallestDistToOtherClust)
					smallestDistToOtherClust = avgDistsToOtherClusts[i];
			}

			//If the distances do not eqaul each other find the silloute score using the formula 
			if(avgDistToSameClust != smallestDistToOtherClust )
				sillCoeff = (smallestDistToOtherClust - avgDistToSameClust) / Math.max(avgDistToSameClust, smallestDistToOtherClust);
			else//If the distnaces are equal to each other it is 0
				sillCoeff = 0

			//Add this docs silloute coeff to the avg silloute
			avgSilloute += sillCoeff;
		});
	
	//get the average silloute score by divding the sum of each docs silloute score
	//by the amount of documents
	avgSilloute = avgSilloute / docs.length;
	return avgSilloute;
}

exports.silloutte = silloutte;