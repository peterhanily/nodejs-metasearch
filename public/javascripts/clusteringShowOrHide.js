/*********************************
*This is the right panel and left panel
*show and hide options for the clustering display
*if a user clicks mor or less topics the clustersShowDiv
*function is called 
*If a user clicks to show a topic the showTopics function is triggered
**********************************/


function showTopics(toShow, curDiv){
  $(curDiv).hide();
  $(toShow).show();
}


function clustersShowDiv(divNum, topicDiv){

  if(topicDiv === '#fiveTopics'){
    $('#cluster5').hide();
    $('#cluster8').hide();
    $('#cluster10').hide();
    $('.clusterBox').hide();
    $('.resultClustBox').hide();
    $('#cluster5').hide();
    $('#cluster5').show();
    $('#cluster5Topic' + divNum).show();
    $('.resultClustBox').show();  
  }
  else if(topicDiv === '#eightTopics'){
    $('#cluster5').hide();
    $('#cluster8').hide();
    $('#cluster10').hide();
    $('.clusterBox').hide();
    $('.resultClustBox').hide();
    $('#cluster8').hide();
    $('#cluster8').show();
    $('#cluster8Topic' + divNum).show();
    $('.resultClustBox').show();
  }
  else if(topicDiv === '#tenTopics'){
    $('#cluster5').hide();
    $('#cluster8').hide();
    $('#cluster10').hide();
    $('.clusterBox').hide();
    $('.resultClustBox').hide();
    $('#cluster10').hide();
    $('#cluster10').show();
    $('#cluster10Topic' + divNum).show();
    $('.resultClustBox').show();
  }
}