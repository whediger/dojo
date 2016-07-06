

function Vector( x, y ){
  this.x = x;
  this.y = y;

  this.plus = function( xIn, yIn ) {
    return new Vector(this.x + xIn, this.y + yIn);
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
//test code ****************** +==={========>
var grid = new Grid(5,5);
console.log(grid.get(new Vector(1,1)));
grid.set(new Vector(1,1), "X");
console.log(grid.get(new Vector(1,1)));
// **************************

var direction= {
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

function BouncingCritter() {
  this.direction = randomElement(directionNames);
  this.act = function(view) {
    if (view.look(this.direction) != " ")
      this.direction = view.find(" ") || "s";
    return {type: "move", direction: this.direction};
  };
}
