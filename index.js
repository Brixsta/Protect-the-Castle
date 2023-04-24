const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowRight: false,
  ArrowLeft: false,
  Space: false,
};

const global = {
  inPlay: false,
  score: 0,
  gameSpeed: 1,
  monstersKilled: 0,
  castleHealth: 100,
  explosions: [],
  enemies: [],
  phrases: [],
  dust: [],
  powerUps: [],
  dragonSpawnCounter: 0,
  dragonSpawnAmt: 1,
  dragonSpawnAmtCounter: 0,
  theme: new Audio("./audio/theme.mp3"),
  lose: new Audio("./audio/lose.wav"),
  gasp: new Audio("./audio/gasp.wav"),
  currentPowerUp: null,
};

// IIFE to start game using closure
(function () {
  const startGameButton = document.querySelector(".start-game-button");
  startGameButton.addEventListener("click", handleStartGameButtonClick);
})();

function initDragons() {
  if (global.inPlay) {
    spawnInitialDragons();
    spawnDragons();
    incrementDragonSpawnAmt();
  }
}

function spawnInitialDragons() {
  if (global.inPlay && global.enemies.length < 2) {
    for (let i = 0; i < 2; i++) {
      const coordinates = randomlySpawn();
      const dragon = new Dragon(coordinates[0], coordinates[1]);
      global.enemies.push(dragon);
    }
  }
}

function spawnDragons() {
  global.dragonSpawnCounter++;
  const interval = 150;
  const inPlay = global.inPlay;
  const amt = global.dragonSpawnAmt;
  if (global.dragonSpawnCounter >= interval && inPlay) {
    createDragon(amt);
    global.dragonSpawnCounter = 0;
  }
}

function levelUp() {
  let interval = 5;
  const dead = global.enemies.filter(
    (enemy) => !enemy.alive && !enemy.exploded
  ).length;
  player.level = Math.floor(dead / interval);
  if (player.level !== player.oldLevel) {
    player.oldLevel = player.level;
    createPowerUp();
    if (global.currentPowerUp === "movement") incrementMoveSpeed();
    if (global.currentPowerUp === "attack") incrementAttackSpeed();
    if (global.currentPowerUp === "rebuild") incrementCastleHealth(20);
  }
}

function createPowerUp() {
  let types;

  // types of power ups if health is 100 versus not
  if (global.castleHealth === 100) {
    types = ["movement", "attack"];
  } else {
    types = ["movement", "attack", "rebuild"];
  }

  const randomNum = Math.floor(Math.random() * types.length);
  const current = types[randomNum];
  global.currentPowerUp = current;
  global.powerUps = [];
  const powerUp = new PowerUp(player.x, player.y, current);
  global.powerUps.push(powerUp);
}

function incrementAttackSpeed() {
  player.spriteSpeed += 0.1;
}

function incrementMoveSpeed() {
  player.moveSpeed += 0.1;
}

function incrementCastleHealth(amt) {
  const newAmt = global.castleHealth;
  if (newAmt >= 100) {
    global.castleHealth = 100;
  } else {
    global.castleHealth += amt;
  }
  updateCastleHealth();
}

function incrementDragonSpawnAmt() {
  global.dragonSpawnAmtCounter++;
  let count = global.dragonSpawnAmtCounter;
  const interval = 1000;
  if (count >= interval) {
    global.dragonSpawnAmtCounter = 0;
    global.dragonSpawnAmt++;
  }
}

function createDragon(num) {
  const enemies = global.enemies;
  for (let i = 0; i < num; i++) {
    const coordinates = randomlySpawn();
    const drag = new Dragon(coordinates[0], coordinates[1]);
    enemies.push(drag);
  }
}

