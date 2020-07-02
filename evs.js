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
