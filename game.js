Array.prototype.random = function() {
	return this[Math.floor(Math.random() * this.length)];
}

Array.prototype.randomIndex = function() {
	return Math.floor(Math.random() * this.length);
}

// canvas area
const canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 600;
  
const game = {
  size: 50,
  spacing: 2,
  // innerSize is calculated every time page load
  innerSize: 0, 

  speed: 2,
  start: 0,

  playing: false,
  gameOver: false,

  blocks: [],
  patterns: 
	  [
	  // rotatable
	  	[
	  		[
		  		[0, 0, 0],
		  		[1, 1, 1],
		  		[0, 0, 0]
	  		],
	  		[
		  		[0, 1, 0],
		  		[0, 1, 0],
		  		[0, 1, 0]
	  		],
	  	],
	  	[
	  		[
		  		[1, 0, 0],
		  		[1, 1, 1],
		  		[0, 0, 0]
	  		],
	  		[
		  		[0, 1, 1],
		  		[0, 1, 0],
		  		[0, 1, 0]
	  		],
	  		[
		  		[0, 0, 0],
		  		[1, 1, 1],
		  		[0, 0, 1]
	  		],
	  		[
		  		[0, 1, 0],
		  		[0, 1, 0],
		  		[1, 1, 0]
	  		],
	  	],
	  	[
	  		[
		  		[0, 1, 0],
		  		[1, 1, 1],
		  		[0, 0, 0]
	  		],
	  		[
		  		[0, 1, 0],
		  		[0, 1, 1],
		  		[0, 1, 0]
	  		],
	  		[
		  		[0, 0, 0],
		  		[1, 1, 1],
		  		[0, 1, 0]
	  		],
	  		[
		  		[0, 1, 0],
		  		[1, 1, 0],
		  		[0, 1, 0]
	  		],
	  	],
	  ],

  ground: {}

}
// simple calculation for innerSize
	game.innerSize = game.size - game.spacing*2












game.ground = {
	_parts: [],

	get parts() {
		return this._parts;
	},

	empty() {
		this._parts = [];
	},

	render() {
		this._draw();
	},

	_draw() {
		this._parts.forEach((p) => {
			c.beginPath();
			c.fillStyle = '#ffffff';
			c.fillRect(p.x + game.spacing, p.y + game.spacing, game.innerSize, game.innerSize);
		});
	},

	addPart(parts) {
		parts.forEach((p) => this._parts.push({x: p.x, y: p.y}));
	},
};












class Block {

// constructor function
	constructor() {
		this._speed = game.speed;
		this._start = 0;
		this._active = true;
		
		this._patterns = game.patterns.random();
		this._rotaion = this._patterns.randomIndex();

		this._x = 0;
		this._y = game.size * -3;

		this._parts = [];
		this._width = 0;
		this._height = 0;
		this._initCalculation();
	}



// getters and setters
	get speed() {
		return this._speed;
	}

	get start() {
		return this._start;
	}

	setStart(value) {
		this._start = value;
	}



// calculation functions

	_updateParts() {
		const width = [0, 0, 0];
		const height = [0, 0, 0];
		const parts = [];
		this._patterns[this._rotaion].forEach((r, ri) => {
			r.forEach((cell, ci) => {
				if (cell) {
					width[ri] += +cell;
					height[ci] += +cell;
					parts.push({
						x: (game.size*ci) + this._x,
						y: (game.size*ri) + this._y
					});
				}
			});
		});
		this._width = Math.max(...width);
		this.height = Math.max(...height);
		this._parts = parts;
	}

	_initCalculation() {
		this._updateParts();
		this._go('right', Math.floor(Math.random() * ((canvas.width / game.size) - this._width)));
	}



// rendering functinos
	render() {
		this._draw();
	}

	_draw() {
		this._parts.forEach((p) => {
			c.beginPath();
			c.fillStyle = '#ff0000';
			c.fillRect(p.x + game.spacing, p.y + game.spacing, game.innerSize, game.innerSize);					
		});
	}



// movement functions