function randomlySpawn() {
  const choices = ["vertical", "horizontal"];
  const result = choices[Math.floor(Math.random() * choices.length)];
  let x, y, xChoices, yChoices;

  // use salt variables to add even more variability
  const salt = [-300, -200, -100, -50, 50, 100, 200, 300];
  const xsalt = salt[Math.floor(Math.random() * salt.length)];
  const ysalt = salt[Math.floor(Math.random() * salt.length)];

  if (result === "vertical") {
    xChoices = [
      canvas.width / 2 - 285 + xsalt,
      canvas.width / 2 - 185 + xsalt,
      canvas.width / 2 - 85 + xsalt,
    ];
    yChoices = [-200, canvas.height + 200];
  } else if (result === "horizontal") {
    xChoices = [-370, canvas.width + 370];
    yChoices = [
      canvas.height / 2 - 100 + ysalt,
      canvas.height / 2 + 100 + ysalt,
      canvas.height / 2 + 200 + ysalt,
    ];
  }

  y = yChoices[Math.floor(Math.random() * yChoices.length)];
  x = xChoices[Math.floor(Math.random() * xChoices.length)];
  return [x, y];
}

function handleStartGameButtonClick() {
  const splashContainer = document.querySelector(".splash-container");
  const startGameButton = document.querySelector(".start-game-button");
  startGameButton.removeEventListener("click", handleStartGameButtonClick);
  splashContainer.remove();
  global.inPlay = true;
  global.theme.play();
  global.theme.loop = true;
  global.theme.volume = 0.03;
}

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
window.addEventListener("visibilitychange", handleVisibiltyChange);

function handleVisibiltyChange() {
  setAllKeysToFalse();
}

function handleKeyDown(e) {
  const inPlay = global.inPlay;
  if (inPlay) {
    let key = e.code;
    const exists = keys.hasOwnProperty(key);
    if (exists) keys[key] = true;
  }
}

function handleKeyUp(e) {
  let key = e.code;
  const exists = keys.hasOwnProperty(key);
  if (exists) keys[key] = false;
}

