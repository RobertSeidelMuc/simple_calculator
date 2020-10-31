//GLOBAL VARIABLES
var lastInput = "";
var decimalSeparator = ",";
var openingParentheses = 0;
var closingParentheses = 0;


//FUNCTIONS
function keyPressed(key) {
    
    //DIGITS, PARENTHESES AND COMMAS
    if ((key >= 48 && key <= 57) 
        || (key >= 96 && key <= 105) 
        || key == 188 
        || key == 110
        || key == 998 || key == 999 /*opening and closing parentheses, used arbitrary keycodes since I have no support for shift key*/) { //if keycode belongs to a number between 0 and 9, a comma or parentheses
        
        if (key >= 96 && key <= 105) {
            // Convert keycode of numpad numbers to corresponding charcode of numbers
            key -= 48;
        }
        else if (key == 110 || key == 188) {
            key = "0x2c"; /*comma*/
        }
        else if (key == 998) {
            key = "0x0028"; //opening parenthesis
        }
        else if (key == 999) {
            key = "0x0029"; //closing parenthesis
        }
        printDigit(key);
        
    }
    
    //OPERATORS
    else if (key == 191 /* forward slash*/ 
             || key ==  111 /*division numpad */
             || key == 187 /*plus*/
             || key == 106 /*numpad muliply*/
             || key == 78 /* x key */
             || key == 88 /* x key */
             || key == 107 /*numpad plus*/
             || key == 109 /*numpad minus*/
             || key == 189 /*hyphen minus*/
            ){
        //convert keycodes of numpad operators to corresponding charcodes of regular operators
        if (key == 187 || key == 107) {
            key = "0x002B"; /*plus*/
        }
        else if (key == 106 || key == 88) {
            key = "0x78"; /*multiplication sign*/
        }
        else if (key == 111) {
            key = "0x2f"; /* forward slash*/ 
        }
        else if (key == 109 || key == 189) {
            key = "0x2d"; //minus
        }
        printOperator(key);
    }
             
    else if (key == 67 || key == 46 || key == 8 || key == 27) { //if keycode belongs to the "Clear" button,  delete, backspace or Escape buttons
        clearDisplay();
    }
    
    else if (key == 13 || key == 187) { // Enter key or equal sign
        evaluate();     
    }
}

function printDigit(e) {
    let result = document.getElementById("result");
    let input = String.fromCharCode(e);
    
    if (input == '(') {
        openingParentheses++;
    }
    else if (input == ')') {
        //make sure that closing parentheses can only be added if there is an adequate number of opening parentheses
        if (openingParentheses <= closingParentheses) {
            return;
        }
        else {
            closingParentheses++;
        }
    }
    
    if (lastInput == "=") {
        clearDisplay();
    }

    if (result.textContent.length < 16) {
        if (isNaN(Number(lastInput)) === false || lastInput == decimalSeparator || lastInput == '(' || lastInput == ')') {
            if (result.textContent == "0" && input != decimalSeparator) {
                result.textContent = input;
            }
            else if (lastInput == '(') {
                result.textContent += input; 
            }
            else if (input == '(') {
                result.textContent = input + result.textContent;
            }
            else if (input == decimalSeparator) {
                //make sure not to print two commas within the same number
                if (result.textContent.indexOf(decimalSeparator) > -1) {              
                            return;
                }
                     
                result.textContent += input; 
            }
            else {
                result.textContent += input; 
            }   
        }       
        //IF the last input was an operator, the new input is considered as a new number
        else {
            result.textContent = input;    
        }
    }
    
    lastInput = input;
}

function printOperator(e) { //input is an operator
    let memory = document.getElementById("memory");
    let result = document.getElementById("result");
    let input = String.fromCharCode(e);
    
    if (isNaN(Number(lastInput)) === false || lastInput == decimalSeparator || lastInput == '(' || lastInput == ')') {
        memory.textContent += ' ' + result.textContent + ' ' + input;
    }
    else if (lastInput == '=') {        
        memory.textContent = result.textContent + ' ' + input;
    }

    lastInput = input;
}

function clearDisplay() {
    let result = document.getElementById("result");
    let memory = document.getElementById("memory");

    result.textContent = '0';
    memory.textContent = '';
    lastInput = '0';
}

function evaluate() {
    let memory = document.getElementById("memory");
    let result = document.getElementById("result");
    let temporaryResult;
    let evaluation;

    
    if (lastInput == '=') {
        if (memory.textContent.charAt(0) === ' ') {
            memory.textContent = memory.textContent.substr(1);
        }
        memory.textContent = memory.textContent.replace(/[^\s]*/, result.textContent);
        evaluation = memory.textContent;
        evaluation = evaluation.replace('=', '');
    }
    else {
        evaluation = memory.textContent + result.textContent;
        memory.textContent += ' ' + result.textContent + ' =';
    }
    
    //parse for special characters that cannot be computed
    evaluation = evaluation.replace(/x/g, '*');
    evaluation = evaluation.replace(/,/g, '.');
    
    //check if there are any unresolved opening or closing parentheses, and if so add the missing number of parentheses
    while (openingParentheses > closingParentheses) {
        evaluation += ")";
        closingParentheses++;
    }
    while (closingParentheses > openingParentheses) {
        evaluation = "(" + evaluation;
        openingParentheses++;
    }
    
    temporaryResult = Function('"use strict";return (' + evaluation + ')')();
    temporaryResult = temporaryResult.toString();
    temporaryResult = temporaryResult.replace('.', ',');
    
    result.textContent = temporaryResult;
    
    lastInput = "=";
}


//EXECUTABLE CODE
//make sure the decimal separator is either a comma or a full stop, independent of the HTML
document.getElementById("decimal").innerHTML = decimalSeparator;

document.addEventListener("keydown", function() {keyPressed(event.keyCode);});

const keyArray = document.getElementsByClassName("key");
for (const element of keyArray) {
    element.addEventListener("click", function() {keyPressed(element.getAttribute('data-key'));});
}