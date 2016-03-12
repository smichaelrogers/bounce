# Bounce
[scottmichael.net/bounce](http://www.scottmichael.net/bounce)

A game about a bouncing ball

Uses canvas, some physics, and a little bit of:

```javascript

p.applySquish = function () {
  // don't let the ball squish itself inside out
  if (this.scaleY < 0.95 && this.scaleY > 0.8) {
    this.scaleY += (Math.abs(1.0 - this.scaleY) / 12);
  } else if (this.scaleY > 1.05 && this.scaleY < 1.3) {
    this.scaleY -= (Math.abs(1.0 - this.scaleY) / 8); }
    
  // same thing for the x axis
  if (this.scaleX < 0.95 && this.scaleX > 0.8) {
    this.scaleX += (Math.abs(1.0 - this.scaleX) / 12);
  } else if (this.scaleX > 1.05 && this.scaleX < 1.3) {
    this.scaleX -= (Math.abs(1.0 - this.scaleX) / 12); }

  // determine current squishiness with shape normalizing over time
  this.idx = (this.idx + 1) % 3;
  this.dYN[this.idx] = this.dY / 40;
  var s = 0;
  for (var i = 0; i < 3; i++) s += this.dYN[i];
  this.squish = s / 3;
  this.scaleX = 1.0 + (this.squish / 2);
  this.scaleY = 1.0 - (this.squish / 2);
}

```

![in action](https://raw.githubusercontent.com/smichaelrogers/bounce/master/screen.png "in action")


## Copyright

Copyright © 2015-2016 Scott Rogers – Released under MIT License
