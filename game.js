Array.prototype.random = function() {
	return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.randomIndex = function() {
	return Math.floor(Math.random() * this.length);
};

Number.prototype.rowToY = function(height, size) {
	return Math.abs(this - (height / size) + 1) * size;
};

Number.prototype.YToRow = function(height, size) {
	return Math.abs(this - height + size) / size;
};

// canvas area
const canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 600;
  
const game = {
  size: 25,
  spacing: 1,
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
		  		[0, 0, 0],
		  		[1, 1, 1],
		  		[1, 0, 0]
	  		],
	  		[
		  		[1, 1, 0],
		  		[0, 1, 0],
		  		[0, 1, 0]
	  		],
	  		[
		  		[0, 0, 1],
		  		[1, 1, 1],
		  		[0, 0, 0]
	  		],
	  		[
		  		[0, 1, 0],
		  		[0, 1, 0],
		  		[0, 1, 1]
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

  ground: {},

  score: 0,
  scoreContainer: document.querySelector('#score')
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
		this._parts.forEach((row, rowIndex) => {
			c.fillStyle = '#ffffff';
			row.forEach((x) => {
				c.beginPath();
				c.fillRect(x + game.spacing, rowIndex.rowToY(canvas.height, game.size) + game.spacing, game.innerSize, game.innerSize);
			});
		});
	},

	addPart(parts) {
		parts.forEach((p) => {
			const row = p.y.YToRow(canvas.height, game.size);
			if (!this._parts[row]) this._parts[row] = [];
			// if (!~this._parts[row].indexOf(p.x)) 
				this._parts[row].push(p.x);
		});
		this._deleteFullRows();
	},

	_deleteFullRows() {
		const fullRows = [];
		this._parts.forEach((row, rowIndex) => {
			if (row.length === canvas.width / game.size) {
				fullRows.push(rowIndex);
			}
		});
		this._moveTopRows(fullRows);
	},

	_moveTopRows(fullRows) {
		fullRows.forEach((row, rowIndex) => {
			for (let i = row - rowIndex; i < this._parts.length; i++) {
				this._parts[i] = (this._parts[i+1]) ? this._parts[i+1] : [];
			}
			// score increment
			this._addScore(rowIndex+1);
		});
		this._isGameover();
	},

	_addScore(increment) {
		game.score += increment;
		game.scoreContainer.textContent = `score: ${game.score}`;
	},

	_isGameover() {
		if (this._parts[(0).YToRow(canvas.height, game.size)]) {
			game.gameOver = true;
			game.playing = false;
			game.blocks = [];
		}
	}
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
		if (this._hitGround()) return false;
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
				const groundRow = game.ground.parts[p.y.YToRow(canvas.height, game.size) - 1];
				if (groundRow) {
					for (let gx of groundRow) {
						if (p.x === gx) {
							this._transformBlock();
							return true;
						}
					}
				}
			}
		}
		return false;
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
					const groundRow = game.ground.parts[p.y.YToRow(canvas.height, game.size)];
					if (groundRow) {
						for (let gx of groundRow) {
							if ((direction === 'right' && p.x + game.size === gx) || 
								(direction === 'left' && p.x - game.size === gx)) { 
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
		this._speed = game.speed * 10;
	}

	normalFalling() {
		this._speed = game.speed;
	}

	rotate() {
		const previousRotation = this._rotaion;
		this._rotaion = (this._patterns[this._rotaion+1]) ? this._rotaion+1 : 0;
		this._updateParts();
		parts: for (let p of this._parts) {
			if (p.x < 0 || p.x >= canvas.width) {
				this._rotaion = previousRotation;
				this._updateParts();
				break parts;
			}  
			const groundRow = game.ground.parts[p.y.YToRow(canvas.height, game.size)];
			if (groundRow) {
				for (let gx of groundRow) {
					if (p.x === gx) {
						this._rotaion = previousRotation;
						this._updateParts();
						break parts;
					}
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



function drawGameOverText() {
  c.beginPath();
  c.textBaseline = 'middle';
  c.textAlign = 'center';
  c.fillStyle = '#eee'
  c.strokeStyle = '#900';
  c.lineWidth = 16;
  c.font = 'bold 48px tahoma';
  c.strokeText('Game Over', canvas.width/2, canvas.height/2);
  c.fillText('Game Over', canvas.width/2, canvas.height/2);
}




// let start = 0;
function draw(timestamp) {
  c.clearRect(0, 0, canvas.width, canvas.height);


  if (game.playing) {
	  // render falling blocks
	  game.blocks.forEach((b) => {
		if (timestamp - b.start > 1000 / b.speed && game.playing) {
			b.setStart(timestamp);
			b.move();
		}
	  	b.render();
	  });
  }

  // render ground
  game.ground.render();

  if (game.gameOver) {
  	drawGameOverText();
  }

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
	if (!game.playing && !game.gameOver) {
		game.playing = true;	
		game.blocks.push(new Block);
		document.querySelector('#instruction').remove();
	} 

});
