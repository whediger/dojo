// --initialization +==}========>
var points = 0;
document.getElementById('points').innerHTML = points;

var levelBG = {
    level: 0,
    lavaImg: "",
    setLevel: function(level) {
      this.level = level;
    },
    setLava: function() {
      this.lavaImg = " lava" + this.level;
    },
    getLava: function() {
      return this.lavaImg;
    },
    setBG: function(l) {
      this.level = l;
    },
    getBG: function() {
        return "background" + this.level;
    }
}

function stopLevelMedia() {
    level0.pause();
    level1.pause();
    level2.pause();
    level3.pause();
}

function newLevelMedia(level) {
    if (level === 0) {
        level0.play();
    } else if (level === 1) {
        level1.play();
    } else if (level === 2) {
        level2.play();
    } else if (level === 3) {
        level3.play();
    }
}

function randomTiles(level) {
    $(document).ready(function() {
        var tileNo = 0;
        if (level === 0)
            tileNo = 26;
        else if (level == 1)
            tileNo = 10;
        else if (level == 2)
            tileNo = 8;
        else if (level == 3)
            tileNo = 4;
        else if (level == 4)
            tileNo = 7;
        var walls = document.getElementsByClassName('wall');
        for (var i = 0; i < walls.length; i++) {
            var e = Math.floor(Math.random() * tileNo) + 1;
            walls[i].style.backgroundImage = "url(images/bg" + level + "/" + e + ".bmp)";
        }
        var hazard = document.getElementsByClassName('lava');
        for (var i = 0; i < hazard.length; i++) {
            hazard[i].style.backgroundImage = "url(images/bg" + level + "/hazard/hazard" + level + ".gif)";
        }
    });
};

//--sprite actions +==}========>
var playerActCl = {
    action: "",
    actionCounter: 0,
    walkStep: false,
    setAction: function(classIn) {
        this.action = "";
        if(classIn === 'lookLeft' || classIn === 'lookRight'){
          this.actionCounter++;
          if(this.actionCounter == 5) {
            if(this.walkStep)
              this.walkStep = false;
            else if(!this.walkStep)
              this.walkStep = true;
              this.action = ' playerStep';
            this.actionCounter = 0;
          }
        }
        this.action = this.action + " " + classIn;
    },
    getAction: function() {
        return this.action;
    }
}

//sounds --- +==}========>
var go = new Audio('/sounds/soundfx/3-2-1-go.wav');
go.loop = false;

function shimmer() {
    var sh = new Audio('/sounds/soundfx/shimmer_1.ogg');
    sh.loop = false;
    return sh;
}
var level0 = new Audio('/sounds/jump-and-run-tropics.ogg');
level0.loop = true;
var level1 = new Audio('/sounds/bubble_nogb_v.mp3');
level1.loop = true;
var level2 = new Audio('/sounds/nebula.ogg');
level2.loop = true
var level3 = new Audio('/sounds/Martin_R_-_Phat_Bassy_Birds.mp3');
level3.loop = true

var end = new Audio('/sounds/soundfx/end_level.ogg');
end.loop = false;
var yell = new Audio('/sounds/soundfx/3yell14.wav');
yell.loop = false;
//------------------------

var actorChars = {
    "@": Player,
    "o": Coin,
    "=": Lava,
    "|": Lava,
    "v": Lava
};

//load level
function Level(plan) {
    this.width = plan[0].length;
    this.height = plan.length;
    this.grid = [];
    this.actors = [];

    for (var y = 0; y < this.height; y++) {
        var line = plan[y],
            gridLine = [];
        for (var x = 0; x < this.width; x++) {
            var ch = line[x],
                fieldType = null;
            var Actor = actorChars[ch];
            if (Actor) {
                this.actors.push(new Actor(new Vector(x, y), ch));
                $('.player').css('margin-left', x * scale);
                $('.player').css('margin-top', (y - 1.7) * scale);
            } else if (ch == "x")
                fieldType = "wall";
            else if (ch == "!")
                fieldType = "lava";
            gridLine.push(fieldType);
        }
        this.grid.push(gridLine);
    }

    this.player = this.actors.filter(function(actor) {
        return actor.type == "player";
    })[0];
    this.status = this.finishDelay = null;
}

//exends load level
Level.prototype.isFinished = function() {
    return this.status != null && this.finishDelay < 0;
};

//-- create models for actors +==}========>
function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype.plus = function(other) {
    return new Vector(this.x + other.x, this.y + other.y);
};

Vector.prototype.times = function(factor) {
    return new Vector(this.x * factor, this.y * factor);
};

function Player(pos) {
    this.pos = pos.plus(new Vector(0, -1.7));
    this.size = new Vector(1, 1.33);
    this.speed = new Vector(0, 0);
}
Player.prototype.type = "player";

