var natural = require('natural');
var tokenizer = new natural.WordTokenizer();
var async = require('async');
var stopWords = require('./stopWords').stopWordList;
var forEach = require('async-foreach').forEach;

var natLangPrePro = function(goog, bing, blek){


  async.parallel([
      function(cb){
        if(blek.RESULT.length != undefined){
          //Copy Blekko snippets and remove HTML parts from copy
          forEach(blek.RESULT,
            function(item, index, arr) {
              if(item.hasOwnProperty('snippet'))
                item.strSnippet = item.snippet.replace(/(<([^>]+)>)/g, '')
                                              .replace(/&#?[a-zA-Z0-9]+;/g, '');
            });
        }
        cb(null, true);
      },
      function(cb){
        if(bing.items.length != undefined){
          //Bing does not give a description for all websites if the warning message appears set it to empty string ""
          forEach(bing.items,
            function(item, index, arr) {
              if(item.Description === 'We would like to show you a description here but the site won’t allow us.')
                bing.items.Description = ""
            });
        }
        cb(null, true);
      },
      function(cb){
        if(goog.items.length != undefined){
          //Google also does not give a snippet for some sites and gives a warning message like bing set this to be an empty string
          forEach(goog.items,
            function(item, index, arr) {
              if(item.snippet === "A description for this result is not available because of this site's robots.txt - learn more")
                goog.items.snippet = "";
            });
        }
        cb(null, true);
      }
  ],
  function(err, results) {
    if(err)
      console.log(err);
  });




  //Tokenize all google, bing and, blekko snippets at same time
  async.parallel([
  	//1.Google
    function(callback){
      if(goog.items.length != undefined){
        //Tokenise snippets items in object array at same time
        forEach(goog.items,
          function(item, index, arr){
            item.tokenArr = tokenizer.tokenize(item.snippet.toLowerCase());
            //Remove all stop words for tokenized array
            forEach(stopWords, 
            	function(stpWrd, index, arr) {
            		for(var i = 0; i < item.tokenArr.length; i++){
            			if(stpWrd === item.tokenArr[i]){
            				item.tokenArr.splice(i,1);
            			}
            		}
            	});

            forEach(item.tokenArr, 
              function(term, index, arr) {
                natural.PorterStemmer.stem(term);
              });

          });
      }
        callback(null, true);
    },
    //2.Bing
    function(callback){
      if(bing.items.length != undefined){
        //Tokenise snippets items in object array at same time
        forEach(bing.items,
          function(item, index, arr){
            item.tokenArr = tokenizer.tokenize(item.Description.toLowerCase());
            //Remove all stop words for tokenized array
            forEach(stopWords, 
            	function(stpWrd, index, arr) {
            		for(var i = 0; i < item.tokenArr.length; i++){
            			if(stpWrd === item.tokenArr[i]){
            				item.tokenArr.splice(i,1);
            			}
            		}
            	});

            forEach(item.tokenArr, 
              function(term, index, arr) {
                natural.PorterStemmer.stem(term);
              });

          });
      }
        callback(null, true);
    },
    //3.Blekko
    function(callback){
      if(blek.RESULT.length != undefined){
        //Tokenise snippets items in object array at same time
        forEach(blek.RESULT,
          function(item, index, arr){
            if(item.hasOwnProperty('snippet')){
  	          item.tokenArr = tokenizer.tokenize(item.strSnippet.toLowerCase());
  	          //Remove all stop words for tokenized array
  	          forEach(stopWords, 
  	          	function(stpWrd, index, arr) {
  	          		for(var i = 0; i < item.tokenArr.length; i++){
  	          			if(stpWrd === item.tokenArr[i]){
  	          				item.tokenArr.splice(i,1);
  	          			}
  	          		}
  	          	});

            forEach(item.tokenArr, 
              function(term, index, arr) {
                natural.PorterStemmer.stem(term);
              });

            }
          });
      }
      callback(null, true);
    }
    ],
    function(err, results){
      if(err)//check for error
        console.log(err);
      else{
          console.log('Natural Language PreProcessed Successfully');
        }
    });
};

exports.natLangPrePro = natLangPrePro;