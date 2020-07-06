# EduVideoScript
Automatic play, pause, switch, fast forward YouTube videos. Text to speech and other editions. Embedding in Liascript possible but not necessary.

## Idea

Controlling one or more YouTube players and other outputs with a sequence of commands.

Graphic editor for the commands.

## Usage

clone git repo, open `editor/editor.html` in a modern browser.

## Structure

### [evs.js](evs.js)

Base Classes

***EVSInstance (class)***

Each instance can execute a script and contains variables for the script.

***EVSCommandType (class)***

EduVideoScript Command Type.
Contains name, description, parameter name and type list and EVSCommand build function. 

***EVSCommand (abstract class)***
Contains Command Type, parameter and if the command is running.


### [commands.js](commands.js)

Contains Array `COMMAND_TYPES` with all implemented Commands

***commands:***

- wait
- log
- alert
- say
- openYTPlayer
- playYTVideo
- pauseYTVideo
- seekYTVideo
- changeYTVideo
- waitYTVideoTime

### [ytfunctions.js](ytfunctions.js)

contains functions for controlling the youtube iframe api

### [voicefunctions.js](voicefunctions.js)

contains functions for controlling the responsive voice api

### [evs.html](evs.html)

Website for executing the script

### [editor/editor.html](editor/editor.html)

Graphic editor for editing the script.

### [editor/editor.js](editor/editor.js)

Editor Code

### [editor/commandcolors.js](editor/commandcolors.js)

contains colors of commands
