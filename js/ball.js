(function(window) {
  function Ball() {
    this.Shape_constructor();
    this.size = 10;
    this.graphics.clear();
    this.graphics.rf(['white', '#ff0054'], [0, 1], 5, 13, 0, 3, 13, 5).dc(5, 10, 10);
  }
  var p = createjs.extend(Ball, createjs.Shape);
  p.JUMP_VELOCITY = 14.0;
  p.DIVE_VELOCITY = -30.0;
  p.INITIAL_GRAVITY = -0.7;
  p.MAX_JUMPS = 6;
  p.a;
  p.t;
  p.v0;
  p.y0;
  p.dY;
  p.jumps;
  p.jumpReleased;
  p.reset = function() {
    this.jumpReleased = true;
    this.jumps = this.MAX_JUMPS;
    this.a = this.INITIAL_GRAVITY;
    this.dY = 0.0;
    this.t = 0.0;
    this.v0 = this.JUMP_VELOCITY;
    this.y0 = 500.0;
    this.diving = false;
    this.dYN = [1, 1, 1];
    this.idx = 0;
    this.squish = 1.0;
    this.yN = 0;
    this.jumpTimer = 0.0;
  }
  p.recognizeAltitude = function(worldY) {
    this.a = this.INITIAL_GRAVITY + (Math.abs(this.y) / (worldY * 3));
  }
  p.tick = function() {
    this.applySquish();
    this.t += 1.0;
    this.jumpTimer += 1.0;
    if (this.jumpTimer >= 10 + ((this.a + 1) * 80) && this.jumps < 6) {
      this.jumps++;
      this.jumpTimer = 0;
    }
    var n = (0.5 * this.a * Math.pow(this.t, 2)) + (this.v0 * this.t) + this.y0;
    this.dY = n - this.y;
    this.y = n;
  }
  p.applySquish = function() {
    if (this.scaleY < 0.95 && this.scaleY > 0.8) {
      this.scaleY += (Math.abs(1.0 - this.scaleY) / 12);
    } else if (this.scaleY > 1.05 && this.scaleY < 1.3) {
      this.scaleY -= (Math.abs(1.0 - this.scaleY) / 8);
    }
    if (this.scaleX < 0.95 && this.scaleX > 0.8) {
      this.scaleX += (Math.abs(1.0 - this.scaleX) / 12);
    } else if (this.scaleX > 1.05 && this.scaleX < 1.3) {
      this.scaleX -= (Math.abs(1.0 - this.scaleX) / 12);
    }
    this.idx = (this.idx + 1) % 3;
    this.dYN[this.idx] = this.dY / 40;
    var s = 0;
    for (var i = 0; i < 3; i++) s += this.dYN[i];
    this.squish = s / 3;
    this.scaleX = 1.0 + (this.squish / 2);
    this.scaleY = 1.0 - (this.squish / 2);
  }
  p.hit = function(platform) {
    this.diving = false;
    if (this.dY < 0) {
      this.y0 = platform.y + platform.sizeY;
      this.v0 = Math.sqrt(Math.pow(this.a * this.dY, 2));
      this.t = 0.0;
    } else if (this.dY > 2) {
      this.y0 = platform.y - this.size;
      this.v0 = 0.8 * this.a * this.v0;
      this.t = 0.0;
    }
  }
  p.jump = function() {
    if (this.jumpReleased && this.jumps > 0 && !this.diving && (this.t > 0.15 || Math.abs(this.squish) < 0.01)) {
      this.v0 = this.JUMP_VELOCITY;
      this.t = 0.0;
      this.jumpTimer = 0;
      this.y0 = this.y;
      this.jumps--;
      this.jumpReleased = false;
      return true;
    }
    return false;
  }
  p.dive = function() {
    if (!this.diving && this.jumpReleased & this.t > 10) {
      this.t = 0.5;
      this.v0 = this.DIVE_VELOCITY;
      this.y0 = this.y + 60;
      this.jumpReleased = false;
      this.diving = true;
    }
  }
  p.releaseJump = function() {
    this.jumpReleased = true;
  }
  window.Ball = createjs.promote(Ball, "Shape");
}(window));