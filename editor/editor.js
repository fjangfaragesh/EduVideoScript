"use strict";

function switchToGraphicalEditor() {
    MAIN_FIELD.innerHTML = "";
    
    GRAPHICAL_HEADER_BUTTON.className = "headerButtonSelected";
    JSON_HEADER_BUTTON.className = "headerButton";
    RUN_HEADER_BUTTON.className = "headerButton";

    let gEditorDiv = document.createElement("div");
    gEditorDiv.className = "gEditorDiv";
    
    let commandTypeListDiv = document.createElement("div");
    commandTypeListDiv.className = "commandTypeListDiv";
    
    let trashCan = createTrashCan(drawCode);
    commandTypeListDiv.appendChild(trashCan);
    
    
    let typeNames = Object.keys(COMMAND_TYPES);
    for (let type of typeNames) commandTypeListDiv.appendChild(createCodeLineDiv([type,{}],-1));
    
    let codeBuildDiv = document.createElement("div");
    codeBuildDiv.className = "codeBuildDiv";
    
    gEditorDiv.appendChild(commandTypeListDiv);
    gEditorDiv.appendChild(codeBuildDiv);
    MAIN_FIELD.appendChild(gEditorDiv);
    
    drawCode();
    
    function drawCode() {
        codeBuildDiv.innerHTML = "";
        codeBuildDiv.appendChild(document.createTextNode("program:"));
        for (let i = 0; i < currentCode.length; i++) {
            codeBuildDiv.appendChild(createCodeDropDiv(i,drawCode,false));
            codeBuildDiv.appendChild(createCodeLineDiv(currentCode[i],i));
        }
        codeBuildDiv.appendChild(createCodeDropDiv(currentCode.length,drawCode,true));
    }
}




function createCodeDropDiv(index, redrawFunction, flexGrow) {
    let ret = document.createElement("div");
    ret.className = "codeDropDiv";
    if (flexGrow) ret.style["flex-grow"] = 1;
    ret.ondragover = function(ev) {
        ev.preventDefault()
        ret.className = "codeDropDivActive";
    }
    ret.ondragleave = function() {
        ret.className = "codeDropDiv";
    }
    ret.ondrop = function(ev) {
        ret.className = "codeDropDiv";
        let d = JSON.parse(ev.dataTransfer.getData("codeLineInfos"));
        modifyCode(d.line,d.index,index);
        redrawFunction();
    }
    return ret;
}

function createTrashCan(redrawFunction) {
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
        modifyCode(d.line,d.index,-1);
        redrawFunction();
        return false;
    }
    ret.appendChild(document.createTextNode("drop here to remove element"));
    return ret;
}

function modifyCode(line,indexOld,indexNew) {
    if (indexOld == -1) {
        if (indexNew == -1) return;
        currentCode.splice(indexNew,0,line);
    } else {
        if (indexNew == -1) {
            currentCode.splice(indexOld,1);
        } else {
            currentCode.splice(indexOld,1);
            if (indexNew > indexOld) indexNew--;
            currentCode.splice(indexNew,0,line);
        }
    }
}

function createCodeLineDiv(line, index) {
    let type = COMMAND_TYPES[line[0]];
    let ret = document.createElement("div");
    ret.className = "codeLine";
    let color = COMMAND_COLORS.GET(line[0]);
    ret.style["background-color"] = color;
    let nameDiv = document.createElement("div");
    nameDiv.className = "commandNameDiv";
    nameDiv.style["background-color"] = color;
    nameDiv.draggable = true;
    nameDiv.ondragstart = function(ev) {
        ev.dataTransfer.setData("codeLineInfos", JSON.stringify({"line":line,"index":index}));
    }
    nameDiv.title = type.description;
    nameDiv.appendChild(document.createTextNode(line[0]));
    ret.appendChild(nameDiv);
    
    if (type == undefined) {
        ret.appendChild(document.createTextNode("unknown command!"))
    } else {
        ret.appendChild(nameDiv);
        for (let p of type.parameters) {
            let propTitle = document.createElement("input");
            propTitle.type = "text";
            propTitle.readOnly = true;
            propTitle.className = "propTitle";
            propTitle.title = p.description;
            propTitle.value = p.id + ":";
            ret.appendChild(propTitle);
            
            let propValueInput = document.createElement("input");
            propValueInput.type = "text";
            propValueInput.className = "propValueInput";
            if (line[1][p.id] === undefined) {
                propValueInput.value = "";
            } else {
                propValueInput.value = line[1][p.id];
            }
            propValueInput.placeholder = p.defaultValue;
            propValueInput.readOnly = index == -1;
            if (index != -1) {
                propValueInput.onchange = function() {
                    if (propValueInput.value == "") {
                        line[1][p.id] = undefined;
                        changeCode();
                    } else {
                        line[1][p.id] = propValueInput.value;
                        changeCode();
                    }
                }
            }
            ret.appendChild(propValueInput);
            ret.appendChild(document.createElement("br"));
        }
    }
    
    
    return ret;
}



function switchToJSONEditor() {
    MAIN_FIELD.innerHTML = "";
    
    GRAPHICAL_HEADER_BUTTON.className = "headerButton";
    JSON_HEADER_BUTTON.className = "headerButtonSelected";
    RUN_HEADER_BUTTON.className = "headerButton";
    
    let textArea = document.createElement("textarea");
    textArea.value = codeToFormatedJson(currentCode);
    textArea.spellcheck = false;
    textArea.className = "jsonEditorArea";
    
    MAIN_FIELD.appendChild(textArea);
    
    textArea.addEventListener("input",function() {
        if (changeJSONCode(textArea.value)) {
             textArea.className = "jsonEditorArea";
        } else {
            textArea.className = "jsonEditorAreaError";
        }
    });
}


function switchToRunMode() {
    MAIN_FIELD.innerHTML = "";
    
    GRAPHICAL_HEADER_BUTTON.className = "headerButton";
    JSON_HEADER_BUTTON.className = "headerButton";
    RUN_HEADER_BUTTON.className = "headerButtonSelected";
    
    let iframe = document.createElement("iframe");
    iframe.src = "../evs.html";
    iframe.className = "iframe";
    iframe.onload = function() {
        console.log(iframe.src);
        iframe.contentWindow.postMessage(JSON.stringify({"command":"loadCode","code":currentCode}),"*");
    }
    MAIN_FIELD.appendChild(iframe);
    iframee = iframe;
}
let iframee;
function codeToFormatedJson(code) {
    let s = "[";
    for (let i = 0; i < code.length; i++) {
        s += "\n  " + JSON.stringify(code[i]);
        if (i != code.length-1) s += ", ";
    }
    s += "\n]";
    return s;
}
