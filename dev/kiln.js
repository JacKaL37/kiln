//    Kiln: Programmatic Art using the simple Clay language
//    Copyright (C) 2020 John K. Lindstedt, PhD.
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU Affero General Public License as
//    published by the Free Software Foundation, either version 3 of the
//    License, or (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU Affero General Public License for more details.
//
//    You should have received a copy of the GNU Affero General Public License
//    along with this program.  If not, see <https://www.gnu.org/licenses/>.

var kiln = new Vue({
    el: '#kiln',
    data: {
        input: '',
        output: '',
        canvas: null,
        resCounter: 0,
        resolutions: [
            null,
            [1024,1024,"1:1, 1024"],
            [1920,1080,"1080p"],
            [1125,2436,"iPhone X"],
            [7680,4320,"8K"]
        ],
        painter: null,
        canvasColor: '#000000FF',
        wallCollision: true,
        drawDelay: false,
        clearLog: false,
        displayDefs: false,
        history: [],
        hcount: -1,
        hintCount: -1,
        hint: "",
        hints: [
            "paint",
            "move",
            "paint",
            "move paint",
            "dot >> move paint",
            "dot",
            "5dot",
            "50dot",
            "500dot",
            "-snapshot",
            "-clean",
            "-state",
            "-reset",
            "-state",
            "paint",
            "color paint",
            "color paint",
            "color dot",
            "cdot >> color dot",
            "50cdot",
            "colordots >> 50cdot",
            "expand colordots",
            "shrink colordots",
            "shrink colordots",
            "-snapshot",
            "-clean",
            "-defined",
            "colordots",
            "dot cdot",
            "-defined",
            "-memorize",
            "-reset",
            "-clean",
            "-forget",
            "-clear"
        ],
        helpText: "paint\n... create a filled circle using painter's current state\n\n" +
                  "draw\n...  create a ring using painter's current state\n\n" +
                  "move\n...  move painter to a random position on the canvas\n\n" +
                  "color\n... change painter to a random color \n\n" +
                  "turn\n...  turn painter's heading to a random angle \n\n" +
                  "size\n...  change radius to a random size \n\n" +
                  "alpha\n... change transparency to a random alpha value \n\n" +
                  "mfwd / mright / mleft / mback\n...  move painter position one step forward, right, left, or backward, according to heading \n\n" +
                  "turnl / turnr\n...  turn painter's heading 45 degrees left (counterclockwise) or right (clockwise) \n\n" +
                  "expand / shrink\n...  double or halve the painter's current radius size \n\n" +
                  "fade / glow\n... decrease or increase the painter's current alpha transparency \n\n"+
                  "pink / indigo / cerise / aqua / lemon / lime / ember\n... set painter to a predefined color \n\n"+
                  "white / ltgray / mdgray / dkgray / black\n... set painter to a predefined grayscale shade \n\n"+
                  "-clean\n... clear all paint from canvas \n\n"+
                  "-state\n... log the current state of the painter \n\n"+
                  "-reset\n... reset the state of the painter to default \n\n"+
                  "-defined\n... toggle logging of command definitions when executed \n\n"+
                  "-clear\n... clear the log \n\n"+
                  "-reboot\n... return entire system to default state, apart from recently defined commands \n\n"+
                  "-canvas\n... cycle through possible canvas sizes \n\n"+
                  "-walls\n... toggle whether walls will prevent movement beyond canvas edge \n\n"+
                  "-logging\n... toggle logging on or off \n\n"+
                  "-snapshot\n... save a snapshot of the canvas as a .png file \n\n"+
                  "-memorize\n... save the currently defined commands as a .txt file \n\n"+
                  "-remember\n... load a set of previousl saved commands from a .txt file \n\n"+
                  "-forget\n... remove all currently known commands \n\n"+
                  "-examples\n... cycle through premade example command sets (and then back to previous) \n\n"+
                  "-tutorial\n... enable or disable the tutorial (runs by default on first load) \n\n"+
                  "-help\n... show or hide this text box \n\n",
        displayHelp: false,
        prims: {
            "paint":    "pPaint",
            "draw":     "pDraw",
            "stamp":    "pStamp",
            "box":      "pBox",

            "move":     "pMove",
            "mfwd":     "pMfwd",
            "mright":   "pMright",
            "mleft":    "pMleft",
            "mback":    "pMback",

            "size":     "pSize",
            "expand":   "pExpand",
            "shrink":   "pShrink",

            "turn":     "pTurn",
            "turnl":    "pTurnl",
            "turnr":    "pTurnr",

            "alpha":    "pAlpha",
            "fade":     "pFade",
            "glow":     "pGlow",

            "color":    "pColor",
            "pink":     "pPink",
            "indigo":   "pIndigo",
            "cerise":   "pCerise",
            "aqua":     "pAqua",
            "lemon":    "pLemon",
            "lime":     "pLime",
            "ember":    "pEmber",
            "white":    "pWhite",
            "ltgray":   "pLtGray",
            "mdgray":   "pMdGray",
            "dkgray":   "pDkGray",
            "black":    "pBlack"
        },
        metas: {
            "-state":       "mState",
            "-defined":     "mDefined",
            "-clean":       "mClean",
            "-reset":       "mReset",
            "-clear":       "mClear",
            "-reboot":      "mReboot",
            "-canvas":      "mCanvas",
            "-walls":       "mWalls",
            "-logging":     "mLogging",
            "-snapshot":    "mSnapshot",
            "-memorize":    "mMemorize",
            "-remember":    "mRemember",
            "-forget":      "mForget",
            "-examples":    "mExamples",
            "-tutorial":    "mTutorial",
            "-help":        "mHelp",
            "-guide":       "mGuide"
        },
        hidden: [
            "-tutorial",
            "-examples",
            "-reboot"
        ],
        path: ["home"],
        region: "root",
        namespace: {},
        exampleCount: -1,
        examples: [
            //use to explore basic colors
            {
                "dot":          ["move","paint"],

                "cerisedot":    ["cerise","dot"],
                "pinkdot":      ["pink","dot"],
                "indigodot":    ["indigo","dot"],
                "aquadot":      ["aqua","dot"],
                "limedot":      ["lime","dot"],
                "lemondot":     ["lemon","dot"],
                "emberdot":     ["ember","dot"],

                "confettidots": ["cerisedot","emberdot","lemondot","limedot","aquadot","indigodot","pinkdot"],
                "confetti":     ["500confettidots"]
            },
            //use to explore shades, smaller variables, and sizes
            {
                "dot":          ["move","paint"],
                "wd":           ["white","dot"],
                "lgd":          ["ltgray","dot"],
                "mgd":          ["mdgray","dot"],
                "dgd":          ["dkgray","dot"],
                "bd":           ["black","dot"],
                "shadedots":    ["wd","lgd","mgd","dgd","bd"],
                "shaderandom":  ["size","2shrink","shadedots"],
                "shades":       ["200shaderandom"]
            },
            //use to explore redefining colors
            {
                "dot":          ["move","paint"],
                "dota":         ["pink","dot"],
                "dotb":         ["indigo","dot"],
                "dotc":         ["aqua","dot"],
                "dots":         ["dota","dotb","dotc"],
                "vapordots":    ["4fade","dots","4glow"],
                "vapor":        ["100vapordots"],
                "vaporshrink":  ["vapor","shrink"],
                "vaporwave":   ["3expand","6vaporshrink","3expand"],
            },
            //use to examine redefining alpha and count
            {
                "dot":          ["move","paint"],
                "randodot":     ["color","dot"],
                "randomany":    ["200randodot"],
                "randoshrink":  ["randomany","shrink"],
                "randoscape":   ["10expand","10randoshrink"]
            },
            //use to get into line segments, random walks, and, evidently, overly complex commands
            {
                "dot":            ["color","paint","color","draw"],
                "seg":            ["mfwd","dot"],
                "line":           ["5seg"],
                "tline":          ["turn","line"],
                "scribble":       ["100tline"],
                "farscribbles":   ["4shrink","20scribble"],
                "mfarscribbles":  ["expand","8scribble"],
                "mnearscribbles": ["expand","2scribble"],
                "nearscribbles":  ["expand","scribble"],
                "scribbledegook": ["3fade","farscribbles","glow","mfarscribbles","glow","mnearscribbles","glow","nearscribbles","expand"],
                "koogedelbbircs": ["farscribbles","fade","mfarscribbles","fade","mnearscribbles","fade","nearscribbles"]
            }
        ]
    },
    mounted() {
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.setCanvasNative();
        this.initAll();
    },
    methods: {
        //calculation helpers
        toHex: function(val){
            if(val > 255){
                val = 255;
            }
            if(val < 0){
                val = 0;
            }
            let hex = val.toString(16);
            if(hex.length < 2){
                hex = "0" + hex;
            }
            return hex;
        },

        //  INTERFACE
        histPrev: function(){
            this.hcount += 1;
            if(this.hcount >= this.history.length){
                this.hcount = this.history.length-1;
            }
            this.input = this.history[this.hcount];
        },
        histNext: function(){
            this.hcount -= 1;
            if(this.hcount <= -1){
                this.hcount = -1;
                this.input = "";
            }
            else{
                this.input = this.history[this.hcount];
            }
        },
        initHistory: function(){
            this.history = [];
            this.hcount = -1;
        },
        submit: function(){
            if(this.input==''){
                document.getElementById("input").blur();
                return false;
            }
            this.history.unshift(this.input);
            this.hcount = -1;

            this.processInput(this.input);
            this.checkHint(this.input);
            this.input = '';
        },

        checkHint: function(input){
            let hintSatisfied = input.trim().toLowerCase() == this.hint.trim().toLowerCase();
            if(this.hintCount > -1 && hintSatisfied){
                this.advanceHint();
            }
        },

        advanceHint: function(input){
            this.hintCount += 1;
            if(this.hintCount >= this.hints.length){
                this.hint = "";
                this.hintCount = -1;
                this.send("- tutorial complete");
                localStorage.setItem("tutorialGrad",true);
            }
            else{
                this.hint = this.hints[this.hintCount];
                //document.getElementById("input").blur();
            }
        },

        // CLAY LANGUAGE

        // input processing

        processInput: function(inputText){
            let text = inputText;

            let tokens = this.tokenize(text);

            //if it's a meta-command...
            if(tokens.length==1 && this.isMeta(tokens[0])){
                this.executeMeta(tokens[0]);
            }
            //if it's a definition function...
            else if(this.isDefinition(tokens)){
                this.define(tokens);
            }
            //otherwise, it's PROBABLY something to be executed.
            else{
              this.executeCommand(tokens);
            }
        },
        getTokens: function(tokens){
          res = [];
          //for each token received
          for(tkn of tokens){
            //strip it first
            tkn = tkn.replace(/[0-9]/g, '');
            //if it's a named token
            if(tkn in this.namespace){
              //add it
              res = res.concat(tkn);
              //and go retrieve its subcomponents
              res = res.concat(this.getTokens(this.namespace[tkn]));
            }
          }
          return(res);
        },
        uniqueTokens: function(tokens){
          let tkns = tokens;
          tkns.reverse();

          res = [];

          for(t of tkns){
            if(!res.includes(t)){
              res = res.concat(t);
            }
          }

          res.reverse();
          return res;
        },
        sendDefs: function(tokens){
          let defs = "";

          let tkns = this.getTokens(tokens);
          tkns = this.uniqueTokens(tkns);

          for(t of tkns){
            //let cmd = t.replace(/[0-9]/g, '');
            if(t in this.namespace){
              let subs = this.namespace[t];
              defs += "?? " + t + " >> " + subs.join(" ") + "\n";
            }
          }
          if(defs != ""){
            this.send(defs.trim());
          }
        },

        tokenize: function(text){
            let t = text;
            t = t.trim();
            t = t.toLowerCase();
            tokens = t.split(/\s+/g);
            return tokens;
        },

        //checks
        //only alphanumeric, -, and >> characters allowed!
        sanitize: function(text){

        },

        //syntactic categories

        isCommand: function(token){
            let res = false;
            if(token.match(/^[A-Za-z?]+$/)){
                res = true;
            }
            return res;
        },
        isMeta: function(token){
            let res = false;
            if(token.match(/-[A-Za-z?]+/)){
                res = true;
            }
            return res;
        },
        isDefinition: function(tkns){
            let res = false;
            if(tkns[1] ==">>"){
                res = true;
            }
            return res;
        },

        isRepeatToken: function(token){
            let res = false;
            if(token.match(/^\d+[A-Za-z]+$/)){
                res = true;
            }
            return res;
        },

        // execution

        executeMeta: function(metaTkn){
            if(metaTkn in this.metas){
                this[this.metas[metaTkn]]();
            }
            else{
                this.send("- unrecognized meta command: " + metaTkn + "\n")
            }
        },
        define: function(tkns){
            let name = tkns[0];
            let def = tkns.slice(2);
            let isPrim = name in this.prims;

            if(this.isCommand(name)){
                if(this.isPrim){
                    this.send("! command names cannot be primitives")
                }
                else{
                    this.namespace[name] = def;
                    this.send(tkns.join(" "));
                    sessionStorage.setItem("namespace",JSON.stringify(this.namespace));
                }
            }
            else{
                this.send("! command names must be A-Z or ?");
            }
        },
        repeatToken: function(token){
            let splt = token.split(/(\d+)/).filter(Boolean);
            let reps = parseInt(splt[0]);
            let tkn = splt[1];
            let reptkns = [];
            for(i = 0; i < reps; i++){
                reptkns.push(tkn);
            }
            return reptkns;
        },

        executeCommand: function(tokens){
            if(this.displayDefs){
              this.sendDefs(tokens);
            }
            else{
              this.unpackCommand(tokens);
              this.send(tokens.join(" "))
            }
        },

        unpackCommand: function(tokens){
            let newTokens = [];
            for(tkn of tokens){
                //if this is a REPEAT token
                if(this.isRepeatToken(tkn)){
                    let repTkns = this.unpackCommand(this.repeatToken(tkn));
                    newTokens = newTokens.concat(repTkns);
                }
                //if this is a SINGLE named command
                else if(tkn in this.namespace){
                    let namedTkns = this.unpackCommand(this.namespace[tkn]);
                    newTokens = newTokens.concat(namedTkns);
                }
                //otherwise, this is PROBABLY a prim
                // go ahead and try to execute it.
                else{
                    this.primitive(tkn);
                }
            }
            return newTokens;
        },
        primitive: function(token){
            let out = "";

            if(token in this.prims){
                this[this.prims[token]]();
            }
            else{
                this.send("- unrecognized token: " + token);
            }
            return out;
        },




        // SEMANTICS BINDINGS

        // prim command wrappers

        pPaint: function(){
            this.drawCircle(true);
        },

        pDraw:  function(){
            this.drawCircle(false);
        },

        pStamp: function(){
            this.drawSquare(true);
        },

        pBox: function(){
            this.drawSquare(false);
        },

        pMove: function(){
            let x = Math.random() * this.canvas.width;
            let y = Math.random() * this.canvas.height;

            this.setPosition(x,y);
        },

        pMfwd: function(){
            this.shiftPolar(0);
        },

        pMleft: function(){
            this.shiftPolar(Math.PI * 0.5);
        },

        pMright: function(){
            this.shiftPolar(Math.PI * 1.5);
        },

        pMback: function(){
            this.shiftPolar(Math.PI);
        },

        pTurn:  function(){
            degree = Math.random()*Math.PI * 2;
            this.rotatePainter(degree);
        },

        pTurnl: function(){
            this.rotatePainter(Math.PI * 0.25);
        },

        pTurnr: function(){
            this.rotatePainter(Math.PI * 1.75);
        },



        pExpand: function(){
            this.scaleSize(2);
        },

        pShrink: function(){
            this.scaleSize(0.5);
        },

        pSize: function(){
            let limit = Math.min(this.canvas.width,this.canvas.height);
            this.setSize(Math.random()/3*limit)
        },

        pGlow: function(){
            this.scaleAlpha(3/2);
        },

        pAlpha: function(){
            this.setAlpha(Math.floor(Math.random()*256));
        },

        pFade: function(){
            this.scaleAlpha(2/3);
        },

        pCerise: function(){
            this.setColor("DE3163");
        },
        pEmber: function(){
            this.setColor("FFa900"); /*maybe g79 or g4F*/
        },
        pLemon: function(){
            this.setColor("DDFF22");
        },
        pLime: function(){
            this.setColor("33FF00");
        },
        pAqua: function(){
            this.setColor("33F3EF");
        },
        pIndigo: function(){
            this.setColor("6F00FF");
        },
        pPink: function(){
            this.setColor("FF00FF");
        },
        pWhite: function(){
            this.setColor("FFFFFF");
        },
        pLtGray: function(){
            this.setColor("CCCCCC");
        },
        pMdGray: function(){
            this.setColor("888888");
        },
        pDkGray: function(){
            this.setColor("444444");
        },
        pBlack: function(){
            this.setColor("000000");
        },
        pColor: function(){
            let r = parseInt(Math.random()*256);
            let g = parseInt(Math.random()*256);
            let b = parseInt(Math.random()*256);
            this.painter.color = this.toHex(r) + this.toHex(g) + this.toHex(b);
        },


        // meta command wrappers

        //cleanup
        mClear: function(){
            this.initLog();
        },

        mReset: function(){
            this.initPainter();
            this.send("- painter reset");
        },

        mClean: function(){
            this.initCanvas();
            this.send("- canvas cleaned");
        },

        mCanvas: function(){
            this.cycleCanvasSize();
            let res = this.resolutions[this.resCounter];
            this.send("- canvas: " + res[2] + " (" + res[0] + "x" + res[1] + ")");
        },

        mLogging: function(){
            this.toggleClearLog();
            this.send("- auto clear log set to: " + this.clearLog);
        },


        mForget: function(){
            sessionStorage.removeItem("namespace");
            this.initCommands();
            this.send("- all learned commands forgotten");
        },

        mSnapshot:  function(){
            let filename = "kiln.png";
            this.saveSnapshot(filename);
            this.send("- snapshot saved as: " + filename);
        },

        mMemorize: function(){
            if(Object.keys(this.namespace).length === 0){
              this.send("- no commands to memorize");
            }
            else{
              let filename = "kiln.txt";
              this.saveNamespace(filename);
              this.send("- commands memorized to: " + filename);
            }
        },

        mRemember: function(){
          document.getElementById("rememberer").click();
          this.send("- remembered previously memorized commands");
        },

        mExamples: function(){
            this.cycleExamples();
            if(this.exampleCount < this.examples.length){
              this.send("- remembered example commands " + this.exampleCount);
            }
        },

        mTutorial: function(){
            if(this.hintCount == -1){
                this.advanceHint();
                document.getElementById("input").focus();
                this.send("- starting tutorial (type in the input box)")
            }
            else{
                this.hintCount = -1;
                this.hint = "";
                this.send("- tutorial stopped")
                localStorage.setItem("tutorialGrad",true)
            }
        },


        mReboot: function(){
            this.initAll();
        },

        mDelay: function(){
            this.toggleDrawDelay();
            this.send("- draw delay set to: " + this.drawDelay);
        },

        mWalls: function(){
            this.toggleWallCollision();
            this.send("- canvas walls set to: " + this.wallCollision);
        },

        mDefined: function(){
          this.toggleDisplayDefs();
          this.send("- definition display mode set to: " + this.displayDefs);
        },

        mState: function(){
          let stateString = "- state of painter:"
          for(key in this.painter){
            let jstring = JSON.stringify(this.painter[key],
                                        function(key, val) {
                                          return val.toFixed ? Number(val.toFixed(3)) : val;
                                        });
            stateString += "\n-  - " + key + ": " + jstring;
          }
          this.send(stateString);
        },

        mHelp: function(){
          this.displayHelp = !this.displayHelp;
          this.send("- help panel display set to: " + this.displayHelp);
        },

        mGuide: function(){
          this.send("- opening guidebook in new tab")
          window.open("assign.html","_blank")
        },

        // SEMANTIC ATOMS

        initAll:  function(){
            this.initCommands();
            this.initCanvas();
            this.initLog();
            this.initPainter();
            this.initHistory();
            this.drawDelay = false;
            this.clearLog = false;
            this.exampleCount = -1;
            this.hintCount = -1;
            this.hint = "";
            this.resCounter = -1;
            this.displayDefs = false;
            this.cycleCanvasSize();

            //if(localStorage.getItem("tutorialGrad")==null){
            //  this.send("- welcome to kiln, follow the tutorial to get started, or type -tutorial to skip")
            //  this.mTutorial();
            //}
            //else{
            //  this.send("- welcome back");
            //}

            this.sessionRecall();
            //this.hintCount = 0;
            //this.hint = this.hints[this.hintCount];
        },

        sessionRecall: function(){
          if(sessionStorage.getItem("namespace")){
            this.send("- remembering recent commands")
            this.namespace = JSON.parse(sessionStorage.getItem("namespace"));
          }
          else{
            this.initCommands();
          }
        },

        //   Learning

        initCommands: function(){
            this.namespace = {};
        },

        cycleExamples: function(){
            this.exampleCount = (this.exampleCount + 1) % (this.examples.length + 1);

            if(this.exampleCount < this.examples.length){
              this.namespace = this.examples[this.exampleCount];
            }
            else{
              this.send("- no further examples")
              this.sessionRecall();
            }
        },

        //   Log
        initLog: function(){
            this.output = "";
        },
        send: function(text){
            let prefix = "> "
            if(text[0]=="-"||text[0]=="?"){
                prefix = ""
            }
            if(this.clearLog){
                this.output="";
            }
            this.output = prefix + text + "\n" + this.output;
        },
        toggleClearLog: function(){
            this.clearLog = !this.clearLog;
        },

        //   Painter

        initPainter: function(){
            let limit = Math.min(this.canvas.width,this.canvas.height);
            this.painter = {
                pos: {
                    x:this.canvas.width/2,
                    y:this.canvas.height/2
                },
                heading: Math.PI,
                radius: limit/24,
                color: "FFFFFF",
                alpha: "FF"
            };
        },

        rotatePainter: function(rads){
            this.painter.heading = (this.painter.heading + rads) % (Math.PI * 2);
        },

        shiftPolar:   function(offset){
            let angle = (this.painter.heading + offset) % (Math.PI * 2);
            let dist = this.painter.radius * 2;

            let newX = this.painter.pos.x + dist * Math.sin(angle);
            let newY = this.painter.pos.y + dist * Math.cos(angle);

            this.setPosition(newX, newY);
        },

        setPosition: function(posX,posY){
            let x = posX;
            let y = posY;
            let w = this.canvas.width;
            let h = this.canvas.height;
            if(this.wallCollision){
                x = x < 0? 0 : x;
                x = x > w? w : x;
                y = y < 0? 0 : y;
                y = y > h? h : y;
            }
            this.painter.pos.x = x;
            this.painter.pos.y = y;
        },

        toggleWallCollision: function(){
            this.wallCollision = !this.wallCollision;
        },


        setColor: function(code){
            this.painter.color = code;
        },

        scaleAlpha: function(factor){
            let hex = this.painter.alpha;
            let val = parseInt(hex, 16);
            val = Math.floor(val*(factor));
            this.setAlpha(val);
        },
        setAlpha: function(value){
            let val = value;
            if(val < 1){
                val = 1;
            }
            else if (val > 255){
                val = 255;
            }
            this.painter.alpha = this.toHex(val);
        },
        scaleSize: function(factor){
            this.setSize(this.painter.radius * factor);
        },

        setSize: function(value){
            let limit = Math.min(this.canvas.width,this.canvas.height);
            let val = value;
            if(value < 1){
                val = 1;
            }
            else if(value > limit){
                val = limit;
            }
            this.painter.radius = val;
        },

        //   Canvas
        setCanvasNative: function(){
            let w = window.screen.width * window.devicePixelRatio;
            let h = window.screen.height * window.devicePixelRatio;
            this.resolutions[0] = [w, h, "Native"];

            let res = this.resolutions[this.resCounter];
            this.canvas.width = res[0];
            this.canvas.height = res[1];
        },

        initCanvas: function(){
            this.ctx.beginPath();
            this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = this.canvasColor;
            this.ctx.fill();
        },

        cycleCanvasSize: function(){
            this.resCounter = (this.resCounter + 1) % this.resolutions.length;
            let res = this.resolutions[this.resCounter];
            this.canvas.width = res[0];
            this.canvas.height = res[1];
            this.initCanvas();
            this.initPainter();
        },

        drawCircle: function(fill){
            let x = this.painter.pos.x;
            let y = this.painter.pos.y;
            let rad = this.painter.radius;
            let col = "#" + this.painter.color + this.painter.alpha;
            let ctx = this.ctx;

            ctx.beginPath();
            ctx.arc(x,y,rad,0,2*Math.PI,false);
            if(fill){
                ctx.fillStyle=col;
                ctx.fill();
            }
            else{
                ctx.strokeStyle=col;
                ctx.lineWidth = rad / 4;
                ctx.stroke();
            }
        },

        drawSquare: function(fill){
            let x = this.painter.pos.x;
            let y = this.painter.pos.y;
            let rad = this.painter.radius;
            let col = "#" + this.painter.color + this.painter.alpha;
            let ctx = this.ctx;

            ctx.beginPath();
            ctx.rect(x-rad, y-rad, rad*2, rad*2);
            if(fill){
                ctx.fillStyle=col;
                ctx.fill();
            }
            else{
                ctx.strokeStyle=col;
                ctx.lineWidth = rad / 4;
                ctx.stroke();
            }
        },

        toggleDrawDelay: function(){
            this.drawDelay = !this.drawDelay;
        },

        toggleDisplayDefs: function(){
            this.displayDefs = !this.displayDefs;
        },

        saveSnapshot: function(filename){
            let dummy = document.createElement('a');
            dummy.download = filename;
            dummy.href = this.canvas.toDataURL('image/png', 1.0).replace('image/octa');
            dummy.click();
        },

        saveNamespace: function(filename){
            let dummy = document.createElement('a');
            dummy.download = filename;
            dummy.href = 'data:text/plain;charset=utf-8,' + JSON.stringify(this.namespace,null,2);
            dummy.click();
        },

        loadNamespace: function(ev){
            let rememberer = document.getElementById("rememberer");
            let file = ev.target.files[0];
            let reader = new FileReader();
            reader.onload = e => this.namespace = JSON.parse(e.target.result);
            reader.readAsText(file);
        },

        nukeStorage: function(){
            localStorage.removeItem("tutorialGrad");
            sessionStorage.removeItem("namespace");
        }
    }
})
