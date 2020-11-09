const YOUTUBE_IFRAME_API_LINK = "https://www.youtube.com/iframe_api";

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

// cretes new youtube player, waits until ready and returns the player
async function newYTP(playerId,width,height,videoId) {
    let ret;
    await new Promise(function(resolve,reject) {
        ret = new YT.Player(playerId,{
                width:width,
                height:height,
                videoId:videoId,
                events:{onReady:resolve}
            }
        );
    });
    return ret;
}

// play the video in player and waits until the play has started
async function playYTV(player) {
    player.playVideo();
    await waitForYTPStates(player, [YT.PlayerState.PLAYING]);
}

// pauses the video in player
async function pauseYTV(player) {
    player.pauseVideo();
}

// seeks to position and waits if the player is playing for finishing the buffering
async function seekYTV(player,time) {
    let st = player.getPlayerState();
    player.seekTo(time);
    if (st == YT.PlayerState.PLAYING) await waitForYTPStates(player,[YT.PlayerState.PLAYING]);
}

// changes the youtube video and waits if the player is playing for video start
async function changeYTV(player,videoId) {
    let st = player.getPlayerState();
    player.loadVideoById(videoId);
    if (st == YT.PlayerState.PLAYING) await waitForYTPStates(player,[YT.PlayerState.PLAYING]);
}

async function volumneYTP(player,volumne) {
    player.setVolume(volumne);
}
// waits until play time is lager or equal then time
async function waitForYTVTime(player, time) {
    await new Promise(async function (resolve,reject) {
        while (player.getCurrentTime() < time) await sleep(100);
        resolve();
    });
}

async function fullScreenYTP(player) {
    try {
        if (player.f.requestFullScreen) {
            await player.f.requestFullScreen();
        } else if (player.f.mozRequestFullScreen) {
            await player.f.mozRequestFullScreen();
        } else if (player.f.webkitRequestFullScreen) {
            await player.f.webkitRequestFullScreen();
        } else {
            console.log("fullscreen is not supported");
        }
    } catch (e) {
        console.log(e);
    }
}

async function exitFullScreenYTP(player) {
    try {
        document.exitFullscreen();
    } catch (e) {
        console.log(e);
    }
}

// waits until the player state is equal to an element in the array states
async function waitForYTPStates(player, states) {
    for (let s of states) if (player.getPlayerState() == s) return;
    await new Promise(function (resolve,reject) {
        let disabled = false;
        let listner = function(ev) {
            if (disabled) return;//  dirty solution, but player.removeEventListener do not work
            for (let s of states) if (ev.data == s) {
                disabled = true;
//                player.removeEventListener("onStateChange",listner);
                resolve();
                break;
            }
        }
        player.addEventListener("onStateChange",listner);
    });
}
