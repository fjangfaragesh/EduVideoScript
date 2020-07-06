"use strict";

const COMMAND_TYPES = {};
const COMMAND_CLASSES = {};

const DEFAULT_VIDEO_ID = "gLHeQsy8juU";

// parses time string (seconds / minutes:secons / hours:minutes:seconds)
let READ_TIME_CHECK_FUNCTION = function(v) {
    if (isNaN(v*1)) {
        let parts = (v+"").replace(/ /gi,"").split(":");
        if (parts.length > 3) throw new Error("unknwon time format " + v);
        let t = 0;
        for (let i = 0; i < parts.length; i++) {
            let x = parts[i]*1;
            if (isNaN(x)) throw new Error("can't read " + parts[i] + " in " + v);
            if (x < 0) throw new Error(parts[i] + " is negative (in " + v + ")");
            if (x%1 != 0 && i != parts.length-1) throw new Error(parts[i] + " is not a integer (in " + v + ")");
            if (x >= 60 && i != 0) throw new Error(parts[i] + " is greater or equal 60 (in " + v + ")");
            t = t*60 + x;
        }
        return t;
    } else {
        if (v*1 < 0) throw new Error(v + " is negative!");
        return v*1;
    }
}

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
            evspar("time",EVSParameterInfo.CHECK_FUNCTION_CREATE.BETWEEN_INT(0,100000000),"1000","time in milliseconds")
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

    evscta(
        "openYTPlayer",
        [
            evspar("playerId",EVSParameterInfo.CHECK_FUNCTION.PASS,"ytplayer","youtube player id"),
            evspar("width",EVSParameterInfo.CHECK_FUNCTION_CREATE.BETWEEN_INT(200,8912),"640","width of the youtube player"),
            evspar("height",EVSParameterInfo.CHECK_FUNCTION_CREATE.BETWEEN_INT(200,8912),"320","heigth of the youtube player"),
            evspar("videoId",EVSParameterInfo.CHECK_FUNCTION.PASS,DEFAULT_VIDEO_ID,"youtube video id"),
        ],
        (t,p)=>new COMMAND_CLASSES.OpenYTP(t,p.playerId,p.width,p.height,p.videoId),
        "opens a new youtube player"
    );
    
    evscta(
        "playYTVideo",
        [
            evspar("playerId",EVSParameterInfo.CHECK_FUNCTION.PASS,"ytplayer","youtube player id"),
        ],
        (t,p)=>new COMMAND_CLASSES.PlayYTV(t,p.playerId),
        "Plays the video in the youtube player with the playerId."
    );
    
    evscta(
        "pauseYTVideo",
        [
            evspar("playerId",EVSParameterInfo.CHECK_FUNCTION.PASS,"ytplayer","youtube player id"),
        ],
        (t,p)=>new COMMAND_CLASSES.PauseYTV(t,p.playerId),
        "Pauses the video in the youtube player with the playerId."
    );
    
    evscta(
        "seekYTVideo",
        [
            evspar("playerId",EVSParameterInfo.CHECK_FUNCTION.PASS,"ytplayer","youtube player id"),
            evspar("time",READ_TIME_CHECK_FUNCTION,"2:07.3","time, where to seek in seconds or minutes:secons or hours:minutes:secons"),
        ],
        (t,p)=>new COMMAND_CLASSES.SeekYTV(t,p.playerId,p.time),
        "Seeks video in the youtube player with the id playerId to the position."
    );
    
    evscta(
        "changeYTVideo",
        [
            evspar("playerId",EVSParameterInfo.CHECK_FUNCTION.PASS,"ytplayer","youtube player id"),
            evspar("videoId",EVSParameterInfo.CHECK_FUNCTION.PASS,DEFAULT_VIDEO_ID,"new youtube video id"),
        ],
        (t,p)=>new COMMAND_CLASSES.ChangeYTV(t,p.playerId,p.videoId),
        "Change to an other video in the youtube player."
    );
    evscta(
        "waitYTVideoTime",
        [
            evspar("playerId",EVSParameterInfo.CHECK_FUNCTION.PASS,"ytplayer","youtube player id"),
            evspar("time",READ_TIME_CHECK_FUNCTION,"1:23.456","time in video to wait for in seconds"),
        ],
        (t,p)=>new COMMAND_CLASSES.WaitYTVT(t,p.playerId,p.time),
        "Waits until the play time is lager or equal time."
    );
    evscta(
        "volumneYTPlayer",
        [
            evspar("playerId",EVSParameterInfo.CHECK_FUNCTION.PASS,"ytplayer","youtube player id"),
            evspar("volumne",EVSParameterInfo.CHECK_FUNCTION_CREATE.BETWEEN_INT(0,100),"100","volumne (between 0 and 100)"),
        ],
        (t,p)=>new COMMAND_CLASSES.VolumneYTP(t,p.playerId,p.volumne),
        "Changes the volumne of the youtube player."
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
    
    COMMAND_CLASSES.OpenYTP = class extends EVSCommand {
        constructor(type,playerId,width,height,videoId) {
            super(type);
            this.playerId = playerId;
            this.width = width;
            this.height = height;
            this.videoId = videoId;
        }
        async execute(evsInstance) {
            let current = this;
            
            let varName = "ytp_" + this.playerId;
            if (evsInstance.getVar(varName) === undefined) {
                let player = await newYTP(this.playerId,this.width,this.height,this.videoId);
                pauseYTV(player);
                evsInstance.setVar(varName,player);
            } else {
                // TODO reset youtube player and change video
            }
        }
        async stopMe() {
            //TODO what do do?
        }
    }
    
    let PlayerClass = class extends EVSCommand {
        constructor(type,playerId) {
            super(type);
            this.playerId = playerId;
        }
        async execute(evsInstance) {
            let varName = "ytp_" + this.playerId;
            if (evsInstance.getVar(varName) === undefined) return;
            await this.executeP(evsInstance,evsInstance.getVar(varName));
        }
        async executeP(evsInstance,player) {
            throw new Error("PlayerClass.executeP is abstract!");
        }
    }
    
    
    COMMAND_CLASSES.PlayYTV = class extends PlayerClass {
        constructor(type,playerId) {
            super(type,playerId);
        }
        async executeP(evsInstance,player) {
            await playYTV(player);
        }
        async stopMe() {
            //TODO what do do?
        }
    }
    COMMAND_CLASSES.PauseYTV = class extends PlayerClass {
        constructor(type,playerId) {
            super(type,playerId);
        }
        async executeP(evsInstance,player) {
            await pauseYTV(player);
        }
        async stopMe() {
            //TODO what do do?
        }
    }
    COMMAND_CLASSES.SeekYTV = class extends PlayerClass {
        constructor(type,playerId,time) {
            super(type,playerId);
            this.time = time;
        }
        async executeP(evsInstance,player) {
            await seekYTV(player, this.time);
        }
        async stopMe() {
            //TODO what do do?
        }
    }
    COMMAND_CLASSES.ChangeYTV = class extends PlayerClass {
        constructor(type,playerId,videoId) {
            super(type,playerId);
            this.videoId = videoId;
        }
        async executeP(evsInstance,player) {
            await changeYTV(player, this.videoId);
        }
        async stopMe() {
            //TODO what do do?
        }
    }
    COMMAND_CLASSES.WaitYTVT = class extends PlayerClass {
        constructor(type,playerId,time) {
            super(type,playerId);
            this.time = time;
        }
        async executeP(evsInstance,player) {
            await waitForYTVTime(player, this.time);
        }
        async stopMe() {
            //TODO what do do?
        }
    }
    COMMAND_CLASSES.VolumneYTP = class extends PlayerClass {
        constructor(type,playerId,volumne) {
            super(type,playerId);
            this.volumne = volumne;
        }
        async executeP(evsInstance,player) {
            await volumneYTP(player, this.volumne);
        }
        async stopMe() {
            //TODO what do do?
        }
    }
}

