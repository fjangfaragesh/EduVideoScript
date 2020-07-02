const COMMAND_COLORS = {};
COMMAND_COLORS.wait = "#8888FF";
COMMAND_COLORS.log = "#cccccc";
COMMAND_COLORS.alert = "#FFdd88";
COMMAND_COLORS.say = "#88FF88";

COMMAND_COLORS.DEFAULT = "#cccccc";

COMMAND_COLORS.GET = function(type) {
    if (COMMAND_COLORS[type] === undefined) return COMMAND_COLORS.DEFAULT;
    return COMMAND_COLORS[type];
}
