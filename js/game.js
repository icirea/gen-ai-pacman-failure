class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.gameOver = false;
        this.debug = true; // Enable debug visualization

        // Set canvas size based on map
        this.canvas.width = MAP_LAYOUT[0].length * CELL_SIZE;
        this.canvas.height = MAP_LAYOUT.length * CELL_SIZE;
        console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);

        // Initialize game objects
        this.map = new GameMap();
        
        // Validate map initialization
        if (!this.map.walls || this.map.walls.length === 0) {
            console.error('Map walls not initialized properly!');
        } else {
            console.log('Map initialized with', this.map.walls.length, 'walls');
            console.log('Sample wall:', this.map.walls[0]);
        }

        // Initialize Pac-Man at starting position
        const startX = 14 * CELL_SIZE;
        const startY = 23 * CELL_SIZE;
        this.pacman = new Pacman(startX, startY);
        
        // Initialize ghosts
        this.ghosts = [
            new Ghost(11 * CELL_SIZE, 14 * CELL_SIZE, GHOST_COLORS[0], 'chase'),
            new Ghost(13 * CELL_SIZE, 14 * CELL_SIZE, GHOST_COLORS[1], 'scatter'),
            new Ghost(15 * CELL_SIZE, 14 * CELL_SIZE, GHOST_COLORS[2], 'random'),
            new Ghost(17 * CELL_SIZE, 14 * CELL_SIZE, GHOST_COLORS[3], 'patrol')
        ];

        // Initialize animation frame ID
        this.animationFrameId = null;

        // Set up input handling
        this.setupControls();
        
        // Start game loop
        this.lastTime = 0;
        this.accumulator = 0;
        this.timestep = 1000 / 60; // 60 FPS

        this.frameCount = 0;
    }

    setupControls() {
        document.addEventListener('keydown', (event) => {
            console.log('Key pressed:', event.key);
            if (this.gameOver) return;

            let newDirection = null;
            switch (event.key) {
                case 'ArrowLeft':
                    newDirection = { x: -1, y: 0 };
                    break;
                case 'ArrowRight':
                    newDirection = { x: 1, y: 0 };
                    break;
                case 'ArrowUp':
                    newDirection = { x: 0, y: -1 };
                    break;
                case 'ArrowDown':
                    newDirection = { x: 0, y: 1 };
                    break;
            }

            if (newDirection) {
                console.log('Setting direction for Pacman:', newDirection);
                this.pacman.setNextDirection(newDirection);
                event.preventDefault();
            }
        });

        // Ensure canvas keeps focus when clicked
        this.canvas.addEventListener('click', () => {
            this.canvas.focus();
        });
    }

    update() {
        if (this.gameOver) return;

        this.frameCount++;
        if (this.frameCount % 60 === 0) { // Log every 60 frames
            console.log('Update state:', {
                pacmanPos: {x: this.pacman.x, y: this.pacman.y},
                direction: this.pacman.direction,
                nextDirection: this.pacman.nextDirection,
                wallCount: this.map.walls.length
            });
        }

        // Update Pac-Man with validated walls array
        if (this.map.walls && this.map.walls.length > 0) {
            this.pacman.update(this.map.walls, this.canvas.width);
        } else {
            console.error('No walls available for collision detection!');
        }

        // Update ghosts with canvas width
        this.ghosts.forEach(ghost => {
            ghost.update(this.pacman, this.map.walls, this.canvas.width);
            
            // Check for collision with Pac-Man
            const distance = Math.hypot(ghost.x - this.pacman.x, ghost.y - this.pacman.y);
            if (distance < CELL_SIZE) {
                if (ghost.scared) {
                    ghost.x = 14 * CELL_SIZE;
                    ghost.y = 14 * CELL_SIZE;
                    this.score += 200;
                } else {
                    this.gameOver = true;
                }
            }
        });

        // Check win condition
        if (this.map.getRemainingDots() === 0) {
            this.gameOver = true;
        }

        // Update score display
        document.getElementById('score').textContent = this.score;
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw map
        this.map.draw(this.ctx);

        // Draw Pac-Man
        this.pacman.draw(this.ctx);

        // Draw ghosts
        this.ghosts.forEach(ghost => ghost.draw(this.ctx));

        // Draw debug info if enabled
        if (this.debug) {
            this.drawDebugInfo();
        }

        // Draw game over message if needed
        if (this.gameOver) {
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            const message = this.map.getRemainingDots() === 0 ? 'YOU WIN!' : 'GAME OVER';
            this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    drawDebugInfo() {
        // Draw grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        for (let x = 0; x < this.canvas.width; x += CELL_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += CELL_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        // Draw Pac-Man info
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(
            `Pos: (${Math.round(this.pacman.x)}, ${Math.round(this.pacman.y)})`,
            10, 20
        );
        this.ctx.fillText(
            `Dir: (${this.pacman.direction.x}, ${this.pacman.direction.y})`,
            10, 40
        );
    }

    gameLoop() {
        this.update();
        this.draw();
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }

    start() {
        console.log('Starting game loop');
        if (this.animationFrameId === null) {
            console.log('Initial pacman position:', this.pacman.x, this.pacman.y);
            console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
            console.log('Number of walls:', this.map.walls.length);
            this.gameLoop();
        }
    }

    // Add method to stop the game loop if needed
    stop() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}

// Start the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Starting game initialization');
    const game = new Game();
    console.log('Game instance created');
    console.log('Canvas dimensions:', game.canvas.width, 'x', game.canvas.height);
    game.start();
    console.log('Game started');
});