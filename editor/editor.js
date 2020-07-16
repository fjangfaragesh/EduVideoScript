"use strict";
const EVS_RUN_PATH = "../evs.html";
const TRASH_CAN_TEXT = "drop here to remove element";

// Class in which the code to be edited is stored
class EditCode {
    // array lines: the code line data Array (or undefined)
    constructor(lines) {
        if (lines === undefined || lines === null) lines = [];
        this._lines = lines;
    }
    // returns a copy of the line at lineIndex
    getLine(lineIndex) {
        return EditCode.cloneLine(this._lines[lineIndex]);
    }
    // returns a copy of all lines
    getLines() {
        return EditCode.cloneLines(this._lines);
    }
    // returns the length of the code lines
    length() {
        return this._lines.length;
    }
    // inserts the line shortly before index
    insert(line, index) {
        this._lines.splice(index,0,line);
    }
    // removes the line at index
    remove(index) {
        this._lines.splice(index,1);
    }
    // removes the code line on oldIndex and inserts the newLineData on newIndex
    // if oldIndex == -1: new line is only added; if newIndey == -1: line is deleted; if newIndex == undefined: line data change on oldIndex 
    modify(newLineData,oldIndex,newIndex) {
        if (newIndex === undefined) newIndex = oldIndex;
        if (oldIndex == -1) {
            if (newIndex == -1) return;
            this.insert(newLineData,newIndex);
        } else {
            if (newIndex == -1) {
                this.remove(oldIndex);
            } else {
                this.remove(oldIndex);
                if (newIndex > oldIndex) newIndex--;
                this.insert(newLineData,newIndex);
            }
        }
    }
    
    changeParameter(index,parameterId,value) {
        this._lines[index][1][parameterId] = value;
    }
    // returns json string of all lines
    getJSON() {
        let s = "[";
        for (let i = 0; i < this._lines.length; i++) {
            s += "\n  " + JSON.stringify(this._lines[i]);
            if (i != this._lines.length-1) s += ", ";
        }
        s += "\n]";
        return s;
    }
    // loads lines from json string
    loadJSON(json) {
        this._lines = JSON.parse(json);
    }
    
    clone() {
        return new EditCode(EditCode.cloneLines(this._lines));
    }
    
    // creates EditCode from json
    static load(json) {
        return new EditCode(JSON.parse(json));
    }
    
    static cloneLine(line) {
        return JSON.parse(JSON.stringify(line));//TODO better solution to clone non circular object?
    }
    
    static cloneLines(lines) {
        return JSON.parse(JSON.stringify(lines));//TODO better solution to clone non circular object?
    }
}



// switch current view to Graphical Editor
// EditCode editCode: code to edit
function switchToGraphicalEditor(editCode) {
    //clear main field
    MAIN_FIELD.innerHTML = "";
    
    //set style of header buttons (GRAPHICAL_HEADER_BUTTON selected)
    GRAPHICAL_HEADER_BUTTON.className = "headerButtonSelected";
    JSON_HEADER_BUTTON.className = "headerButton";
    RUN_HEADER_BUTTON.className = "headerButton";

    // create graphical editor div
    let gEditorDiv = document.createElement("div");
    gEditorDiv.className = "gEditorDiv";
    MAIN_FIELD.appendChild(gEditorDiv);
    
    // create command type list div
    let commandTypeListDiv = document.createElement("div");
    commandTypeListDiv.className = "commandTypeListDiv";
    gEditorDiv.appendChild(commandTypeListDiv);
    
    // create trash can div
    let trashCan = createTrashCan(editCode, drawCode);
    commandTypeListDiv.appendChild(trashCan);
    
    // create divs of all command types
    let typeNames = Object.keys(COMMAND_TYPES);
    for (let type of typeNames) commandTypeListDiv.appendChild(createCodeLineTypeDiv(COMMAND_TYPES[type]));
    
    // create code content div
    let codeBuildDiv = document.createElement("div");
    codeBuildDiv.className = "codeBuildDiv";
    gEditorDiv.appendChild(codeBuildDiv);

    
    drawCode();
    
    // function for redrawing code after change
    function drawCode() {
        
        codeBuildDiv.innerHTML = "";
        codeBuildDiv.appendChild(document.createTextNode("program:"));
        // for each code line:
        for (let i = 0; i < editCode.length(); i++) {
            // add code drop div (free space between code lines where you can drop other code lines)
            codeBuildDiv.appendChild(createCodeDropDiv(i,editCode,drawCode,false));
            // add the code line
            codeBuildDiv.appendChild(createCodeLineDiv(editCode,i));
        }
        // add code drop div on the end
        codeBuildDiv.appendChild(createCodeDropDiv(editCode.length(),editCode,drawCode,true));
    }
}


