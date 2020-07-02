const YOUTUBE_IFRAME_API_LINK = "https://www.youtube.com/iframe_api";
const RESPONSIVE_VOICE_API_LINK = "https://code.responsivevoice.org/responsivevoice.js";



function sleep(ms) {
    return new Promise(function (resolve,reject) {
       setTimeout(resolve,ms) 
    });
}



/*
 * https://developers.google.com/youtube/iframe_api_reference
 */
async function loadYouTubeIframeAPI() {
    if (typeof YT !== "undefined") throw new Error("YouTube iframe API already loaded");
    let tag = document.createElement('script');
    tag.src = YOUTUBE_IFRAME_API_LINK;
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    await new Promise(function (resolve,reject) {
        onYouTubeIframeAPIReady = resolve;
    });
    onYouTubeIframeAPIReady = function() {throw new Error("it is forbidden to call onYouTubeIframeAPIReady!")};
}

// the youtube api calls this function. The promise in loadYouTubeIframeAPI overwrites the function and resolve
var onYouTubeIframeAPIReady = function() {
    throw new Error("overwriting of onYouTubeIframeAPIReady in loadYouTubeIframeAPI() has not worked");
} 




/*
 * https://responsivevoice.org/api/
 */
async function loadResponsiveVoiceAPI(apiKey) {
    if (apiKey === undefined) throw new Error("missing responsiveVoice api key");
    if (typeof responsiveVoice !== "undefined") throw new Error("responsiveVoice API already loaded");
    let tag = document.createElement('script');
    tag.src = RESPONSIVE_VOICE_API_LINK + "?key=" + apiKey;
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    await new Promise(async function (resolve,reject) {
        while (typeof responsiveVoice !== "object") await sleep(1000); //TODO better solution?
        responsiveVoice.init();
        resolve();
    });
}


// resolve promise, when speack starts
async function speakAsyncStart(text,lang,parameter) {
    if (typeof parameter !== "object" || parameter === null) parameter = {};
    await new Promise(function (resolve,reject) {
        parameter.onstart = resolve;
        responsiveVoice.speak(text,lang,parameter);
    });
}

// resolve promise, when speack ends
async function speakAsyncEnd(text,lang,parameter) {
    if (typeof parameter !== "object" || parameter === null) parameter = {};
    await new Promise(function (resolve,reject) {
        parameter.onend = resolve;
        responsiveVoice.speak(text,lang,parameter);
    });
}

function stopVoice() {
    responsiveVoice.cancel();
}


class EVSInstance {
    constructor() {
        this._variables = {};
        this._currentCommand = undefined;
        this._stopsCount = 0;// counts the number of stopCurrentCommand() calls
    }
    async runCommand(cmnd) {
        if (this._currentCommand !== undefined) throw new Error("EVSInstance can only run one command at the same time");
        this._currentCommand = cmnd;
        let stopCountOld = this._stopsCount;
        await cmnd.run();
        if (stopCountOld != this._stopsCount) return false;// returns false, if command was stoped
        this._currentCommand = undefined;
        return true;
    }
    stop() {
        this._stopsCount++;
        if  (this._currentCommand == undefined) return;
        this._currentCommand.stop();
        this._currentCommand = undefined;
    }
    async runCommands(cmnds) {
        for (let cmnd of cmnds) if (!this._stoping) {
            if (!await this.runCommand(cmnd)) break;
        }
    }
}

class EVSCommandType {

//  string name: command name
//  EVSParameterInfo[] paramers: command parameter
//  function(checkedParameter[]) --> ESVCommand commandBuilder: builds the ESVCommand from the checked parameter
//  string description
    constructor(name,parameters,commandBuilder,description) {
        //all properties are readonly
        Object.defineProperty(this, "name", {value: name, writable: false});
        Object.defineProperty(this, "parameters", {value: parameters, writable: false});
        Object.defineProperty(this, "commandBuilder", {value: commandBuilder, writable: false});
        Object.defineProperty(this, "description", {value: description, writable: false});
    }
    