class Knight {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 231;
    this.height = 219;
    this.sx = 0;
    this.sy = 0;
    this.sWidth = 231;
    this.sHeight = 219;
    this.image = new Image();
    this.lastMovement = "idle";
    this.currentMovement = null;
    this.idleImage = new Image();
    this.idleImage.src = "./images/knight/idle.png";
    this.runImage = new Image();
    this.runImage.src = "./images/knight/run.png";
    this.direction = "right";
    this.attackImage = new Image();
    this.attackImage.src = "./images/knight/attack.png";
    this.spriteCount = 0;
    this.spriteSpeed = 1;
    this.spriteInterval = 4;
    this.moveSpeed = 5;
    this.canAttack = true;
    this.attacking = false;
    this.swordSound = new Audio("");
    this.level = 0;
    this.oldLevel = 0;
  }

  draw() {
    ctx.save();
    ctx.shadowColor = "black";
    ctx.shadowBlur = 5;
    this.spriteCount += this.spriteSpeed;
    this.changeDirection();
    this.drawIdle();
    this.drawRun();
    this.drawAttack();
    ctx.fillStyle = "steelblue";
    ctx.drawImage(
      this.image,
      this.sx,
      this.sy,
      this.sWidth,
      this.sHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
    ctx.restore();
  }

  drawIdle() {
    const isIdle = Object.values(keys).every((key) => key === false);
    const gameOver =
      document.querySelector(".castle-blood").style.width === "0%";

    // re-adjust player after attack
    if ((isIdle && !this.attacking) || gameOver) {
      this.currentMovement = "idle";
      this.image = this.idleImage;

      // cycle through sprite images
      if (this.spriteCount >= this.spriteInterval) {
        this.spriteCount = 0;
        this.sx += this.sWidth;
      }

      // restart sprite sheet
      if (this.sx === 1848) {
        this.sx = 0;
      }
    }
  }

  drawRun() {
    const inPlay = global.inPlay;
    const isRun = Object.values(keys)
      .slice(0, 4)
      .some((key) => key === true);

    if (isRun && !this.attacking && inPlay) {
      this.currentMovement = "run";
      this.image = this.runImage;

      // cycle through sprite images
      if (this.spriteCount >= this.spriteInterval) {
        this.spriteCount = 0;
        this.sx += this.sWidth;
      }

      // restart sprite sheet
      if (this.sx === 3927) {
        this.sx = 0;
      }
    }
  }

  drawAttack() {
    if (this.attacking) {
      this.image = this.attackImage;
      this.currentMovement = "attack";

      // cycle through sprite images
      if (this.spriteCount >= this.spriteInterval) {
        this.spriteCount = 0;
        this.sx += this.sWidth;
      }

      // play sword sound
      if (this.sx >= 2000 && this.swordSound.paused) {
        this.playSwordSound();
      }

      // restart sprite sheet
      if (this.sx === 2772) {
        this.sx = 0;
        this.attacking = false;
        this.canAttack = true;
      }
    }
  }

  playSwordSound() {
    const sources = [
      "./audio/sword-1.wav",
      "./audio/sword-2.wav",
      "./audio/sword-3.wav",
    ];

    this.swordSound.src = sources[Math.floor(Math.random() * sources.length)];
    this.swordSound.volume = 0.1;
    this.swordSound.play();
  }

  changeDirection() {
    const inPlay = global.inPlay;
    if (keys.ArrowLeft) {
      this.direction = "left";
    }
    if (keys.ArrowRight) {
      this.direction = "right";
    }

    if (this.direction === "left" && inPlay) {
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.scale(-1, 1);
      ctx.translate(-this.x - this.width / 2, -this.y - this.height / 2);
    }
  }

  generateDust() {
    const inPlay = global.inPlay;
    const noVisibleClouds =
      global.dust.filter((cloud) => cloud.visible).length < 1;
    const rightToLeft = keys.ArrowLeft && this.direction === "right";
    const leftToRight = keys.ArrowRight && this.direction === "left";
    let y = 0;
    let x = 0;
    let yAdjust = 0;

    if (keys.ArrowUp) {
      yAdjust = -40;
    }
    if (keys.ArrowDown) {
      yAdjust = 30;
    }

    if (rightToLeft) {
      x = this.x + 60;
      y = this.y + 150;
    }
    if (leftToRight) {
      x = this.x + 80;
      y = this.y + 150;
    }

    if (noVisibleClouds && rightToLeft && inPlay) {
      const dust = new Dust(x, y + yAdjust, "left");
      global.dust.push(dust);
    }

    if (noVisibleClouds && leftToRight && inPlay) {
      const dust = new Dust(x, y + yAdjust, "right");
      global.dust.push(dust);
    }

    // remove dust from array
    if (global.dust.length > 20) {
      global.dust = [];
    }
  }

  move() {
    const inPlay = global.inPlay;
    if (keys.ArrowUp && inPlay && !this.castleCollision && this.y > 0)
      this.y -= this.moveSpeed;
    if (
      keys.ArrowDown &&
      inPlay &&
      !this.castleCollision &&
      this.y < canvas.height - this.height
    )
      this.y += this.moveSpeed;
    if (
      keys.ArrowRight &&
      inPlay &&
      !this.castleCollision &&
      this.x < canvas.width - this.width
    )
      this.x += this.moveSpeed;
    if (keys.ArrowLeft && inPlay && !this.castleCollision && this.x > 0)
      this.x -= this.moveSpeed;
  }

  attack() {
    if (keys.Space && this.canAttack) {
      this.count = 0;
      this.sx = 0;
      this.canAttack = false;
      this.attacking = true;
    }
  }

  detectMovementChange() {
    if (this.currentMovement !== this.lastMovement) {
      this.lastMovement = this.currentMovement;
      this.count = 0;
      this.sx = 0;
      this.sy = 0;
    }
  }

  update() {
    this.detectMovementChange();
    this.generateDust();
    this.draw();
    this.move();
    this.attack();
  }
}

