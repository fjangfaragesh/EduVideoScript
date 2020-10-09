let COMMAND_TYPE_LABEL;

function sleep(ms) {
    return new Promise(function (resolve,reject) {
       setTimeout(resolve,ms) 
    });
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
        await cmnd.run(this);
        if (stopCountOld != this._stopsCount) return false;// returns false, if command was stoped
        this._currentCommand = undefined;
        return true;
    }
    
    async stop() {
        this._stopsCount++;
        if  (this._currentCommand == undefined) return;
        await this._currentCommand.stop();
        this._currentCommand = undefined;
        return;
    }
    
    async runCommands(cmnds, startIndex) {
        if (startIndex !== undefined && startIndex != 0) cmnds = EVSInstance.createCommandsSkipFrom(cmnds, startIndex);
        console.log(cmnds);
        for (let cmnd of cmnds) if (!this._stoping) {
            if (!await this.runCommand(cmnd)) break;
        }
    }
    getVar(name) {
        return this._variables[name];
    }
    setVar(name,value) {
        this._variables[name] = value;
    }
    
    // converts commands that should be skipped so that they are in the correct state at the end, but no meaningless commands are executed.
    // returns EVSCommandType[]
    static createCommandsSkip(cmnds) {
        let ret = [];
        for (let c of cmnds) {
            c.prepareSkip(ret);
        }
        return ret;
    }
    
    static createCommandsSkipFrom(cmnds, startIndex) {
        // the first part of commands is converted, the last part remains the same
        return EVSInstance.createCommandsSkip(cmnds.slice(0,startIndex)).concat(cmnds.slice(startIndex));
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
EVSParameterInfo.CHECK_FUNCTION.INT = function(v) {
    let n = v*1;
    if (isNaN(v)) throw new Error(v + " is not a number");
    if (n%1 != 0) throw new Error(n + " is not a integer");
    return n;
}

// checkFunction template creators
EVSParameterInfo.CHECK_FUNCTION_CREATE = {};

// creates function which converts the input to a number and checks, if the number is between mini and maxi (or equal) 
EVSParameterInfo.CHECK_FUNCTION_CREATE.BETWEEN = function(mini,maxi) {
    return function(v) {
        let n = v*1;
        if (isNaN(v)) throw new Error(v + " is not a number");
        if (n < mini || n > maxi) {
            throw new Error(n + " is not between " + mini + " and " + maxi);
        }
        return n;
    };
}

// creates function which converts the input to a integer and checks, if the number is between mini and maxi (or equal) 
EVSParameterInfo.CHECK_FUNCTION_CREATE.BETWEEN_INT = function(mini,maxi) {
    return function(v) {
        let n = v*1;
        if (isNaN(v)) throw new Error(v + " is not a number");
        if (n%1 != 0) throw new Error(n + " is not a integer");
        if (n < mini || n > maxi) throw new Error(n + " is not between " + mini + " and " + maxi);
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

    
    // adds itself to the array if fast forward execution is relevant for skiping
    // adds or removes other Commands, if necessary
    prepareSkip(cmnds) {
        throw new Error("EVSCommand.prepareSkip is abstract");
    }
}


COMMAND_TYPE_LABEL = new EVSCommandType("label",[new EVSParameterInfo("label",EVSParameterInfo.CHECK_FUNCTION.PASS,"","label name")],
                                        (t,p)=>new COMMAND_CLASS_LABEL(t,p.label),"label for skiping");
COMMAND_CLASS_LABEL = class extends EVSCommand {
    constructor(type,label) {
        super(type);
        this.label = label;
    }
    async execute(evsInstance) {
        //Do nothing
    }
    async stopMe() {
        //Do nothing
    }
    prepareSkip(cmnds) {
        // label can simply be ignored
    };
}


















