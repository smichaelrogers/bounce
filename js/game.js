var ROWS = 60, COLUMNS = 6, ROW = 500, COL = 400;
var WORLD_H = ROWS * ROW;
var WORLD_W = COLUMNS * COL;
var PLATFORM_HEIGHT = 12;
var pfColors = [
  "rgba(0, 110, 255, 0.15)",
  "rgba(255, 214, 0, 0.15)",
  "rgba(255, 138, 0, 0.15)",
  "rgba(0, 33, 255, 0.15)",
  "rgba(172, 172, 172, 0.15)",
  "rgba(255, 46, 0, 0.1)"];
var canvas, stage, worldY, collisionTarget, roundField, jumpField, 
  gravityField, distanceField, difficulty, diff, round, ticks, platforms;
var paused = true;
var diveHeld = false,
    jumpHeld = false;
var w = 800, h = 450;

var ball = new Ball();
var world = new createjs.Container();

document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;
createjs.Ticker.setFPS(60);

function init() {
  canvas        = document.getElementById("canvas");
  gameDiv       = document.getElementById("game");
  jumpField     = document.getElementById("jumps");
  distanceField = document.getElementById("distance");
  gravityField  = document.getElementById("gravity");
  roundField    = document.getElementById("round");
  stage = new createjs.Stage(canvas);
  stage.addChild(world);
  reset();
}

function reset() {
  pause();
  difficulty = 8;
  round = 1;
  ticks = 0;
  jumpHeld = false;
  diveHeld = false;
  world.x = 0;
  world.y = 0;
  ball.x = 150;
  ball.y = 500;
  
  world.removeAllChildren();
  ball.reset();
  roundField.innerHTML = round;
  updateDOM();
  setPlatforms();
  
  world.addChild(ball);
  world.setChildIndex(ball, 0);
  stage.clear();
  stage.update();
  canvas.onclick = unpause;
}

function setPlatforms() {
  platforms = [];
  var addChance, pfSize, lastAdd = 0;
  for (var y = 0; y < ROWS; y += 1) {
    addChance = 0.8 - (y / ROWS / 2);
    pfSize = 40 + (Math.random() * 80) + ((1 - (y / ROWS)) * 80);
    for (var x = 0; x < COLUMNS; x += 1) {
      if (Math.random() < addChance || lastAdd > 1) {
        createPlatform(x * COL, y * ROW, pfSize);
        lastAdd = 0;
      } else { lastAdd++; }
    }
  }
}

function createPlatform(x, y, width) {
  var color = pfColors[Math.floor(Math.random() * pfColors.length)];
  var platform = new createjs.Shape();
  var pX = x - (Math.random() * (COL / 2)) - width;
  var pY = y - (Math.random() * (ROW / 2));
  var ph = PLATFORM_HEIGHT;
  var b = -(Math.sqrt(Math.pow(width, 2) - Math.pow(0.5 * width, 2)));
  platform.graphics.ss(8, 'round').s('#ccc')
    .mt(-4, 12).lt(width + 4, 12).es()
    .mt(0, 0).f(color).lt(0, 0).lt(width, 0).lt(width / 2, b).lt(0, 0).cp();
  platform.sizeX = width;
  platform.sizeY = 12;
  platform.tickEnabled = false;
  platform.x = pX;
  platform.y = pY;
  world.addChild(platform);
  platforms.push(platform);
}

function adjustCamera() {
  worldY = 200 - ball.y;
  diff = Math.abs(worldY - world.y);
  if (diff > 10) {
    if (world.y < worldY) {
      world.y += 10 * (diff / 60);
    } else if (world.y >= worldY) {
      world.y -= 10 * (diff / 60);
    }
  }
}

function updateDOM() {
  distanceField.innerHTML = Math.floor((WORLD_H - ball.y) / 10);
  jumpField.innerHTML = Array(ball.jumps + 1).join("▰");
  
  if (ticks % 100 === 0) {
    ball.recognizeAltitude(WORLD_H);
    gravityField.innerHTML = (ball.a * 10).toFixed(1);
  } else if (ticks > 500) {
    round += 1;
    ticks = 1;
    difficulty += 0.8;
    roundField.innerHTML = round;
  }
}

function checkInput() {
  if (jumpHeld) {
    ball.jump();
  } else if (diveHeld) {
    ball.dive();
  } else {
    ball.releaseJump();
  }
}

function checkCollisions() {
  collisionTarget = null;
  
  platforms.forEach(function(platform) {
    platform.x -= difficulty;
    if(platform.x < 0 - platform.sizeX) {
      platform.x = WORLD_W - platform.sizeX;
    } else {
      if (!collisionTarget) {
        if (ball.x < platform.x + platform.sizeX + difficulty && ball.x > platform.x - difficulty) {
          if (ball.dY < 0) {
            if (ball.y > platform.y + 10 + ball.dY && ball.y < platform.y + 20 - ball.dY) {
              collisionTarget = platform;
            }
          } else if (ball.y > platform.y - 20 - ball.dY && ball.y < platform.y - 10 + ball.dY) {
            collisionTarget = platform;
          }
        }
      }
    }
  });
  
  if (collisionTarget) {
    ball.hit(collisionTarget);
  } else if (ball.y < -1000) {
    reset();
    gameDiv.classList.remove('paused');
    gameDiv.classList.add('gameover');
  }
}

function handleKeyDown(e) {
  switch (e.keyCode) {
    case 32:
      if (paused) { unpause();
      } else { pause(); }
      break;
    case 38:
      if (!jumpHeld) {
        jumpHeld = true;
        diveHeld = false;
      }
      break;
    case 40:
      if (!diveHeld) {
        diveHeld = true;
        jumpHeld = false;
      }
      break;
    default:
      break;
  }
}

function handleKeyUp(e) {
  jumpHeld = false;
  diveHeld = false;
}

function pause() {
  if (createjs.Ticker.hasEventListener("tick")) createjs.Ticker.removeEventListener("tick", tick);
  paused = true;
  gameDiv.classList.add('paused');
}

function unpause() {
  if (!createjs.Ticker.hasEventListener("tick")) createjs.Ticker.addEventListener("tick", tick);
  paused = false;
  gameDiv.classList.remove('paused', 'victory', 'gameover');
}

function checkVictory() {
  if(ball.y > WORLD_H) {
    reset();
    gameDiv.classList.remove('paused');
    gameDiv.classList.add('victory');
  }
}

function tick(event) {
  ticks += 1;
  checkInput();
  adjustCamera();
  checkCollisions();
  updateDOM();  
  checkVictory();
  ball.tick();
  stage.update(event);
}
