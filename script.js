// inmediately invoked function to start the game
;(function() {
  var Game = function(canvasId) {
    // the canvas id is screen, and in this section, the anvas ID is being passed to the document element.
    var canvas = document.getElementById(canvasId);
    var screen = canvas.getContext('2d');
    var gameSize = { x: canvas.width, y: canvas.height };


    this.bodies = createInvaders(this).concat(new Player(this, gameSize));

    var self = this;
    loadSound('laser.mp3', function (shootSound){
      self.shootSound = shootSound;

// tick is responsible for running the game logic. I am not sure as to how she determined the tick function, because it is expected to run 60 times per second. Is 60 a standard?

    var tick = function() {
      self.update();
      self.draw(screen, gameSize);
      requestAnimationFrame(tick);
      // requestAnimationFrame is the request to the browser to run the game. is this pre-defined?
    };
      tick();
    });
  };
// this first section involves the variables defined for the game and the information for the html canvas as well.

  Game.prototype = {
    update: function() {
      var bodies = this.bodies;
      var notCollidingWithAnything = function (b1) {
        return bodies.filter(function(b2) { return colliding(b1, b2);}).length === 0
      }

      this.bodies = this.bodies.filter (notCollidingWithAnything)

      for (var i = 0; i < this.bodies.length; i++) {
        this.bodies[i].update();
      }
    },
      draw: function(screen, gameSize) {
        screen.clearRect(0, 0, gameSize.x, gameSize.y);
        for (var i = 0; i < this.bodies.length; i++) {
          drawRect(screen, this.bodies[i]);
        }
    },
      addBody: function(body) {
        this.bodies.push(body)
    },

    invadersBelow: function (invader) {
      return this.bodies.filter(function(b){
        return b instanceof Invader &&
        b.center.y > invader.center.y &&
        b.center.x - invader.center.x < invader.size.x;
      }).length > 0;
    }

  };

  var Player = function (game, gameSize) {
    this.game = game;
    this.size = { x: 15, y: 15 };
    this.center = {x: gameSize.x / 2, y: gameSize.y - this.size.x};
    this.keyboarder = new Keyboarder();

// this section determines the player information. the enter determines the location of the player body, size, game and the keyboard, which is defined later on the code for the inputs
  };

// prototype for the player. including the data for the bullets and the keyboard.
  Player.prototype = {
    update: function(){
      if(this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)){
        this.center.x -= 2;
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)){
        this.center.x += 2;
      }
      if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
        var bullet = new Bullet({ x: this.center.x, y: this.center.y - this.size.x * 2 }, { x: 0, y: -6});
        this.game.addBody(bullet);
        this.game.shootSound.load();
        this.game.shootSound.play();
      }
    }
  };
//invaders size, body, and prototype.
  var Invader = function(game, center) {
    this.game = game;
    this.size = { x: 15, y: 15 };
    this.center = center;
    this.patrolX = 0;
    this.speedX = 0.3;
  };
  Invader.prototype = {
    update: function (){
      if (this.patrolX < 0 || this.patrolX > 40){
        this.speedX = -this.speedX;
      }
      this.center.x += this.speedX;
      this.patrolX += this.speedX;
//this if section determins the bullets that the invaders are shooting. Prevents the invaders on top from shooting and destroying the invaders on top. Also, the random Math function slows down the shooting of the invaders.
      if (Math.random() > 0.995 && ! this.game.invadersBelow(this)) {
        var bullet = new Bullet({ x: this.center.x, y: this.center.y + this.size.x * 2 }, { x: Math.random() -0.5, y: 2});
        this.game.addBody(bullet);
      }

    }
  };
  //function in charge of creating theinvaders, given the variables, size, and number of invaders needed.
  var createInvaders = function(game) {
    var invaders = [];
    for (var i = 0; i < 24; i++) {
      var x = 30 + (i % 8) * 30;
      var y = 30 + (i % 3) * 30;
      invaders.push(new Invader (game, { x: x, y: y}));
    }
    return invaders;
  }



  var drawRect = function(screen, body) {
    screen.fillRect(body.center.x - body.size.x / 2,
                    body.center.y - body.size.y / 2,
                    body.size.x, body.size.y);
  }
//determines the bullets and the size of these.
  var Bullet = function(center, velocity) {
      this.size = { x: 3, y: 3};
      this.center= center;
      this.velocity = velocity;
    };
//this bullet prototype determines the speed of the bullets
      Bullet.prototype = {
        update: function() {
          this.center.x += this.velocity.x;
          this.center.y += this.velocity.y;
      }
    };
//this part is confusing to me.
    var drawRect = function (screen, body) {
      screen.fillRect(body.center.x - body.size.x / 2,
                      body.center.y - body.size.y / 2,
                      body.size.x, body.size.y)
    };

// the entire keyboarder section takes care of the inputs. Spacebar, left and right determining the moves and shooting. On key up and on key down needs to be determined to recognize when the key is let go.


  var Keyboarder = function() {
    var keyState = {};
    window.onkeydown = function(e) {
      keyState[e.keyCode] = true;
    };
    window.onkeyup = function(e) {
      keyState[e.keyCode] = false;
    };
    this.isDown = function(keyCode) {
      return keyState[keyCode] === true;
    };
    this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32};
};

//this section is interesting, and very confusing as itis the section that determines the bullet impact. When one of the bodies touches another, so when a bullet touches an invader or vice-versa, the invader AND the bullet will disappear. the entire function doesnt make sense to me.
  var colliding = function(b1, b2) {
    return !(b1 === b2 ||
    b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x /2 ||
    b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y /2 ||
    b1.center.x - b1.size.x / 2 > b2.center.x - b2.size.x /2 ||
    b1.center.y - b1.size.y / 2 > b2.center.y - b2.size.y /2 );
  };
//this section adds a sound everytime the player shoots.
// the file is downloaded, and is referenced under game
var loadSound = function (url, callback){
  var loaded = function () {
    callback(sound);
    sound.removeEventListener('canplaythrough', loaded);
  };

  var sound = new Audio(url);
  sound.addEventListener('canplaythrough', loaded);
  sound.load();
};
//this section loads the game
  window.onload = function() {
    new Game("screen");
  };
})();