function Lava(pos, ch) {
    this.pos = pos;
    this.size = new Vector(1, 1);
    if (ch == "=") {
        this.speed = new Vector(2, 0);
    } else if (ch == "|") {
        this.speed = new Vector(0, 2);
    } else if (ch == "v") {
        this.speed = new Vector(0, 3);
        this.repeatPos = pos;
    }
}
Lava.prototype.type = "lava";

function Coin(pos) {
    this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
    this.size = new Vector(.75, 1);
    this.wobble = Math.random() * Math.PI * 2;
}
Coin.prototype.type = "coin";

//---create DOM elements +==}========>
function elt(name, className) {
    var elt = document.createElement(name);
    if (className === 'background') className += ' ' + levelBG.getBG();
    if (className) elt.className = className;
    return elt;
}

function DOMDisplay(parent, level) {
    this.wrap = parent.appendChild(elt("div", "game"));
    this.level = level;

    this.wrap.appendChild(this.drawBackground());
    this.actorLayer = null;
    this.drawFrame();
}

var scale = 30; //px/object

DOMDisplay.prototype.drawBackground = function() {
    var table = elt("table", "background");
    table.style.width = this.level.width * scale + "px";
    this.level.grid.forEach(function(row) {
        var rowElt = table.appendChild(elt("tr"));
        rowElt.style.height = scale + "px";
        row.forEach(function(type) {
            rowElt.appendChild(elt("td", type));
        });
    });
    return table;
};

DOMDisplay.prototype.drawActors = function() {
    var wrap = elt("div");
    this.level.actors.forEach(function(actor) {
        if (actor.type == 'player') {
            var rect = wrap.appendChild(elt("div", "actor " + actor.type + playerActCl.getAction()));
            playerActCl.setAction("");
        } else if (actor.type == 'lava') {
            var rect = wrap.appendChild(elt("div", "actor " + actor.type + levelBG.getLava()));
        } else {
            var rect = wrap.appendChild(elt("div", "actor " + actor.type));
        }
        rect.style.width = actor.size.x * scale + "px";
        rect.style.height = actor.size.y * scale + "px";
        rect.style.left = actor.pos.x * scale + "px";
        rect.style.top = actor.pos.y * scale + "px";
    });
    return wrap;
};

DOMDisplay.prototype.drawFrame = function() {
    if (this.actorLayer)
        this.wrap.removeChild(this.actorLayer);
    this.actorLayer = this.wrap.appendChild(this.drawActors());
    this.wrap.className = "game" + (this.level.status || "");
    this.scrollPlayerIntoView();
};

DOMDisplay.prototype.scrollPlayerIntoView = function() {
    var width = this.wrap.clientWidth;
    var height = this.wrap.clientHeight;
    var margin = width / 3;

    //the viewport
    var left = this.wrap.scrollLeft,
        right = left + width;
    var top = this.wrap.scrollTop,
        bottom = top + height;

    var player = this.level.player;
    var center = player.pos.plus(player.size.times(0.5)).times(scale);

    if (center.x < left + margin)
        this.wrap.scrollLeft = center.x - margin;
    else if (center.x > right - margin)
        this.wrap.scrollLeft = center.x + margin - width;
    if (center.y < top + margin)
        this.wrap.scrollTop = center.y - margin;
    else if (center.y > bottom - margin)
        this.wrap.scrollTop = center.y + margin - height;
};

DOMDisplay.prototype.clear = function() {
    this.wrap.parentNode.removeChild(this.wrap);
};

Level.prototype.obstacleAt = function(pos, size) {
    var xStart = Math.floor(pos.x);
    var xEnd = Math.ceil(pos.x + size.x);
    var yStart = Math.floor(pos.y);
    var yEnd = Math.ceil(pos.y + size.y);

    if (xStart < 0 || xEnd > this.width || yStart < 0)
        return "wall";
    if (yEnd > this.height)
        return "lava";
    for (var y = yStart; y < yEnd; y++) {
        for (var x = xStart; x < xEnd; x++) {
            var fieldType = this.grid[y][x];
            if (fieldType) return fieldType;
        }
    }
};

Level.prototype.actorAt = function(actor) {
    for (var i = 0; i < this.actors.length; i++) {
        var other = this.actors[i];
        if (other != actor &&
            actor.pos.x + actor.size.x > other.pos.x &&
            actor.pos.x < other.pos.x + other.size.x &&
            actor.pos.y + actor.size.y > other.pos.y &&
            actor.pos.y < other.pos.y + other.size.y)
            return other;
    }
};

var maxStep = 0.05;

Level.prototype.animate = function(step, keys) {
    if (this.status != null)
        this.finishDelay -= step;

    while (step > 0) {
        var thisStep = Math.min(step, maxStep);
        this.actors.forEach(function(actor) {
            actor.act(thisStep, this, keys);
        }, this);
        step -= thisStep;
    }
};

