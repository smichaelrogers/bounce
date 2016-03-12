(function (window) {
  var colors = ["rgba(0, 110, 255, 0.15)", "rgba(255, 46, 0, 0.15)", "rgba(255, 214, 0, 0.15)", "rgba(255, 138, 0, 0.15)", "rgba(0, 33, 255, 0.15)", "rgba(172, 172, 172, 0.15)", "rgba(175, 175, 175, 0.15)"];
  var sizeY = 10;

  function Platform(x, y, vX, sizeX) {
    this.Container_constructor()
    var type = Math.floor(Math.random() * 7);
    var color = colors[type];
    var b = Math.sqrt(Math.pow(sizeX, 2) - Math.pow(0.5 * sizeX, 2));
    this.startX = x;
    this.startY = y;
    this.x = this.startX;
    this.y = this.startY;
    this.sizeX = sizeX;
    this.sizeY = 10;
    this.vX = vX;
    this.platform = new createjs.Shape();
    this.platformTop = new createjs.Shape();
    this.platformTop.graphics.ss(2).s("#aaaaaa").f("white").lt(0, 0).lt(-5, sizeY).lt(sizeX + 5, sizeY).lt(sizeX, 0).lt(0, 0).closePath();
    this.platform.graphics.f(color).lt(0, 0).lt(sizeX - 2, 0).lt(0.5 * sizeX, -b).lt(2, 0).lt(0, 0).closePath();
    this.addChild(this.platform, this.platformTop);
    this.setChildIndex(this.platform, 2);
    this.setChildIndex(this.platformTop, 1);
  }
  var p = createjs.extend(Platform, createjs.Container);
  p.vX;
  p.startX;
  p.startY;
  p.sizeX;
  p.sizeY;
  p.tick = function (e) {
    this.x -= this.vX;
  }
  p.reposition = function (pos, newVX) {
    this.vX = newVX;
    this.x = pos - this.sizeX;
  }
  p.increaseSpeed = function () {
    this.vX += 1.2;
  }
  window.Platform = createjs.promote(Platform, "Container");
})(window);