    getDefaultParameter() {
        let ret = {};
        for (let p of this.parameters) ret[p.id] = p.defaultValue;
        return ret;
    }
    
    
    
//  object paramerValues: {parameter1: value1, parameter2: value2, ...}
    build(parameterValues) {
        let pChecked = {};
        for (let p of this.parameters) pChecked[p.id] = p.check(parameterValues[p.id]);
        return this.commandBuilder(this,pChecked); 
    }
    
//  object commandTypessObject: {"typeName1":type1, "typeName2":type2, ...}
//  string name: type name
//  object parameterValues: {"parameterName1":"value1", ...}
    static parseCommand(commandTypesObject, name,parameterValues) {
        let commandType = commandTypesObject[name];
        if (commandType === undefined) throw new Error("unknown command type" + name);
        return commandType.build(parameterValues);
    }
    
    
//  object commandTypessObject: {"typeName1":type1, "typeName2":type2, ...}
//  array commandDataArray: [ ["commandName1",parameterValues1], ["commandName2",parameterValues2], ... ]
//              parameterValuesX: {"parameterName1":"value1", ...}
    static parseCommands(commandTypesObject, commandDataArray) {
        let ret = [];
        for (let d of commandDataArray) ret.push(EVSCommandType.parseCommand(commandTypesObject, d[0], d[1]));
        return ret;
    }
}




class EVSParameterInfo {
//  string id: property id
//  function(string)-->checkedValue checkFunction: returns the cheked parameter vaule and throws error, if input not allowed
//  string/... defaultValue: if the input parameter is undefined or null, the check function will be called with the default value 
//  string description
    constructor(id,checkFunction,defaultValue,description) {
        Object.defineProperty(this, "id", {value: id, writable: false});
        Object.defineProperty(this, "defaultValue", {value: defaultValue, writable: false});
        Object.defineProperty(this, "checkFunction", {value: checkFunction, writable: false});
        Object.defineProperty(this, "description", {value: description, writable: false});
    }
    
    check(value) {
        if (value === undefined || value === null) return this.checkFunction(this.defaultValue);
        return this.checkFunction(value);
    }
}
// checkFunction templates:
EVSParameterInfo.CHECK_FUNCTION = {};

// returns the input
EVSParameterInfo.CHECK_FUNCTION.PASS = (v)=>v;

// trys to convert the input to Number
EVSParameterInfo.CHECK_FUNCTION.NUMBER = function(v) {
    let n = v*1;
    if (isNaN(v)) throw new Error(v + " is not a number");
    return n;
}

// trys to convert the input to Integer
EVSParameterInfo.CHECK_FUNCTION.TO_INT = function(v) {
    let n = Math.floor(v*1);
    if (isNaN(v)) throw new Error(v + " is not a number");
    return n;
}

// checkFunction template creators
EVSParameterInfo.CHECK_FUNCTION_CREATE = {};

// creates function which converts the input to a number and checks, if the number is between mini and maxi (or equal) 
EVSParameterInfo.CHECK_FUNCTION_CREATE.BETWEEN = function(mini,maxi) {
    return function(v) {
        let n = v*1;
        if (isNaN(v)) throw new Error(v + " is not a number");
        if (n < mini || n > maxi) throw new Error(n + " is not between " + mini + " " + maxi);
        return n;
    };
}

// creates function which converts the input to a integer and checks, if the number is between mini and maxi (or equal) 
EVSParameterInfo.CHECK_FUNCTION_CREATE.BETWEEN_TO_INT = function(mini,maxi) {
    return function(v) {
        let n = Math.floor(v*1);
        if (isNaN(v)) throw new Error(v + " is not a number");
        if (n <= mini || n >= maxi) throw new Error(n + " is not between " + mini + " " + maxi);
        return n;
    };
}




class EVSCommand {
    constructor(type) {
        Object.defineProperty(this,"type",{value:type, writable:false});
        this._running = false;
    }
    
    setRunning() {
        if (this._running) throw new Error("command is already running!");
    }
    
    setFree() {
        this._running = false;
    }
    
 // EVSInstance evsInstance the current EVSInstance for variable access
    async run(evsInstance) {
        this.setRunning();
        await this.execute(evsInstance);
        this.setFree();
    }
    
    // don't call execute! you have to call run.
    //override this function
    async execute(evsInstance) {
        throw new Error("EVSCommand.execute is abstract");
    }
    
    stop() {
        this.stopMe();
        this.setFree();
    }
    
    // don't call execute! you have to call stop.
    // override this function
    stopMe() {
        throw new Error("EVSCommand.stopMe is abstract");
    }

}
