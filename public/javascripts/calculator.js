/*************************************************************************************************
*This is the script that controls how the characters in the in the calculator can be put together
*for exampe 10 + 10 is ok but 10 ---------10 would not be allowed. When the user pushes a button the addDig()
*function is triggered
*the clear all function removes the memory and sets the calculator back to a fresh state
*The jquery drag method is applied to the calbox div
*The socketCalc() function is triggered when the user presses equals this sends the memory to the server
*using socket.io and a response is retrieved and displayed for the user
*Toggle vis changes the calculators visibility to hidden or shown aswell as changing the button to Show or Hide calculator
**************************************************************************************************/



var MAXLEN = 40;
var memory = "";
var lastDig = "0";
var numBool;
var click = 0;

function addDig(dig) {

    click++;
    if((click === MAXLEN && dig.match(/\d/) ===null) || (dig ==="." && memory.match(/\.\d*$/))){
        return 0;
    }
    
    if(memory === "" && dig.match(/\)/))
        return 0;
    
    if(lastDig === ")" && (dig === "+" || dig === "-" || dig === "/" || dig === "*")){
        memory += " " + dig + " " ;
        if(click <= MAXLEN){
            document.getElementById("display").innerHTML = memory;
            lastdig = dig;
        }
            
    }
    
    if(lastDig === "%" && (dig === "+" || dig === "-" || dig === "/" || dig === "*")){
        memory += " " + dig + " ";
        
        if(click <= MAXLEN){
         document.getElementById("display").innerHTML = memory;
         lastDig = dig;
         return 0;
        }
    }
    
    if(lastDig === "%" && dig.match(/\d/))
        memory += " * " + dig;
        
    
    if((lastDig.match(/\d/) === null && dig.match(/\d/) === null && memory != ""))
        return 0;     
       
    if(memory === "" && (dig === "%" || dig === "+" || dig === "-" || dig === "/" || dig === "*" || dig === ".")) {
        memory = "0" + dig + " ";
    }
    else if(dig === "+" || dig === "-" || dig === "/" || dig === "*")
        memory += " " + dig + " ";
        
    else
        memory += dig;
      
    if(click <= MAXLEN)
         document.getElementById("display").innerHTML = memory;
    
    lastDig = dig;
}

function clearAll() {
    document.getElementById("display").innerHTML = "";
    document.getElementById("prevsum").innerHTML = "";
    memory = "";
    lastDig = "0";
    click = 0;
}

function socketCalc() {
    socket.emit('calculate', { cal: memory });
    memory = "";
    lastDig = "0";
    click = 0;
}


function toggleVis(calbox) {
  var div = document.getElementById(calbox);
  if(div.style.display == 'block'){
      div.style.display = 'none';
      document.getElementById('showCalc').innerHTML = 'Show Calculator';
  }
  else{
      div.style.display = 'block';
      $('#calbox').show();
      $('#display').show();
      $('#prevsum').show();
      $('.row').show();
      $('.button').show();    
      document.getElementById('showCalc').innerHTML = 'Hide Calculator';
  }
}

$(document).ready(function(){
  $('#calbox').draggable();
  })