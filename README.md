# EduVideoScript
Automatic play, pause, switch, fast forward YouTube videos. Text to speech and other editions. Embedding in Liascript possible but not necessary.

## Idea

Controlling one or more YouTube players and other outputs with a sequence of commands.

Graphic editor for the commands.


## Structure

### evs.js

Base Classes and API load functions.

***EVS.Instance (class)***

Each instance can execute a script and contains variables for the script.

***EVS.Command (abstract class)***

EduVideoScript Command Type.
Contains description, parameter name and type list and execute function. 


### commands.js

Contains Array of all implemented Commands

***commands:***

- wait
- log
- openYTPlayer
- playYT
- pauseYT
- ...


### evs.html

Website for executing the script

### editor/editor.html

Graphic editor for editing the script.

### editor/editor.js

Editor Code

### editor/commands.json

Design of command modules in editor
