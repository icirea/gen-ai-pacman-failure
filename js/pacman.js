class Pacman {
    constructor(x, y) {
        // Initialize at exact grid position
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.speed = 2;
        this.mouthOpen = 0;
        this.mouthSpeed = 0.15;
        console.log('Pacman initialized at exact position:', x, y);
    }

    update(walls, canvasWidth) {
        // Get current grid position
        const gridX = Math.round(this.x / CELL_SIZE);
        const gridY = Math.round(this.y / CELL_SIZE);

        // Check if we're at or very close to a grid center
        const atGridCenter = (
            Math.abs(this.x - gridX * CELL_SIZE) < 1 &&
            Math.abs(this.y - gridY * CELL_SIZE) < 1
        );

        if (atGridCenter) {
            // Snap to grid
            this.x = gridX * CELL_SIZE;
            this.y = gridY * CELL_SIZE;

            // Try to move in the next direction if we have one
            if (this.nextDirection.x !== 0 || this.nextDirection.y !== 0) {
                const nextGridX = gridX + this.nextDirection.x;
                const nextGridY = gridY + this.nextDirection.y;

                if (!this.isWallAtGrid(nextGridX, nextGridY, walls)) {
                    this.direction = { ...this.nextDirection };
                    this.targetX = nextGridX * CELL_SIZE;
                    this.targetY = nextGridY * CELL_SIZE;
                } else {
                    // If we can't go in the next direction, try to continue in current direction
                    const currentNextX = gridX + this.direction.x;
                    const currentNextY = gridY + this.direction.y;
                    
                    if (!this.isWallAtGrid(currentNextX, currentNextY, walls)) {
                        this.targetX = currentNextX * CELL_SIZE;
                        this.targetY = currentNextY * CELL_SIZE;
                    }
                }
            }
        }

        // Move towards target position
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        
        if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
            if (this.direction.x !== 0) {
                this.x += Math.sign(dx) * Math.min(Math.abs(dx), this.speed);
            }
            if (this.direction.y !== 0) {
                this.y += Math.sign(dy) * Math.min(Math.abs(dy), this.speed);
            }
        }

        // Handle tunnel wrapping
        if (this.x < -CELL_SIZE) {
            this.x = canvasWidth;
            this.targetX = this.x;
        } else if (this.x > canvasWidth) {
            this.x = -CELL_SIZE;
            this.targetX = this.x;
        }

        // Animate mouth only when moving
        if (this.direction.x !== 0 || this.direction.y !== 0) {
            this.mouthOpen += this.mouthSpeed;
            if (this.mouthOpen > 0.5 || this.mouthOpen < 0) {
                this.mouthSpeed *= -1;
            }
        }
    }

    isWallAtGrid(gridX, gridY, walls) {
        for (const wall of walls) {
            const wallGridX = Math.round(wall.x / CELL_SIZE);
            const wallGridY = Math.round(wall.y / CELL_SIZE);
            
            if (gridX === wallGridX && gridY === wallGridY) {
                return true;
            }
        }
        return false;
    }

    setNextDirection(direction) {
        this.nextDirection = { ...direction };
        console.log('New direction set:', direction);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Rotate based on direction
        let angle = 0;
        if (this.direction.x === 1) angle = 0;
        if (this.direction.x === -1) angle = Math.PI;
        if (this.direction.y === -1) angle = -Math.PI/2;
        if (this.direction.y === 1) angle = Math.PI/2;
        ctx.rotate(angle);

        // Draw Pac-Man
        ctx.beginPath();
        ctx.arc(0, 0, CELL_SIZE/2 - 2, this.mouthOpen * Math.PI, (2 - this.mouthOpen) * Math.PI);
        ctx.lineTo(0, 0);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        
        ctx.restore();

        // Draw debug visualization
        if (true) {
            // Current cell
            const gridX = Math.round(this.x / CELL_SIZE) * CELL_SIZE;
            const gridY = Math.round(this.y / CELL_SIZE) * CELL_SIZE;
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.strokeRect(gridX - CELL_SIZE/2, gridY - CELL_SIZE/2, CELL_SIZE, CELL_SIZE);

            // Target cell
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.targetX, this.targetY);
            ctx.stroke();
            ctx.strokeRect(
                this.targetX - CELL_SIZE/2,
                this.targetY - CELL_SIZE/2,
                CELL_SIZE,
                CELL_SIZE
            );
        }
    }
}