class Dragon {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 370;
    this.height = 200;
    this.sWidth = 370;
    this.sHeight = 200;
    this.image = new Image();
    this.exploded = false;
    this.image.src = "./images/black dragon/flying2.png";
    this.sx = 0;
    this.sy = 0;
    let speeds;
    // increment dragon speed depending upon enemies killed
    if (global.monstersKilled >= 500) {
      speeds = [3.25, 3.35, 3.5, 3.65, 3.75, 4];
    } else if (global.monstersKilled >= 300) {
      speeds = [2.25, 2.35, 2.5, 2.65, 2.75, 3];
    } else {
      speeds = [1.25, 1.35, 1.5, 1.65, 1.75, 2];
    }

    this.flySpeed = speeds[Math.floor(Math.random() * speeds.length)];
    this.moving = true;
    this.spriteCount = 0;
    this.spriteInterval = 5;
    this.direction = "left";
    this.startExplode = false;
    this.alive = true;
    this.damage = 10;
    const castleX = 400;
    if (this.x < castleX) this.direction = "right";
    this.hitSound = new Audio();
  }

  draw() {
    ctx.save();
    this.spriteCount++;
    this.changeDirection();
    this.drawFlying();
    this.createExplosion();
    ctx.shadowColor = "black";
    ctx.shadowBlur = 5;

    if (this.alive) {
      ctx.drawImage(
        this.image,
        this.sx,
        this.sy,
        this.sWidth,
        this.sHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }

    ctx.restore();
  }

  drawFlying() {
    // cycle through flying sprite sheet
    if (this.spriteCount >= this.spriteInterval) {
      this.spriteCount = 0;
      this.sx += this.sWidth;
    }

    // reset sprite sheet
    if (this.sx === 3700) this.sx = 0;
  }

  createExplosion() {
    if (this.startExplode) {
      this.alive = false;
      this.startExplode = false;
      const explosion = new Explosion();
      global.explosions.push(explosion);
    }
  }

  changeDirection() {
    if (this.direction === "right") {
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.scale(-1, 1);
      ctx.translate(-this.x - this.width / 2, -this.y - this.height / 2);
    }
  }

  move() {
    if (global.inPlay) {
      const x = this.x - castle.x + 70;
      const y = this.y - castle.y;
      const angle = Math.atan2(y, x);

      this.x -= Math.cos(angle) * this.flySpeed;
      this.y -= Math.sin(angle) * this.flySpeed;
    }
  }

  detectCastleHitBoxCollision() {
    const isCollide = (rect1, rect2) => {
      return !(
        rect1.x > rect2.x + rect2.width ||
        rect1.x + rect1.width < rect2.x ||
        rect1.y > rect2.y + rect2.height ||
        rect1.y + rect1.height < rect2.y
      );
    };
    if (isCollide(this, box) && this.alive) {
      this.exploded = true;
      this.startExplode = true;
      decrementCastleHealth(this.damage);
    }
  }

  detectPlayerAttack() {
    const rightFacingDragon =
      player.x + 50 > this.x &&
      player.x < this.x + this.width - 100 &&
      player.y + 50 > this.y &&
      player.y < this.y + this.height - 100 &&
      this.direction === "right" &&
      player.attacking &&
      player.sx >= 2310;

    const leftFacingDragon =
      player.x + 100 > this.x &&
      player.x < this.x + this.width - 50 &&
      player.y + 50 > this.y &&
      player.y < this.y + this.height - 100 &&
      this.direction === "left" &&
      player.attacking &&
      player.sx >= 2310;

    if (rightFacingDragon && this.alive) {
      this.alive = false;
      const phrase = new Phrase(this.x + this.width / 4, this.y + this.y / 4);
      global.phrases.push(phrase);
      incrementMonstersKilled();
      this.playHitSound();
      global.score += 75;
    }
    if (leftFacingDragon && this.alive) {
      this.alive = false;
      const phrase = new Phrase(this.x + this.width / 6, this.y);
      global.phrases.push(phrase);
      incrementMonstersKilled();
      this.playHitSound();
      global.score += 75;
    }
  }

  playHitSound() {
    const sources = [
      "./audio/hit-1.wav",
      "./audio/hit-2.wav",
      "./audio/hit-3.wav",
      "./audio/hit-4.wav",
      "./audio/hit-5.wav",
      "./audio/hit-6.wav",
    ];
    this.hitSound.src = sources[Math.floor(Math.random() * sources.length)];
    this.hitSound.volume = 0.2;
    this.hitSound.play();
  }

  update() {
    this.draw();
    this.move();
    this.detectCastleHitBoxCollision();
    this.detectPlayerAttack();
  }
}

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 72.6;
    this.height = 60;
    this.shoeImage = new Image();
    this.shoeImage.src = "./images/shoe.png";
    this.swordImage = new Image();
    this.swordImage.src = "./images/sword.png";
    this.hammerImage = new Image();
    this.hammerImage.src = "./images/hammer.png";
    this.canBegin = true;
    this.opacity = 1;
    this.decreaseOpacity = false;
    this.speedSound = new Audio("./audio/speed-powerup.wav");
  }

  draw() {
    ctx.save();
    ctx.shadowColor = "black";
    ctx.shadowBlur = 5;
    this.opacityEffect();
    if (this.type === "movement") {
      ctx.drawImage(this.shoeImage, this.x, this.y, this.width, this.height);
    }
    if (this.type === "attack") {
      ctx.drawImage(this.swordImage, this.x, this.y, this.width, this.height);
    }
    if (this.type === "rebuild") {
      ctx.drawImage(this.hammerImage, this.x, this.y, this.width, this.height);
    }
    ctx.restore();
  }

  playSound() {
    const audio = this.speedSound;
    audio.volume = 0.02;
    audio.play();
  }

  move() {
    this.y = player.y - 50;

    if (player.direction === "right" && this.type === "movement")
      this.x = player.x + 65;
    if (player.direction === "left" && this.type === "movement")
      this.x = player.x + 113;
    if (player.direction === "right" && this.type === "attack")
      this.x = player.x + 65;
    if (player.direction === "left" && this.type === "attack")
      this.x = player.x + 113;
    if (player.direction === "right" && this.type === "rebuild")
      this.x = player.x + 65;
    if (player.direction === "left" && this.type === "rebuild")
      this.x = player.x + 113;
  }

  beginOpacityEffect() {
    if (this.canBegin) {
      this.canBegin = false;
      this.playSound();

      setTimeout(() => {
        this.decreaseOpacity = true;
      }, 1000);
    }
  }

  opacityEffect() {
    if (this.decreaseOpacity) {
      if (this.opacity > 0) {
        this.opacity -= 0.02;
      }
      if (this.opacity < 0) {
        this.opacity = 0;
      }

      ctx.globalAlpha = this.opacity;
    }
  }

  update() {
    this.draw();
    this.move();
    this.beginOpacityEffect();
  }
}