// creates a code drop div (free space between code lines where you can drop other code lines)
// int index: index of the code line in front of which the div is located
// EditCode editCode
// function() redrawFunction: is called, when code order or code length changes (redrawing of code necessary) 
// boolean flexGrow: if the style attribute flex-grow is set to 1 (latest div true, otherwise false)
function createCodeDropDiv(index, editCode, redrawFunction ,flexGrow) {
    // create div
    let ret = document.createElement("div");
    ret.className = "codeDropDiv";
    if (flexGrow) ret.style["flex-grow"] = 1;
    // set on drag over event
    ret.ondragover = function(ev) {
        ev.preventDefault();
        // change the look
        ret.className = "codeDropDivActive";
    }
    
    ret.ondragleave = function() {
        // reset the look
        ret.className = "codeDropDiv";
    }
    
    // set on drop function
    ret.ondrop = function(ev) {
        // reset the look
        ret.className = "codeDropDiv";
        // parse line data and modify
        let d = JSON.parse(ev.dataTransfer.getData("codeLineInfos"));
        // apply change
        editCode.modify(d.line,d.index,index);
        // redraw code
        redrawFunction();
    }
    return ret;
}

// creates a trash can div
// function() redrawFunction: is called, when line was deleted (redrawing of code necessary) 
function createTrashCan(editCode, redrawFunction) {
    let ret = document.createElement("div");
    ret.className = "trashCan";
    ret.ondragover = function(ev) {
        ev.preventDefault()
        ret.className = "trashCanActive";
    }
    ret.ondragleave = function() {
        ret.className = "trashCan";
    }
    ret.ondrop = function(ev) {
        ret.className = "trashCan";
        let d = JSON.parse(ev.dataTransfer.getData("codeLineInfos"));
        // modify code (move line from drag origin to trash)
        editCode.remove(d.index);
        redrawFunction();
    }
    ret.appendChild(document.createTextNode(TRASH_CAN_TEXT));
    return ret;
}

// creates a code line div (witch is used in line type list)
// EVSCommandType type,
// object/undefined parameterData: default parameter
function createCodeLineTypeDiv(type,parameterData) {
    if (parameterData === undefined || parameterData === null) parameterData = {};
    let color = COMMAND_COLORS.GET(type.name);

    // create div
    let ret = document.createElement("div");
    ret.className = "codeLine";
    ret.style["background-color"] = color;

    // create command name div
    let nameDiv = document.createElement("div");
    nameDiv.className = "commandNameDiv";
    nameDiv.style["background-color"] = color;
    nameDiv.draggable = true;
    nameDiv.appendChild(document.createTextNode(type.name));
    ret.appendChild(nameDiv);    
    
    nameDiv.ondragstart = function(ev) {
        // save code line data in event
        ev.dataTransfer.setData("codeLineInfos", JSON.stringify({"line":[type.name,parameterData],"index":-1}));
    }
    
    nameDiv.title = type.description;
    
    // add parameter elements
    for (let p of type.parameters) {
        // parameter name
        ret.appendChild(createParaTitleElement(p));
        // parameter value
        ret.appendChild(createParaValueReadonlyInput(parameterData[p.id],p.defaultValue));
        ret.appendChild(document.createElement("br"));
    }
    return ret;
}

// creates a code line div (witch is used in code list)
// EditCode editCode
// int index
function createCodeLineDiv(editCode, index) {
    let line = editCode.getLine(index);
    let typeName = line[0];
    let commandData = line[1];
    let type = COMMAND_TYPES[typeName];
    let color = COMMAND_COLORS.GET(typeName);

    // create div
    let ret = document.createElement("div");
    ret.className = "codeLine";
    ret.style["background-color"] = color;

    // create command name div
    let nameDiv = document.createElement("div");
    nameDiv.className = "commandNameDiv";
    nameDiv.style["background-color"] = color;
    nameDiv.draggable = true;
    nameDiv.appendChild(document.createTextNode(typeName + "\t\t\t (" + index + ")"));
    ret.appendChild(nameDiv);

    nameDiv.ondragstart = function(ev) {
        // save code line data in event
        ev.dataTransfer.setData("codeLineInfos", JSON.stringify({"line":line,"index":index}));
    }
    
    if (type == undefined) {
        ret.appendChild(document.createTextNode("unknown command!"))
    } else {
        nameDiv.title = type.description;
        // add parameter list
        for (let p of type.parameters) {
            // parameter id
            ret.appendChild(createParaTitleElement(p));
            // value
            ret.appendChild(createParaValueInput(editCode,index,p,commandData[p.id]));
            ret.appendChild(document.createElement("br"));
        }
    }
    return ret;
}


