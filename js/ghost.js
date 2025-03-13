class Ghost {
    constructor(x, y, color, behavior) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.behavior = behavior;
        this.direction = { x: 0, y: 0 };
        this.speed = 1.5;
        this.scared = false;
        this.scaredTimer = 0;
    }

    update(pacman, walls, canvasWidth) {
        if (this.scared) {
            this.scaredTimer--;
            if (this.scaredTimer <= 0) {
                this.scared = false;
            }
        }

        // Simple ghost AI
        const possibleDirections = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];

        // Filter out invalid directions (walls)
        const validDirections = possibleDirections.filter(dir => {
            const nextX = this.x + dir.x * this.speed;
            const nextY = this.y + dir.y * this.speed;
            return !this.checkCollision(nextX, nextY, walls);
        });

        if (validDirections.length > 0) {
            if (!this.scared) {
                // Choose direction that gets closer to Pacman
                let bestDirection = validDirections[0];
                let minDistance = Infinity;

                for (const dir of validDirections) {
                    const nextX = this.x + dir.x * this.speed;
                    const nextY = this.y + dir.y * this.speed;
                    const distance = Math.hypot(nextX - pacman.x, nextY - pacman.y);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestDirection = dir;
                    }
                }

                this.direction = bestDirection;
            } else {
                // When scared, move randomly
                const randomIndex = Math.floor(Math.random() * validDirections.length);
                this.direction = validDirections[randomIndex];
            }
        }

        // Move ghost
        this.x += this.direction.x * this.speed;
        this.y += this.direction.y * this.speed;

        // Handle tunnel wrapping
        if (this.x < 0) this.x = canvasWidth;
        if (this.x > canvasWidth) this.x = 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw ghost body
        ctx.beginPath();
        ctx.arc(0, -CELL_SIZE/4, CELL_SIZE/2, Math.PI, 0, false);
        ctx.lineTo(CELL_SIZE/2, CELL_SIZE/2);
        
        // Draw wavy bottom
        for (let i = 0; i < 3; i++) {
            const startX = CELL_SIZE/2 - (i * CELL_SIZE/3);
            ctx.quadraticCurveTo(
                startX - CELL_SIZE/6, CELL_SIZE/3,
                startX - CELL_SIZE/3, CELL_SIZE/2
            );
        }

        ctx.fillStyle = this.scared ? '#2121DE' : this.color;
        ctx.fill();

        // Draw eyes
        if (!this.scared) {
            const eyeOffset = CELL_SIZE/6;
            this.drawEye(ctx, -eyeOffset, -CELL_SIZE/4);
            this.drawEye(ctx, eyeOffset, -CELL_SIZE/4);
        }

        ctx.restore();
    }

    drawEye(ctx, x, y) {
        ctx.beginPath();
        ctx.arc(x, y, CELL_SIZE/6, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + CELL_SIZE/12, y, CELL_SIZE/12, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
    }

    checkCollision(x, y, walls) {
        const radius = CELL_SIZE/2;
        for (const wall of walls) {
            if (x + radius > wall.x && 
                x - radius < wall.x + wall.width &&
                y + radius > wall.y && 
                y - radius < wall.y + wall.height) {
                return true;
            }
        }
        return false;
    }

    makeScared() {
        this.scared = true;
        this.scaredTimer = 500; // About 8 seconds at 60fps
    }
}