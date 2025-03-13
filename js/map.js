class GameMap {
    constructor() {
        this.walls = [];
        this.dots = [];
        this.powerDots = [];
        this.parseMap();
    }

    parseMap() {
        console.log('Starting map parsing');
        let wallCount = 0;
        for (let y = 0; y < MAP_LAYOUT.length; y++) {
            for (let x = 0; x < MAP_LAYOUT[y].length; x++) {
                const cell = MAP_LAYOUT[y][x];
                if (cell === '#') {
                    const wall = {
                        x: x * CELL_SIZE,
                        y: y * CELL_SIZE,
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        id: wallCount++
                    };
                    this.walls.push(wall);
                } else if (cell === '.') {
                    this.dots.push({
                        x: x * CELL_SIZE + CELL_SIZE/2,
                        y: y * CELL_SIZE + CELL_SIZE/2,
                        eaten: false
                    });
                } else if (cell === 'o') {
                    this.powerDots.push({
                        x: x * CELL_SIZE + CELL_SIZE/2,
                        y: y * CELL_SIZE + CELL_SIZE/2,
                        eaten: false
                    });
                }
            }
        }
        console.log(`Map initialized with ${this.walls.length} walls`);
    }

    draw(ctx) {
        // Draw walls with debug info
        ctx.fillStyle = WALL_COLOR;
        for (const wall of this.walls) {
            // Draw the wall
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
            
            // Draw debug outline
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
            
            // Draw wall ID for debugging (uncomment if needed)
            /*ctx.fillStyle = 'white';
            ctx.font = '8px Arial';
            ctx.fillText(wall.id.toString(), wall.x + 2, wall.y + 8);*/
        }

        // Draw dots
        ctx.fillStyle = DOT_COLOR;
        for (const dot of this.dots) {
            if (!dot.eaten) {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw power dots
        ctx.fillStyle = POWER_DOT_COLOR;
        for (const dot of this.powerDots) {
            if (!dot.eaten) {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw grid for debugging
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        for (let x = 0; x < MAP_LAYOUT[0].length * CELL_SIZE; x += CELL_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, MAP_LAYOUT.length * CELL_SIZE);
            ctx.stroke();
        }
        for (let y = 0; y < MAP_LAYOUT.length * CELL_SIZE; y += CELL_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(MAP_LAYOUT[0].length * CELL_SIZE, y);
            ctx.stroke();
        }
    }

    checkDotCollision(x, y) {
        const radius = CELL_SIZE/2;
        for (const dot of this.dots) {
            if (!dot.eaten && 
                Math.hypot(x - dot.x, y - dot.y) < radius) {
                dot.eaten = true;
                return 10; // Score for eating a dot
            }
        }
        return 0;
    }

    checkPowerDotCollision(x, y) {
        const radius = CELL_SIZE/2;
        for (const dot of this.powerDots) {
            if (!dot.eaten && 
                Math.hypot(x - dot.x, y - dot.y) < radius) {
                dot.eaten = true;
                return true;
            }
        }
        return false;
    }

    getRemainingDots() {
        return this.dots.filter(dot => !dot.eaten).length + 
               this.powerDots.filter(dot => !dot.eaten).length;
    }
}