// creates parameter id element
// EVSParameterInfo parameter
function createParaTitleElement(parameter) {
    let ret = document.createElement("input");
    ret.type = "text";
    ret.readOnly = true;
    ret.className = "paraTitle";
    ret.title = parameter.description;
    ret.value = parameter.id + ":";
    return ret;
}

// creates parameter value div for createCodeLineTypeDiv
// string/undefined value
// string default value
function createParaValueReadonlyInput(value,defaultValue) {
    if (value === undefined || value === null) value = "";
    
    // create input
    let ret = document.createElement("input");
    ret.type = "text";
    ret.readOnly = true;
    ret.className = "paraValueInput";
    ret.value = value;
    ret.placeholder = defaultValue;
    return ret;
}

// creates editable parameter value div
// EditCode editCode
// int index: index of code line, in which the parameter is used
// EVSParameterInfo parameter
function createParaValueInput(editCode,index,parameter) {
    let line = editCode.getLine(index);
    let value = line[1];
    
    // create input
    let ret = document.createElement("input");
    ret.type = "text";
    ret.className = "paraValueInput";
    
    if (line[1][parameter.id] === undefined) {
        ret.value = "";
    } else {
        ret.value = line[1][parameter.id];
    }
    
    ret.placeholder = parameter.defaultValue;
    ret.readOnly = index == -1;

    ret.onchange = function() {
        if (ret.value == "") {
            // set parameter value to default
            editCode.changeParameter(index,parameter.id,undefined);
        } else {
            editCode.changeParameter(index,parameter.id,ret.value);
        }
    }

    // create parameter check function (warns the user of incorrect input)
    let f = createParaValueInputCheckFunction(ret,parameter);
    ret.addEventListener("input",f);
    f();
    return ret;
}

// returns function, which warns the user if the parameters are entered incorrectly
// DOMElement elm: parameter value input element
// EVSParameterInfo parameter
function createParaValueInputCheckFunction(elm,parameter) {
    return function() {
        if (elm.value == "") {
            elm.className = "paraValueInput";
            elm.title = "default value";
            return;
        }
        let ch = checkParameterErrors(parameter,elm.value);
        if (ch === true) {
            elm.className = "paraValueInput";
            elm.title = "valid input";
        } else {
            elm.className = "paraValueInputError";
            elm.title = "input error: " + ch;
        }
    }
}


// checks the input of the parameter. returns true, if correct, otherwise returns string with error message
// EVSParameterInfo parameter
// string/undefined value
function checkParameterErrors(parameter,value) {
    try {
        parameter.check(value);
    } catch (e) {
        if (e instanceof Error) return e.message+"";
        return e+"";
    }
    return true;
}



// switch current view to Graphical Editor
// EditCode editCode: code to edit
function switchToJSONEditor(editCode) {
    // clear main field
    MAIN_FIELD.innerHTML = "";
    
    // set style of header buttons (JSON_HEADER_BUTTON selected)
    GRAPHICAL_HEADER_BUTTON.className = "headerButton";
    JSON_HEADER_BUTTON.className = "headerButtonSelected";
    RUN_HEADER_BUTTON.className = "headerButton";
    
    // create code edit text area
    let textArea = document.createElement("textarea");
    textArea.value = editCode.getJSON();
    textArea.spellcheck = false;
    textArea.className = "jsonEditorArea";
    
    MAIN_FIELD.appendChild(textArea);
    
    
    // input event reaction
    textArea.addEventListener("input",function() {
        try {
            editCode.loadJSON(textArea.value);
            textArea.className = "jsonEditorArea";
            textArea.title = "";
        } catch (e) {
            textArea.className = "jsonEditorAreaError";
            textArea.title = "Can't parse code: " + e;
        }
    });
}

// switch current view to Graphical Editor
// EditCode editCode: code to edit
function switchToRunMode(editCode) {
    // clear main field
    MAIN_FIELD.innerHTML = "";
    
    // set style of header buttons (RUN_HEADER_BUTTON selected)
    GRAPHICAL_HEADER_BUTTON.className = "headerButton";
    JSON_HEADER_BUTTON.className = "headerButton";
    RUN_HEADER_BUTTON.className = "headerButtonSelected";
    
    // create iframe
    let iframe = document.createElement("iframe");
    iframe.src = EVS_RUN_PATH;
    iframe.className = "iframe";
    iframe.onload = function() {
//      send code to iframe
        iframe.contentWindow.postMessage(JSON.stringify({"command":"loadCode","code":editCode.getLines()}),"*");
    }
    MAIN_FIELD.appendChild(iframe);
}