	move() {
		this._hitGround();
		this._falling();
	}

	_falling() {
		if (this._active) {
			this._parts.forEach((p) => p.y += game.size);
			this._y += game.size;
		}
	}

	_hitGround() {
		if (this._active) {
			for (let p of this._parts) {
				if (p.y + game.size === canvas.height) {
					this._transformBlock();
					return true;
				}
				game.ground.parts.forEach((g) => (p.x === g.x && p.y + game.size === g.y) ? this._transformBlock() : 0);
			}
		}
	}

	_transformBlock() {
		this._active = false;
		game.ground.addPart(this._parts);
		game.blocks.splice(game.blocks.indexOf(this), 1);
		game.blocks.push(new Block());
	}

	// direction 'left' or 'right'
	_go(direction = 'right', step = 1) {
		if (!!~['left', 'right'].indexOf(direction)) {
			for (let p of this._parts) {
				if (direction === 'left' && p.x <= 0 || 
					direction === 'right' && p.x >= canvas.width - game.size) {
					return false;
				} else {
					for (let g of game.ground.parts) {
						if (p.y === g.y) {
							if ((direction === 'right' && p.x + game.size === g.x) || 
								(direction === 'left' && p.x - game.size === g.x)) { 
								return false;		
							}
						}
					}
				}
			}
			step = game.size * step * ([-1,1][+(direction === 'right')]);
			this._parts.forEach((p) => p.x += step);
			this._x += step;
		}
	}




// Block methods

	moveLeft() {
		this._go('left');
	}

	moveRight() {
		this._go('right');
	}

	fastFalling() {
		this._speed = game.speed * 5;
	}

	normalFalling() {
		this._speed = game.speed;
	}

	rotate() {
		const previousRotation = this._rotaion;
		this._rotaion = (this._patterns[this._rotaion+1]) ? this._rotaion+1 : 0;
		this._updateParts();
		parts: for (let p of this._parts) {
			for (let g of game.ground.parts) {
				if (p.x === g.x && p.y === g.y || p.x < 0 || p.x >= canvas.width) {
					this._rotaion = previousRotation;
					this._updateParts();
					break parts;
				}
			}
		}
	}




}















function drawScore() {
  c.beginPath();
  c.font = '16px tahoma';
  c.textBaseline = 'middle';
  c.textAlign = 'left';
  for (let player in game.snakes) {
    c.fillStyle = game.snakeColors[player-1];
    c.fillText(`score: ${game.snakes[player].score}`, 20, player*20);    
  }
}




// let start = 0;
function draw(timestamp) {
  c.clearRect(0, 0, canvas.width, canvas.height);


  // render falling blocks
  game.blocks.forEach((b) => {
	if (timestamp - b.start > 1000 / b.speed && game.playing) {
		b.setStart(timestamp);
		b.move();
	}
  	b.render();
  });

  // render ground
  game.ground.render();

  requestAnimationFrame(draw);
}
draw();





document.body.addEventListener('keydown', function(e) {
	switch(e.keyCode) {
		case 40:
			game.blocks.forEach((b) => b.fastFalling());
			break;
	}
});
document.body.addEventListener('keyup', function(e) {
	switch(e.keyCode) {
		case 37:
			game.blocks.forEach((b) => b.moveLeft());
			break;
		case 39:
			game.blocks.forEach((b) => b.moveRight());
			break;
		case 38:
			game.blocks.forEach((b) => b.rotate());
			break;
		case 40:
			game.blocks.forEach((b) => b.normalFalling());
			break;
		case 8:
			game.blocks = [];
			break;
		case 27:
			game.ground.empty();
			break;
	}
	// start game 
	if (!game.playing) {
		game.playing = true;	
		game.blocks.push(new Block);
		document.querySelector('#instruction').remove();
	} 

});
