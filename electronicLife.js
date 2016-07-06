var plan =
  [ "########################################",
    "#        #   #     o                  ##",
    "#                                      #",
    "#           ######                     #",
    "##          #    #        ##           #",
    "###             ##         #           #",
    "#             ###          #           #",
    "#  ####                                #",
    "#  ##          o                       #",
    "#o  #           o                  ### #",
    "#   #                                  #",
    "########################################"];

function Vector( x, y ){
  this.x = x;
  this.y = y;

  this.plus = function(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  };
}

function Grid( width, height ){
  this.area = new Array( width * height );
  this.width = width;
  this.height = height;

  this.isInside = function(vector) {
    return vector.x >= 0 && vector.x < this.width
    && vector.y >= 0 && vector.y < this.height;
  };

  this.get = function(vector) {
    return this.area[ vector.x + this.width * vector.y];
  };

  this.set = function(vector, value) {
    this.area[vector.x + this.width * vector.y] = value;
  };
}

Grid.prototype.forEach = function(f, context) {
  for ( var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      var value = this.area[x + y * this.width];
      if ( value != null)
        f.call(context, value, new Vector(x, y));
    }
  }
};

//test code ****************** +==={========>
var grid = new Grid(5,5);
console.log(grid.get(new Vector(1,1)));
grid.set(new Vector(1,1), "X");
console.log(grid.get(new Vector(1,1)));
// **************************

var directions= {
  "n": new Vector( 0, -1 ),
  "ne": new Vector( 1, -1 ),
  "e": new Vector( 1, 0 ),
  "se": new Vector( 1, 1 ),
  "s": new Vector( 0, 1 ),
  "sw": new Vector( -1, 1 ),
  "w": new Vector( -1, 0 ),
  "nw": new Vector( -1, -1 )
};

function randomElement(array){
  return array[Math.floor(Math.random() * array.length)];
}

var directionNames = "n ne e se s sw w nw".split(" ");

//simple critter randomly looks for open space to move
function BouncingCritter() {
  this.direction = randomElement(directionNames);
  this.act = function(view) {
    if (view.look(this.direction) != " ")
      this.direction = view.find(" ") || "s";
    return {type: "move", direction: this.direction};
  };
}

//Legend of world objects
function elementFromChar(legend, ch) {
  if (ch == " ")
    return null;
  var element = new legend[ch]();
  element.originChar = ch;
  return element;
}

function World( map, legend ) {
  var grid = new Grid(map[0].length, map.length);
  this.grid = grid;
  this.legend = legend;

  map.forEach(function( line, y ){
    for ( var x = 0; x < line.length; x++)
      grid.set(new Vector( x, y ),
        elementFromChar( legend, line[x] ));
  });
}

function charFromElement(element) {
  if (element == null)
    return " ";
  else {
    return element.originChar;
  }
}

//build world grid for display
World.prototype.toString = function() {
  var output = "";
  for ( var y = 0; y < this.grid.height; y++) {
    for ( var x = 0; x < this.grid.width; x++) {
      var element = this.grid.get(new Vector( x, y ));
      output += charFromElement(element);
    }
    output += "\n";
  }
  return output;
};

World.prototype.turn = function() {
  var acted = [];
  this.grid.forEach(function(critter, vector){
    if (critter.act && acted.indexOf(critter) == -1 ) {
      acted.push(critter);
      this.letAct(critter, vector);
    }
  }, this);
};

World.prototype.letAct = function(critter, vector) {
  var action = critter.act(new View(this, vector));
  if (action && action.type == "move") {
    var dest = this.checkDestination(action, vector);
    if (dest && this.grid.get(dest) == null) {
      this.grid.set(vector, null);
      this.grid.set(dest, critter);
    }
  }
};

World.prototype.checkDestination = function(action, vector) {
  if (directions.hasOwnProperty(action.direction)) {
    var dest = vector.plus(directions[action.direction]);
    if (this.grid.isInside(dest))
      return dest;
  }
};
//end of World constructor, ha!


function Wall(){}

var world = new World( plan,
                      {"#": Wall,
                      "o": BouncingCritter});
console.log(world.toString());

//test***************** +==={========>
var test = {
  prop: 10,
  addPropTo: function(array){
    return array.map(function(elt){
      return this.prop + elt;
    }, this);
  }
};

console.log(test.addPropTo([5]));
//*********************

function View(world, vector) {
  this.world = world;
  this.vector = vector;
}

View.prototype.look = function(dir) {
  var target = this.vector.plus(directions[dir]);
  if (this.world.grid.isInside(target))
    return charFromElement(this.world.grid.get(target));
  else
    return "#";
};

View.prototype.findAll = function(ch) {
  var found = [];
  for (var dir in directions)
    if (this.look(dir) == ch)
      found.push(dir);
  return found;
};

View.prototype.find = function(ch) {
  var found = this.findAll(ch);
  if (found.length == 0) return null;
  return randomElement(found);
};

//end of View prototype

//5 turns for the world to move
for (var i = 0; i < 5; i++){
  world.turn();
  console.log(world.toString());
}
