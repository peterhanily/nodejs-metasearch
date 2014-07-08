var forEach = require('async-foreach').forEach;

function compareCentroids(newCen, oldCen) {

	forEach(newCen,
		function (centroid, index, arr){
			for(var i = 0; i < centroid.length; i++){
				if(centroid[i] != oldCen[index][i])
					return false;
			}
		});

	return true;
}

exports.compareCentroids = compareCentroids;