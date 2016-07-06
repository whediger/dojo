
function Vector( x, y ) {
  this.x = x;
  this.y = y;
  this.plus = function( xIn, yIn ) {
    this.x = this.x + xIn;
    this.y = this.y + yIn;
    return "Plus x and y are: ( " + this.x + ", " + this.y + " )";
  }
  this.minus = function ( xIn, yIn ) {
    this.x = this.x - xIn;
    this.y = this.y - yIn;
    return "Minus x and y are: ( " + this.x + ", " + this.y + " )";
  }
  this.length  = function () {
    //using pythagorean theorem to find length of vector
    var cSquared  = (this.x * this.x) + (this.y * this.y);
    var c = Math.sqrt(cSquared);
    return c;
  }
}

var myVector = new Vector(5, 5);
var newVector = new Vector(5, 5);

console.log(myVector.plus( 3, 3 ));
console.log("new vector: " + newVector.minus( 3, 3 ));
console.log(myVector.minus( 3, 3 ));
console.log(myVector.minus( 3, 3 ));
console.log(myVector.plus( 4, 4 ));
console.log("length of vector: " + myVector.length());
