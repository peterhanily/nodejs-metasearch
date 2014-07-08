/*
The purpose of this module is to error check the results returned
by each of the search engines and modulise it from the metasearch module to make it easier to read.
Reasons for errors may include queries being too abstrat and returing no results
For bing and google results may be returned by as they concatonate lists
if one is empty this can throw an erro and crash the program
*/

function checkGoogle (goog1, goog2, goog3, goog4, goog5, goog6, goog7, goog8, goog9, goog10) {
	//Create a temp array of all objects
	var tmpArr = [goog1, goog2, goog3, goog4, goog5, goog6, goog7, goog8, goog9, goog10];
	//Array to store array
	var googArr = [];

	//Loop Through each object test if it is not undefined if not concat to googArr
	for(var i =0; i < 10; i++){
		try{
			if(tmpArr[i].items.length != undefined)
				//Concat method creates a new array so this is the only option for looping concat
				googArr = googArr.concat(tmpArr[i].items);
		}
		catch(e){
			//Print error
			console.log(e);
		}
	}

	//Return goog Array
	return googArr;
}

function checkBing (bing1, bing2) {
	var bingArr;
	try{
		//Concatenate Bing results into an object with an array of 100 results
		bingArr = bing1.d.results.concat(bing2.d.results);
		return bingArr;
	}
	catch(e){
		try{
			//If there was an error concationation has failed as bing51to100 has no results
			bingArr = bing1.d.results;
			//Test if it has length if not it will be undefined and throw error
			bingArr.length;
			//if it does have a length return list
			return bingArr;
		}
		catch(e){
			//Print error
			console.log(e);
			//catch error return empty array
			return [];
		}
	}	
}



function checkBlekko (blek) {
        //In case someone abuses blekkos
        //api conditions and it returns nothing
        //or Query returns no results as can sometimes happen catch error
        try{
                var blekList = JSON.parse(blek);
                //Test if the list is empty
                blekList.RESULT.length;
                return blekList.RESULT;
        }
        catch(e) {
                //If the list is empty return empty arrayS
                console.log(e);
                return [];
        }
}


//Export functions so they can be used in metasearch module
exports.checkGoogle = checkGoogle;
exports.checkBing = checkBing;
exports.checkBlekko = checkBlekko;
