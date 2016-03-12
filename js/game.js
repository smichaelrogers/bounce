var PLATFORM_HEIGHT = 10;
var ROWS = 50;
var COLUMNS = 20;
var ROW_HEIGHT = 400;
var COLUMN_WIDTH = 200;
var canvas;
var w = 800;
var h = 400;
var ticks = 1;
var round = 1;
var difficulty = 10;
var jumpHeld = false;
var diveHeld = false;
var paused = true;
var platforms = [];
var stage;
var worldWidth;
var worldHeight;
var collisionTarget;
var roundField;
var distanceField;
var jumpField;
var gravityField;
var grid = [];
var ball = new Ball();
var world = new createjs.Container();
createjs.Ticker.setFPS(60);
document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

function init() {
  canvas = document.getElementById("canvas");
  gameDiv = document.getElementById("game");
  jumpField = document.getElementById("jumps");
  distanceField = document.getElementById("distance");
  gravityField = document.getElementById("gravity");
  roundField = document.getElementById("round");
  stage = new createjs.Stage(canvas);
  stage.addChild(world);
  reset();
}

function reset() {
  pause();
  canvas.onclick = null;
  world.removeAllChildren();
  
  ball.reset();
  difficulty = 10;
  round = 1;
  ticks = 1;
  world.x = 0;
  world.y = 0;
  jumpHeld = false;
  diveHeld = false;
  roundField.innerHTML = 1;
  distanceField.innerHTML = 0;
  jumpField.innerHTML = "▰▰▰▰▰▰";
  gravityField.innerHTML = (ball.a * 10).toFixed(1);

  var setPlatform = false;
  var rn, p, startX, startY, gapX, gapY, pX, pY, addChance, totalChance, x, y;
  grid = [];
  platforms = [];
  worldWidth = 0;
    
  for(x = 0; x <= COLUMNS; x++) {
    grid[x] = [];
    for(y = 0; y <= ROWS; y++) {
      if(Math.random() > 0.5) {
        grid[x][y] = true;
      } else {
        grid[x][y] = false;
      }
    }
  }
  for(x = 1; x <= COLUMNS; x++) {
    addChance = 200;
    totalChance = 100;
    grid[x] = [];
    rn = Math.random() * 100.0;
    if(rn < 50.0) {
      grid[x][0] = true;
    } else {
      grid[x][0] = false;
    }
    if(rn > 50.0) {
      grid[x][ROWS + 1] = true;
    } else {
      grid[x][ROWS + 1] = false;
    }
    for(y = 1; y <= ROWS; y++) {
      grid[x][y] = true;
      rn = Math.random() * totalChance;
      if(grid[x][y - 1]) {
        if(grid[x - 1][y - 1] && grid[x - 1][y] && grid[x - 1][y + 1]) {
          if(rn < addChance * 8.0) {
            grid[x][y] = false;
          }
        } else {
          if(grid[x - 1][y - 1] && grid[x - 1][y]) {
            if(rn < addChance / 4) {
              grid[x][y] = false;
            }
          } else if(grid[x - 1][y] && grid[x - 1][y + 1]) {
            if(rn < addChance * 2.0) {
              grid[x][y] = false;
            }
          } else if(grid[x - 1][y - 1] && grid[x - 1][y + 1]) {
            if(rn < addChance / 2) {
              grid[x][y] = false;
            }
          }
        }
      } else if(rn > addChance) {
        if(grid[x - 1][y - 1] && grid[x - 1][y] && grid[x - 1][y + 1]) {
          if(rn < addChance) {
            grid[x][y] = false;
          }
        } else if(grid[x - 1][y] && grid[x - 1][y + 1]) {
          if(rn < addChance) {
            grid[x][y] = false;
          }
        }
      }
      
      if(!grid[x][y]) {
        startX = (x - 1) * COLUMN_WIDTH;
        startY = (y - 1) * ROW_HEIGHT;
        pX = (Math.pow(Math.random(), 2) * COLUMN_WIDTH) + (0.5 * COLUMN_WIDTH);
        pY = (Math.random() * ROW_HEIGHT);
        gapX = COLUMN_WIDTH - pX;
        startX += gapX;
        if(x % 2 === 0) {
          startY += pY;
        } else {
          startY -= pY;
        }
        addChance *= 0.80;
        p = new Platform(startX, startY, difficulty, pX);
        platforms.push(p);
        world.addChild(p);
      } else {}
    }
  }
  
  worldWidth += COLUMN_WIDTH * COLUMNS;
  worldHeight = ROW_HEIGHT * ROWS;
  
  ball.x = 200;
  ball.y = 200;
  
  world.addChild(ball);
  stage.clear();
  stage.update();
  
  canvas.onclick = unpause;
}

function tick(event) {
  ticks += 1;
  if(jumpHeld) {
    ball.jump();
  } else if(diveHeld) {
    ball.dive();
  } else {
    ball.releaseJump();
  }
  worldY = 200 - ball.y;
  var diff = Math.abs(worldY - world.y);
  if(diff > 20) {
    if(world.y < worldY) {
      world.y += 10 * (diff / 80);
    } else if(world.y >= worldY) {
      world.y -= 10 * (diff / 80);
    }
  }
  collisionTarget = null;
  platforms.forEach(function (platform) {
    platform.tick(event);
    if(!collisionTarget && ball.t > 0.1) {
      if(ball.x < platform.x + platform.sizeX + difficulty) {
        if(ball.x > platform.x - difficulty - ball.size) {
          if(ball.y > platform.y + platform.sizeY) {
            if(ball.y + (ball.dY) < platform.y + platform.sizeY && ball.dY < 0) {
              collisionTarget = platform;
            }
          } else if(ball.y + ball.size < platform.y && ball.dY > 0) {
            if(ball.y + ball.size + ball.dY > platform.y) {
              collisionTarget = platform;
            }
          } else if(ball.y - 10 < platform.y + platform.sizeY && ball.y > platform.y + platform.sizeY - 2) {
            collisionTarget = platform;
          }
        }
      }
    }
    if(platform.x < 0 - platform.sizeX) {
      platform.reposition(worldWidth, difficulty);
    }
  });
  if(collisionTarget) {
    ball.hit(collisionTarget);
  } else if(ball.y < -1000) {
    reset();
  }
  if(ticks % 100 === 0) {
    ball.recognizeAltitude(worldHeight);
    gravityField.innerHTML = (ball.a * 10).toFixed(1);
  } else if(ticks > 500) {
    round += 1;
    ticks = 1;
    increaseDifficulty();
    roundField.innerHTML = round;
  }
  distanceField.innerHTML = Math.floor((worldHeight - ball.y) / 10);
  jumpField.innerHTML = Array(ball.jumps + 1).join("▰");
  ball.tick();
  stage.update(event);
}

function increaseDifficulty() {
  difficulty += 1.2;
  platforms.forEach(function (platform) {
    platform.increaseSpeed();
  });
}

function handleKeyDown(e) {
  switch(e.keyCode) {
  case 80:
    if(paused) {
      unpause();
    } else {
      pause();
    }
    break;
  case 38:
    if(!jumpHeld) {
      jumpHeld = true;
      diveHeld = false;
    }
    break;
  case 40:
    if(!diveHeld) {
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
  if(createjs.Ticker.hasEventListener("tick")) createjs.Ticker.removeEventListener("tick", tick);
  paused = true;
  gameDiv.classList.add('paused');
}

function unpause() {
  if(!createjs.Ticker.hasEventListener("tick")) createjs.Ticker.addEventListener("tick", tick);
  paused = false;
  gameDiv.classList.remove('paused');
}