Lava.prototype.act = function(step, level) {
    var newPos = this.pos.plus(this.speed.times(step));
    if (!level.obstacleAt(newPos, this.size))
        this.pos = newPos;
    else if (this.repeatPos)
        this.pos = this.repeatPos;
    else
        this.speed = this.speed.times(-1);
};

var wobbleSpeed = 8,
    wobbleDist = 0.07;

Coin.prototype.act = function(step) {
    this.wobble += step * wobbleSpeed;
    var wobblePos = Math.sin(this.wobble) * wobbleDist;
    this.pos = this.basePos.plus(new Vector(0, wobblePos));
};

var playerXSpeed = 7;

Player.prototype.moveX = function(step, level, keys) {
    this.speed.x = 0;
    if (keys.left) {
        playerActCl.setAction("lookLeft")
        this.speed.x -= playerXSpeed;
    }
    if (keys.right) {
        playerActCl.setAction("lookRight")
        this.speed.x += playerXSpeed;
    }
    var motion = new Vector(this.speed.x * step, 0);
    var newPos = this.pos.plus(motion);
    var obstacle = level.obstacleAt(newPos, this.size);
    if (obstacle)
        level.playerTouched(obstacle);
    else
        this.pos = newPos;
};

// physics coefficients
var gravity = 30;
var jumpSpeed = 17;

Player.prototype.moveY = function(step, level, keys) {
    this.speed.y += step * gravity;
    var motion = new Vector(0, this.speed.y * step);
    var newPos = this.pos.plus(motion);
    var obstacle = level.obstacleAt(newPos, this.size);
    if (obstacle) {
        level.playerTouched(obstacle);
        if (keys.up && this.speed.y > 0)
            this.speed.y = -jumpSpeed;
        else
            this.speed.y = 0;
    } else {
        this.pos = newPos;
    }
};

Player.prototype.act = function(step, level, keys) {
    this.moveX(step, level, keys);
    this.moveY(step, level, keys);

    var otherActor = level.actorAt(this);
    if (otherActor)
        level.playerTouched(otherActor.type, otherActor);
    //loosing animation, slow dropdown
    if (level.status == "lost") {
        this.pos.y += step;
        this.size.y -= step;
    }
};

Level.prototype.playerTouched = function(type, actor) {
    if (type == "lava" && this.status == null) {
        yell.play();
        stopLevelMedia();
        points = 0;
        document.getElementById('points').innerHTML = points;
        this.finishDelay = 3;
        this.status = "lost";

    } else if (type == "coin") {
        var coinGrab = new shimmer();
        coinGrab.play();
        this.actors = this.actors.filter(function(other) {
            return other != actor;
        });
        if (!this.actors.some(function(actor) {
                points += 100;
                document.getElementById('points').innerHTML = points;
                return actor.type == "coin";
            })) {
            stopLevelMedia();
            end.play();
            this.finishDelay = 8;
            this.status = "won";
        }
    }
};

var arrowCodes = {
    37: "left",
    38: "up",
    39: "right"
};

function trackKeys(codes) {
    var pressed = Object.create(null);

    function handler(event) {
        if (codes.hasOwnProperty(event.keyCode)) {
            var down = event.type == "keydown";
            pressed[codes[event.keyCode]] = down;
            event.preventDefault();
        }
    }
    addEventListener("keydown", handler);
    addEventListener("keyup", handler);
    return pressed;
}

function runAnimation(frameFunc) {
    var lastTime = null;

    function frame(time) {
        var stop = false;
        if (lastTime != null) {
            var timeStep = Math.min(time - lastTime, 100) / 1000;
            stop = frameFunc(timeStep) === false;
        }
        lastTime = time;
        if (!stop)
            requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

var arrows = trackKeys(arrowCodes);

function runLevel(level, Display, andThen) {

    var display = new Display(document.body, level);
    runAnimation(function(step) {
        level.animate(step, arrows);
        display.drawFrame(step);
        if (level.isFinished()) {
            display.clear();
            if (andThen)
                andThen(level.status);
            return false;
        }
    });
}

function runGame(plans, Display) {
    function startLevel(n) {
        levelBG.setBG(n);
        levelBG.setLava();
        newLevelMedia(n);
        randomTiles(n);
        runLevel(new Level(plans[n]), Display, function(status) {
            if (status == "lost")
                startLevel(n);
            else if (n < plans.length - 1)
                startLevel(n + 1);
            else
                console.log("You win!"); //TODO add grand finale
        });
    }
      startLevel(0);
}

function startGame() {
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('score').style.display = 'block';
  runGame(GAME_LEVELS, DOMDisplay);
}
