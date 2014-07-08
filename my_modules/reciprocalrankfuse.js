//import async module
var async = require('async');


//Enclose inside function so it can be exported as one piece
var RRF = function(goog, blek, bing, cbToMeta) { 


  //set lengths
  var blekLen = blek.RESULT.length;
  var bingLen = bing.items.length;
  var googLen = goog.items.length;


  //Do 5 functions in Parell
  async.parallel([
      //1.Assign Google Scores
      function(callback){
        if(googLen > 0){
          for(var i = 0; i < googLen; i++)
              goog.items[i].rrfScore = ((1/(60 + (i+1))) * .8);
        }
        callback(null, goog);
      },
      //2.Assign Bing Scores
      function(callback){
        if(bingLen > 0){
          for(var i = 0; i < bingLen; i++)
              bing.items[i].rrfScore = ((1/(60 + (i+1))) * 6);
        }

        callback(null, bing);      
      },
      //3.Assign Blekko Scores
      function(callback){
        if(blekLen > 0){
          for(var i = 0; i < blekLen; i++)
              blek.RESULT[i].rrfScore = ((1/(60 + (i+1))) * 4);
        }
        
        callback(null, blek);
      },
      
      //4. Create Uniq list of Results (remove duplicates)
      //aslo gives positions in other list e.g if blekko object has google and bing positions
      function(callback) {
          var rrfUniqs = {};
          var comb = {};
          var googBool = true;

          if(googLen > 0){ 
            if(blekLen > 0 && bingLen > 0)
               comb.items = goog.items.concat(bing.items.concat(blek.RESULT));
            else if(bingLen > 0)
               comb.items = goog.items.concat(bing.items);
            else if(blekLen > 0)
                  comb.items = goog.items.concat(blek.RESULT);
          }
          else{
            if(blekLen > 0 && bingLen > 0)
               comb.items = bing.items.concat(blek.RESULT);
            googBool = false
          }

          //Create array the length of combined concat arrays
          //This will be used to store the URL's so the can be looked up to find the first(highest scored occurance)
          var parArr = new Array(comb.items.length);

          if(googBool === true){
            for(i = googLen -1 ; i >= 0; i--){
              //array key is url = object at that position
              rrfUniqs[comb.items[i].link] = comb.items[i];
              //Parell array at position has string of the url
              parArr[i] = comb.items[i].link;
            }
          }
          for(i = (googLen + bingLen - 1); i >= googLen; i--){
            //array key is url = object at that position
            rrfUniqs[comb.items[i].Url] = comb.items[i];
            //Position of this result in google results if -1 no there
            if(parArr.indexOf(comb.items[i].Url) < googLen)
              rrfUniqs[comb.items[i].Url].googPos = parArr.indexOf(comb.items[i].Url);
              //Add to Parell array at this position 
              parArr[i] = comb.items[i].Url;
          }
          for(i = (googLen + bingLen + blekLen -1); i >= (googLen + bingLen); i--){
            //array key is url = object at that position
            rrfUniqs[comb.items[i].url] = comb.items[i];
            //Position of this result in google results if -1 no there
            if(parArr.indexOf(comb.items[i].url) < googLen )
              rrfUniqs[comb.items[i].url].googPos = parArr.indexOf(comb.items[i].url);
            else
              rrfUniqs[comb.items[i].url].googPos = -1;
            //Position of this result in bing results if -1 no there
            if(parArr.indexOf(comb.items[i].url, googLen) >= googLen
            && parArr.indexOf(comb.items[i].url, googLen) < (googLen + bingLen)
            )
              rrfUniqs[comb.items[i].url].bingPos = parArr.indexOf(comb.items[i].url, googLen) - googLen;
            else
              rrfUniqs[comb.items[i].url].bingPos = -1;
          }
          callback(null, rrfUniqs);
        }
    ],
    function(err, results) {
      if(err)
        console.log(error);
      else {   
         var goog = results[0];//Google scores
         var bing = results[1];//bing socres
         var blek = results[2];//blekko scores
         var rrfUniqs = results[3];//unique list of results
         var bingposition, googposition;//temp bing and goolge position
         var rrfPreSortAggregList = {};
         rrfPreSortAggregList.items = [];

         //Convert unique object list to unique array
         for(var key in rrfUniqs){
            rrfPreSortAggregList.items.push(rrfUniqs[key]);
         }

         async.map(rrfPreSortAggregList.items,
          function(item, cbAddRrfScore) {

            if(item.hasOwnProperty('googPos')){
               googposition = item.googPos;
               if(googposition > -1)
                  item.rrfScore += goog.items[googposition].rrfScore;

               if(item.hasOwnProperty('bingPos')){
                  bingposition = item.bingPos;
                  if(bingposition > -1)
                     item.rrfScore += bing.items[bingposition].rrfScore;
               }
            }
            cbAddRrfScore(null, item);
          },
          function(err, results) {
            if(err)
              console.log(err);
            else{
              rrfPreSortAggregList.items = results
              var rrfAggregList = {};
              rrfAggregList.items = rrfPreSortAggregList.items.sort(function(a,b){return b.rrfScore-a.rrfScore});
              console.log('RRF Aggregation complete');
              cbToMeta(null, rrfAggregList);
            }
          });
        }
    });
};

//Allow function to be used in app.js
exports.RRF = RRF;