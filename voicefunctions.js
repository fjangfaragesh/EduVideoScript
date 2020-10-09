 const RESPONSIVE_VOICE_API_LINK = "https://code.responsivevoice.org/responsivevoice.js";

 
 /*
 * https://responsivevoice.org/api/
 */
async function loadResponsiveVoiceAPI(apiKey) {
    if (apiKey === undefined) throw new Error("missing responsiveVoice api key");
    if (typeof responsiveVoice !== "undefined") throw new Error("responsiveVoice API already loaded: " + typeof responsiveVoice);
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