class Castle {
  constructor() {
    this.width = 250;
    this.height = 250;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height / 2 - this.height / 2;
    this.image = new Image();
    this.image.src = "./images/castle.png";
  }

  draw() {
    ctx.save();
    ctx.shadowColor = "black";
    ctx.shadowBlur = 5;
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    ctx.restore();
  }

  update() {
    this.draw();
  }
}

class CastleHitBox {
  constructor() {
    this.height = 10;
    this.width = 10;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height / 2 - this.height / 2 + 30;
  }
}

class Explosion {
  constructor() {
    this.height = 150;
    this.width = 150;
    this.sWidth = 192;
    this.sHeight = 192;
    const salt = [-30, -20, -10, 10, 20, 30];
    this.x =
      canvas.width / 2 -
      this.width / 2 +
      salt[Math.floor(Math.random() * salt.length)];
    this.y =
      canvas.height / 2 -
      this.height / 2 +
      salt[Math.floor(Math.random() * salt.length)];
    this.sx = 0;
    this.sy = 0;
    this.image = new Image();
    this.image.src = "./images/explosion.png";
    this.spriteCount = 0;
    this.spriteInterval = 3;
    this.active = true;
    this.explosionSound = new Audio();
  }

  draw() {
    if (this.active) this.spriteCount++;

    // cycle through sprite sheet images
    if (this.spriteCount >= this.spriteInterval) {
      this.spriteCount = 0;
      this.sx += this.sWidth;
    }

    // play explosion sound
    if (this.sx === 960 - this.sWidth && this.sy === 0) {
      this.playExplosionSound();
    }

    // move to second row of sprite sheet
    if (this.sx === 960 && this.sy === 0) {
      this.sx = 0;
      this.sy = 192;
    }

    // move to third row of sprite sheet
    if (this.sx === 960 && this.sy === 192) {
      this.sx = 0;
      this.sy = 384;
    }

    // move to fourth row of sprite sheet
    if (this.sx === 960 && this.sy === 384) {
      this.sx = 0;
      this.sy = 576;
    }

    // stop cycling through sprite sheet
    if (this.sx === 960 && this.sy === 576) {
      this.active = false;
    }

    ctx.drawImage(
      this.image,
      this.sx,
      this.sy,
      this.sWidth,
      this.sHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  playExplosionSound() {
    if (this.explosionSound.paused && this.active) {
      this.explosionSound.src = "./audio/explode.wav";
      this.explosionSound.volume = 0.03;
      this.explosionSound.play();
    }
  }

  update() {
    this.draw();
  }
}

class Phrase {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 200;
    this.height = 200;
    this.sWidth = 410;
    this.sHeight = 410;
    this.image = new Image();
    this.image.src = "./images/phrases.png";
    this.sx = 0;
    this.sy = 0;
    this.opacity = 1;
    this.count = 0;
    this.interval = 4;
    this.startDecreaseOpacity = true;
    this.decreasingOpacity = false;
    this.rotation = 1;
    this.rotationVelocity = 2;

    const imageNum = Math.floor(Math.random() * 9) + 1;

    if (imageNum === 1) {
      this.sx = 0;
      this.sy = 0;
    }
    if (imageNum === 2) {
      this.sx += 410;
      this.sy = 0;
    }
    if (imageNum === 3) {
      this.sx = 820;
      this.sy = 0;
    }
    if (imageNum === 4) {
      this.sx = 0;
      this.sy = 410;
    }
    if (imageNum === 5) {
      this.sx = 410;
      this.sy = 410;
    }
    if (imageNum === 6) {
      this.sx = 820;
      this.sy = 410;
      this.y -= 50;
    }
    if (imageNum === 7) {
      this.sx = 0;
      this.sy = 820;
    }
    if (imageNum === 8) {
      this.sx = 410;
      this.sy = 820;
    }
  }

  draw() {
    ctx.save();
    this.opacityEffect();
    this.rotateEffect();

    if (this.startDecreaseOpacity) {
      this.startDecreaseOpacity = false;
      setTimeout(() => {
        this.decreasingOpacity = true;
      }, 1000);
    }

    if (this.opacity >= 0) {
      ctx.drawImage(
        this.image,
        this.sx,
        this.sy,
        this.sWidth,
        this.sHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }

    ctx.restore();
  }

  opacityEffect() {
    if (this.decreasingOpacity) {
      if (this.opacity > 0) this.opacity -= 0.05;
      ctx.globalAlpha = this.opacity;
    }
  }

  rotateEffect() {
    const angle = (Math.PI / 180) * this.rotation;
    this.rotation += this.rotationVelocity;
    if (this.rotation >= 20) this.rotationVelocity *= -1;
    if (this.rotation <= -20) this.rotationVelocity *= -1;
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(angle);
    ctx.translate(-this.x - this.width / 2, -this.y - this.height / 2);
  }

  update() {
    this.draw();
  }
}

class Dust {
  constructor(x, y, direction) {
    this.direction = direction;
    this.x = x;
    this.y = y;
    this.width = 70;
    this.height = 70;
    this.sWidth = 200;
    this.sHeight = 200;
    this.sx = 0;
    this.sy = 0;
    this.image = new Image();
    this.image.src = "./images/dust.png";
    this.spriteCount = 0;
    this.spriteInterval = 4;
    this.visible = true;
  }

  draw() {
    ctx.save();
    this.spriteCount++;
    ctx.globalAlpha = 0.8;

    // cycle through sprite images
    if (this.spriteCount >= this.spriteInterval) {
      this.spriteCount = 0;
      this.sx += this.sWidth;
    }

    // move to second row of sprite sheet
    if (this.sx === 600 && this.sy === 0) {
      this.sx = 0;
      this.sy = 200;
    }

    // dust is technically still visible for one more image, but this allows another cloud to be made
    if (this.sx === 400 && this.sy === 200) {
      this.visible = false;
    }

    if (this.sx === 600 && this.sy === 200) {
      this.spriteCount = 0;
    }

    this.changeDirection();

    ctx.drawImage(
      this.image,
      this.sx,
      this.sy,
      this.sWidth,
      this.sHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
    ctx.restore();
  }

  changeDirection() {
    if (this.direction === "left") {
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.scale(-1, 1);
      ctx.translate(-this.x - this.width / 2, -this.y - this.height / 2);
    }
  }

  update() {
    this.draw();
  }
}

class Background {
  constructor() {
    this.width = canvas.width;
    this.height = canvas.height;
    this.x = 0;
    this.y = 0;
    this.image = new Image();
    this.image.src = "./images/background.png";
  }

  draw() {
    ctx.drawImage(this.image, this.x, this.y);
  }

  update() {
    this.draw();
  }
}

function incrementScore() {
  if (global.inPlay) {
    global.score++;
    updateScore();
  }
}

function incrementMonstersKilled() {
  const dead = global.enemies.filter(
    (enemy) => !enemy.alive && !enemy.exploded
  ).length;
  global.monstersKilled = dead;
  updateMonstersKilled();
}

function updateScore() {
  const scoreContainer = document.querySelector(".score-container");
  scoreContainer.innerText = `Score: ${global.score}`;
}

function updateMonstersKilled() {
  const monstersKilledContainer = document.querySelector(
    ".monsters-killed-container"
  );
  monstersKilledContainer.innerText = `Killed: ${global.monstersKilled}`;
}

function playGameOverSounds() {
  const sound1 = global.lose;
  sound1.volume = 0.2;
  if (sound1.paused) sound1.play();
  const sound2 = global.gasp;
  sound2.volume = 0.2;
  if (sound2.paused) sound2.play();
}

function decrementCastleHealth(amt) {
  if (global.castleHealth - amt <= 0) {
    setTimeout(() => {
      playGameOverSounds();
      gameOver();
    }, 500);

    const castleBlood = document.querySelector(".castle-blood");
    castleBlood.style.width = "0%";
  } else {
    global.castleHealth -= amt;
    updateCastleHealth();
  }
}

function gameOver() {
  global.inPlay = false;
  global.theme.pause();
  createGameOverMenu();
  setAllKeysToFalse();
  player.attacking = false;
}

function setAllKeysToFalse() {
  for (let prop in keys) {
    keys[prop] = false;
  }
}

function createGameOverMenuContainer() {
  const gameOverMenuContainer = document.createElement("div");
  gameOverMenuContainer.classList.add("game-over-menu-container");
  const canvasContainer = document.querySelector(".canvas-container");
  canvasContainer.appendChild(gameOverMenuContainer);
}

function createGameOverTitle() {
  const gameOverMenuContainer = document.querySelector(
    ".game-over-menu-container"
  );
  const gameOverTitle = document.createElement("span");
  gameOverTitle.classList.add("game-over-title");
  gameOverMenuContainer.appendChild(gameOverTitle);
  gameOverTitle.innerText = "Game Over";
}

function createGameOverContentContainer() {
  const gameOverMenuContainer = document.querySelector(
    ".game-over-menu-container"
  );
  const gameOverContentContainer = document.createElement("div");
  gameOverContentContainer.classList.add("game-over-content-container");
  gameOverMenuContainer.appendChild(gameOverContentContainer);
}

function createGameOverScore() {
  const gameOverContentContainer = document.querySelector(
    ".game-over-content-container"
  );
  const gameOverScore = document.createElement("span");
  gameOverScore.classList.add("game-over-score");
  gameOverScore.innerText = `Score: ${global.score}`;
  gameOverContentContainer.appendChild(gameOverScore);
}

function createReplayButton() {
  const gameOverContentContainer = document.querySelector(
    ".game-over-content-container"
  );
  const replayButton = document.createElement("button");
  replayButton.classList.add("replay-button");
  replayButton.innerText = "Replay";
  gameOverContentContainer.appendChild(replayButton);

  replayButton.addEventListener("click", handleReplayButtonClick);
}

function handleReplayButtonClick() {
  const replayButton = document.querySelector(".replay-button");
  replayButton.removeEventListener("click", handleReplayButtonClick);
  restartGame();
}

function restartGame() {
  removeGameOverMenuContainer();
  resetGlobal();
  resetCastleHealth();
  resetKilled();
  resetKnight();
  resetTheme();
}

function resetKilled() {
  const monstersKilledContainer = document.querySelector(
    ".monsters-killed-container"
  );
  monstersKilledContainer.innerText = `Killed: 0`;
}

function resetTheme() {
  global.theme.currentTime = 0;
  global.theme.play();
  global.theme.loop = true;
}

function resetKnight() {
  player.x = 100;
  player.y = 100;
  player.sx = 0;
  player.sy = 0;
  player.lastMovement = "idle";
  player.currentMovement = null;
  player.direction = "right";
  player.spriteCount = 0;
  player.spriteInterval = 4;
  player.spriteSpeed = 1;
  player.moveSpeed = 5;
  player.canAttack = true;
  player.attacking = false;
  player.level = 0;
  player.oldLevel = 0;
}

function resetCastleHealth() {
  const health = document.querySelector(".castle-blood");
  health.style.width = "100%";
  health.style.transition = "none";

  // reset transition on castle blood
  setTimeout(() => {
    health.style.transition = "all ease-in 300ms";
  }, 0);
}

function resetGlobal() {
  global.inPlay = true;
  global.score = 0;
  global.gameSpeed = 1;
  global.monstersKilled = 0;
  global.castleHealth = 100;
  global.explosions = [];
  global.enemies = [];
  global.phrases = [];
  global.dust = [];
  global.powerUps = [];
  global.dragonSpawnCounter = 0;
  global.dragonSpawnAmt = 1;
  global.dragonSpawnAmtCounter = 0;
  global.currentPowerUp = null;
}

function removeGameOverMenuContainer() {
  const menu = document.querySelector(".game-over-menu-container");
  menu.remove();
}

function createGameOverMenu() {
  const exists = document.querySelector(".game-over-menu-container");
  const inPlay = global.inPlay;
  if (!exists && !inPlay) {
    createGameOverMenuContainer();
    createGameOverTitle();
    createGameOverContentContainer();
    createGameOverScore();
    createReplayButton();
  }
}

function updateCastleHealth() {
  const castleBlood = document.querySelector(".castle-blood");
  castleBlood.style.width = global.castleHealth + "%";
}

const background = new Background();
const player = new Knight(100, 100);
const castle = new Castle();
const box = new CastleHitBox();

function animate() {
  incrementScore();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  background.update();

  castle.update();
  global.explosions.forEach((explosion) => explosion.update());
  global.phrases.forEach((phrase) => phrase.update());
  global.dust.forEach((cloud) => cloud.update());
  global.enemies.forEach((enemy) => enemy.update());
  player.update();
  global.powerUps.forEach((powerUp) => powerUp.update());
  window.requestAnimationFrame(animate);
  initDragons();
  levelUp();
}

window.onload = () => {
  animate();
};
