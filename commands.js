const COMMAND_TYPES = {};
const COMMAND_CLASSES = {};
initEVSCommandClasses();
initEVSCommandTypes();




// EduVideoScript Command Type add
function evscta(name,parameters,commandBuilder,description) {
    COMMAND_TYPES[name] = new EVSCommandType(name,parameters,commandBuilder,description);
}
// EduVideoScript create Parameter Info
function evspar(id,checkFunction,defaultValue,description) {
    return new EVSParameterInfo(id,checkFunction,defaultValue,description);
}







function initEVSCommandTypes() {
    /*
    evscta(
        "commandName",
        [
            evspar("parameter1",...checkFunction..., "default value", "description parameter1"),
            evspar("parameter2",...checkFunction2..., "default value", "description parameter2")
        ],
        (t,p)=>new Command....(t,p.parameter1,p.parameter2, ... ),
        "description"
    );
    */

    evscta(
        "wait",
        [
            evspar("time",EVSParameterInfo.CHECK_FUNCTION_CREATE.BETWEEN_TO_INT(0,100000000),"1000","time in milliseconds")
        ],
        (t,p)=>new COMMAND_CLASSES.Wait(t,p.time),
        "waits for <time> milliseconds"
    );

    evscta(
        "log",
        [
            evspar("value",EVSParameterInfo.CHECK_FUNCTION.PASS,"no message","debug value")
        ],
        (t,p)=>new COMMAND_CLASSES.Log(t,p.value),
        "runs console.log(value) for debuging"
    );

    evscta(
        "alert",
        [
            evspar("text",EVSParameterInfo.CHECK_FUNCTION.PASS,"no message :(","text to be displayed")
        ],
        (t,p)=>new COMMAND_CLASSES.Alert(t,p.text),
        "Opens a javascript dialog box and waits until you click on ok."
    );
    
    evscta(
        "say",
        [
            evspar("text",EVSParameterInfo.CHECK_FUNCTION.PASS,"no text","text to be read aloud"),
            evspar("voice",EVSParameterInfo.CHECK_FUNCTION.PASS,"US English Female","exact voice name (for example \"US English Male\""),//TODO check if voice exist
            evspar("pitch",EVSParameterInfo.CHECK_FUNCTION_CREATE.BETWEEN(0,2),"1","pitch (between 0 and 2)"),
            evspar("rate",EVSParameterInfo.CHECK_FUNCTION_CREATE.BETWEEN(0,1.5),"1","talking speed (between 0 and 1.5)"),
            evspar("volumne",EVSParameterInfo.CHECK_FUNCTION_CREATE.BETWEEN(0,1),"1","talking volumne (between 0 and 1)"),
        ],
        (t,p)=>new COMMAND_CLASSES.Say(t,p.text,p.voice,p.pitch,p.rate,p.volumne),
        "uses responivevoice to say the text"
    );
    
}















function initEVSCommandClasses() {
    
    COMMAND_CLASSES.Wait = class extends EVSCommand {
        constructor(type,time) {
            super(type);
            this.time = time;
        }
        async execute(evsInstance) {
            await sleep(this.time);
        }
        async stopMe() {
            //Do nothing
        }
    }
    
    COMMAND_CLASSES.Log = class extends EVSCommand {
        constructor(type,value) {
            super(type);
            this.value = value;
        }
        async execute(evsInstance) {
            console.log(this.value);
        }
        async stopMe() {
            //Do nothing
        }
    }

    COMMAND_CLASSES.Alert = class extends EVSCommand {
        constructor(type,text) {
            super(type);
            this.text = text;
        }
        async execute(evsInstance) {
            alert(this.text);
        }
        async stopMe() {
            //impossible to close alert with javascript
        }
    }
    
    COMMAND_CLASSES.Say = class extends EVSCommand {
        constructor(type,text,voice,pitch,rate,volumne) {
            super(type);
            this.text = text;
            this.voice = voice;
            this.pitch = pitch;
            this.rate = rate;
            this.volumne = volumne;
        }
        async execute(evsInstance) {
            await speakAsyncEnd(this.text,this.voice,{pitch:this.pitch,rate:this.rate,volumne:this.volumne});
        }
        async stopMe() {
            stopVoice();
        }
    }
}

