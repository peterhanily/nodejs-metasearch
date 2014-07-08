//Require async module
var async = require('async');


//Start CombMNZ rand aggregation function
var combMNZ = function(goog, blek, bing, cbToMeta) {

  //set lengths
  var blekLen = blek.RESULT.length;
  var bingLen = bing.items.length;
  var googLen = goog.items.length;

//COMB MNZ WITH RANK combScoreS
async.parallel([
    function(callback){//ASSIGN GOOGLE combScoreS
      if(googLen > 0){
        for(var i = 0; i < googLen; i++)
            goog.items[i].combScore = (1 - (((i+1) - 1)/(googLen)));
      }
      callback(null, goog);
    },
    function(callback){//ASSIGN BING combScoreS
      if(bingLen > 0){
        for(var i = 0; i < bingLen; i++)
            bing.items[i].combScore = (1 - (((i+1) - 1)/(bingLen)));
      }
      callback(null, bing);      
    },
    function(callback){//ASSIGN BLEKKO combScoreS
      //SOMETIMES BLEKKO DOES NOT RETURN ANY RESULTS
      if(blekLen > 0){
        for(var i = 0; i < blekLen; i++)
            blek.RESULT[i].combScore = (1 - (((i+1) - 1)/(blekLen)));
      }
      callback(null, blek);
    },
    function(callback) {
         var combUniqs = {};
         var combination = {};
         var i;
         var googBool = true;

        if(googLen > 0){ 
          if(blekLen > 0 && bingLen > 0)
            combination.items = goog.items.concat(bing.items.concat(blek.RESULT));
          else if(bingLen > 0)
            combination.items = goog.items.concat(bing.items);
          else if(blekLen > 0)
            combination.items = goog.items.concat(blek.RESULT);
        }
        else{
          if(blekLen > 0 && bingLen > 0)
            combination.items = bing.items.concat(blek.RESULT);
          googBool = false
        }

        //Create array the length of combined concat arrays
        //This will be used to store the URL's so the can be looked up to find the first(highest scored occurance)
        var parArr = new Array(combination.items.length);

        if(googBool === true){
          for(i = googLen-1 ; i >= 0; i--){
            //array key is url = object at that position
            combUniqs[combination.items[i].link] = combination.items[i];
            //Parell array at position has string of the url
            parArr[i] = combination.items[i].link;
          }
        }
        for(i = (googLen + bingLen - 1); i >= googLen; i--){
          //array key is url = object at that position
          combUniqs[combination.items[i].Url] = combination.items[i];
          //Position of this result in google results if -1 no there
          if(parArr.indexOf(combination.items[i].Url) < googLen)
            combUniqs[combination.items[i].Url].googPos = parArr.indexOf(combination.items[i].Url);
            //Add to Parell array at this position 
            parArr[i] = combination.items[i].Url;
        }
        for(i = (googLen + bingLen + blekLen -1); i >= (googLen + bingLen); i--){
          //array key is url = object at that position
          combUniqs[combination.items[i].url] = combination.items[i];
          //Position of this result in google results if -1 no there
          if(parArr.indexOf(combination.items[i].url) < googLen )
            combUniqs[combination.items[i].url].googPos = parArr.indexOf(combination.items[i].url);
          else
            combUniqs[combination.items[i].url].googPos = -1;
          //Position of this result in bing results if -1 no there
          if(parArr.indexOf(combination.items[i].url, googLen) >= googLen
          && parArr.indexOf(combination.items[i].url, googLen) < (googLen + bingLen)          )
            combUniqs[combination.items[i].url].bingPos = parArr.indexOf(combination.items[i].url, googLen) - googLen;
          else
            combUniqs[combination.items[i].url].bingPos = -1;
          
        }

         callback(null, combUniqs);
    }
  ],
  function(err, results) {
    if(err)
      console.log(error);
    else{   
     var goog = results[0];
     var bing = results[1];
     var blek = results[2];
     var combUniqs = results[3];
     var bingposition, googposition;
     var combPreSortAggregList = {};
     combPreSortAggregList.items = [];

     for(var key in combUniqs){
        combPreSortAggregList.items.push(combUniqs[key]);
     }

     async.map(combPreSortAggregList.items,
      function(item, cbAddScore) {

        if(item.hasOwnProperty('googPos')){
           googposition = item.googPos;
           if(googposition > -1){
              item.combScore += goog.items[googposition].combScore;
              item.combScore *= 2;
           }

           if(item.hasOwnProperty('bingPos')){
              bingposition = item.bingPos;
              if(bingposition > -1 && googposition > -1){
                 item.combScore = item.combScore / 2
                 item.combScore += bing.items[bingposition].combScore;
                 item.combScore *= 3;
              }
              else if(bingposition > -1){
                item.combScore += bing.items[bingposition].combScore;
               item.combScore *= 2;
              }
           }
        }

        cbAddScore(null, item);
      },
      function(err, results) {
         combPreSortAggregList.items = results;
         var combAggregList = {};
         combAggregList.items = combPreSortAggregList.items.sort(function(a,b){return b.combScore-a.combScore});    
         console.log('combMNZ Aggregation complete');
         cbToMeta(null, combAggregList);
      });
    }
  });

};

exports.combMNZ = combMNZ;