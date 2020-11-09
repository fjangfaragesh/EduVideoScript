//The colors of the command types in the editor
const COMMAND_COLORS = {};
COMMAND_COLORS.wait = "#8888ff";
COMMAND_COLORS.log = "#cccccc";
COMMAND_COLORS.alert = "#44ffff";
COMMAND_COLORS.say = "#88ff88";
COMMAND_COLORS.openYTPlayer = "#ff8888";
COMMAND_COLORS.playYTVideo = "#ffaa88";
COMMAND_COLORS.pauseYTVideo = "#ffee88";
COMMAND_COLORS.seekYTVideo = "#ffdd44";
COMMAND_COLORS.changeYTVideo = "#ff66aa";
COMMAND_COLORS.waitYTVideoTime = "#ffaaaa";
COMMAND_COLORS.volumneYTPlayer = "#ff44dd";
COMMAND_COLORS.fullScreenYTPlayer = "#999999";
COMMAND_COLORS.exitFullScreenYTPlayer = "#eeeeee";


// default color
COMMAND_COLORS.DEFAULT = "#cccccc";

//string type: type name
//returns the color of the command type
COMMAND_COLORS.GET = function(type) {
    if (COMMAND_COLORS[type] === undefined) return COMMAND_COLORS.DEFAULT;
    return COMMAND_COLORS[type];
}
