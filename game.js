// ==================== GAME CONFIGURATION ====================
const CONFIG = {
    canvas: {
        width: 800,
        height: 600
    },
    player: {
        width: 32,
        height: 32,
        speed: 5,
        jumpForce: 12,
        gravity: 0.5,
        maxFallSpeed: 15
    },
    level: {
        width: 4000,
        groundHeight: 50
    },
    enemy: {
        speed: 2,
        width: 32,
        height: 32
    },
    star: {
        width: 20,
        height: 20,
        points: 10
    }
};

// ==================== GAME STATE ====================
const GAME_STATES = {
    START: 'start',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver',
    WIN: 'win'
};

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = GAME_STATES.START;
        this.score = 0;
        this.lives = 3;
        this.camera = { x: 0, y: 0 };

        this.keys = {};
        this.setupEventListeners();

        this.player = null;
        this.platforms = [];
        this.stars = [];
        this.enemies = [];
        this.obstacles = [];

        this.initializeLevel();
        this.gameLoop();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            if (e.code === 'Space') {
                e.preventDefault();
                if (this.state === GAME_STATES.START) {
                    this.startGame();
                } else if (this.state === GAME_STATES.PLAYING && this.player) {
                    this.player.jump();
                }
            }

            if (e.code === 'KeyR' && (this.state === GAME_STATES.GAME_OVER || this.state === GAME_STATES.WIN)) {
                this.restart();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    initializeLevel() {
        // Create player
        this.player = new Player(100, 400);

        // Create ground platforms
        this.platforms = [
            new Platform(0, 550, CONFIG.level.width, CONFIG.level.groundHeight, '#2d5016'),
        ];

        // Create elevated platforms
        this.createPlatforms();

        // Create stars
        this.createStars();

        // Create enemies
        this.createEnemies();

        // Create obstacles
        this.createObstacles();

        // Create goal
        this.goal = {
            x: CONFIG.level.width - 100,
            y: 450,
            width: 80,
            height: 100
        };
    }

    createPlatforms() {
        // Garden entrance area
        this.platforms.push(new Platform(300, 450, 150, 20, '#8B4513'));
        this.platforms.push(new Platform(500, 400, 120, 20, '#8B4513'));

        // Fountain courtyard
        this.platforms.push(new Platform(900, 480, 200, 20, '#8B4513'));
        this.platforms.push(new Platform(1150, 420, 100, 20, '#8B4513'));
        this.platforms.push(new Platform(1300, 380, 150, 20, '#8B4513'));

        // Rose garden platforming section
        this.platforms.push(new Platform(1700, 450, 120, 20, '#8B4513'));
        this.platforms.push(new Platform(1900, 400, 100, 20, '#8B4513'));
        this.platforms.push(new Platform(2100, 350, 120, 20, '#8B4513'));
        this.platforms.push(new Platform(2300, 420, 150, 20, '#8B4513'));

        // White House approach
        this.platforms.push(new Platform(2700, 480, 180, 20, '#8B4513'));
        this.platforms.push(new Platform(3000, 450, 150, 20, '#8B4513'));
        this.platforms.push(new Platform(3300, 480, 200, 20, '#8B4513'));
    }

    createStars() {
        // Distribute stars throughout the level
        const starPositions = [
            {x: 200, y: 480}, {x: 350, y: 380}, {x: 550, y: 330},
            {x: 750, y: 480}, {x: 950, y: 410}, {x: 1180, y: 350},
            {x: 1350, y: 310}, {x: 1500, y: 480}, {x: 1750, y: 380},
            {x: 1950, y: 330}, {x: 2150, y: 280}, {x: 2350, y: 350},
            {x: 2550, y: 480}, {x: 2750, y: 410}, {x: 3050, y: 380},
            {x: 3350, y: 410}, {x: 3550, y: 480}, {x: 3750, y: 450}
        ];

        starPositions.forEach(pos => {
            this.stars.push(new Star(pos.x, pos.y));
        });
    }

    createEnemies() {
        // Create patrolling enemies
        this.enemies.push(new Enemy(600, 518, 500, 700));
        this.enemies.push(new Enemy(1000, 488, 900, 1100));
        this.enemies.push(new Enemy(1500, 518, 1400, 1650));
        this.enemies.push(new Enemy(2000, 518, 1900, 2200));
        this.enemies.push(new Enemy(2800, 488, 2700, 2880));
        this.enemies.push(new Enemy(3400, 488, 3300, 3500));
    }

    createObstacles() {
        // Static obstacles (bushes, fountains, etc.)
        this.obstacles.push(new Obstacle(800, 510, 40, 40, '#228B22')); // Bush
        this.obstacles.push(new Obstacle(1600, 510, 40, 40, '#228B22')); // Bush
        this.obstacles.push(new Obstacle(2500, 510, 40, 40, '#228B22')); // Bush
    }

    startGame() {
        this.state = GAME_STATES.PLAYING;
        this.score = 0;
        this.lives = 3;
    }

    restart() {
        this.state = GAME_STATES.START;
        this.score = 0;
        this.lives = 3;
        this.camera = { x: 0, y: 0 };
        this.initializeLevel();
    }

    update() {
        if (this.state !== GAME_STATES.PLAYING) return;

        // Update player
        if (this.player) {
            this.player.update(this.keys, this.platforms);

            // Update camera to follow player
            this.updateCamera();

            // Check star collection
            this.checkStarCollisions();

            // Check enemy collisions
            this.checkEnemyCollisions();

            // Check obstacle collisions
            this.checkObstacleCollisions();

            // Check goal
            this.checkGoal();

            // Check if player fell off the world
            if (this.player.y > CONFIG.canvas.height + 100) {
                this.loseLife();
            }
        }

        // Update enemies
        this.enemies.forEach(enemy => enemy.update());
    }

    updateCamera() {
        // Camera follows player with some leading room
        const targetX = this.player.x - CONFIG.canvas.width / 3;
        this.camera.x = Math.max(0, Math.min(targetX, CONFIG.level.width - CONFIG.canvas.width));
        this.camera.y = 0;
    }

    checkStarCollisions() {
        this.stars = this.stars.filter(star => {
            if (this.checkCollision(this.player, star)) {
                this.score += CONFIG.star.points;
                return false;
            }
            return true;
        });
    }

    checkEnemyCollisions() {
        this.enemies.forEach(enemy => {
            if (this.checkCollision(this.player, enemy)) {
                this.loseLife();
            }
        });
    }

    checkObstacleCollisions() {
        this.obstacles.forEach(obstacle => {
            if (this.checkCollision(this.player, obstacle)) {
                this.loseLife();
            }
        });
    }

    checkGoal() {
        if (this.checkCollision(this.player, this.goal)) {
            this.winGame();
        }
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Reset player position
            this.player.x = 100;
            this.player.y = 400;
            this.player.velocityX = 0;
            this.player.velocityY = 0;
            this.camera.x = 0;
        }
    }

    gameOver() {
        this.state = GAME_STATES.GAME_OVER;
    }

    winGame() {
        this.state = GAME_STATES.WIN;
        // Add completion bonus
        this.score += 100 + (this.lives * 50);
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        // Save context for camera transform
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        if (this.state === GAME_STATES.PLAYING || this.state === GAME_STATES.WIN || this.state === GAME_STATES.GAME_OVER) {
            // Draw background elements
            this.drawBackground();

            // Draw goal (White House entrance)
            this.drawGoal();

            // Draw platforms
            this.platforms.forEach(platform => platform.draw(this.ctx));

            // Draw obstacles
            this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));

            // Draw stars
            this.stars.forEach(star => star.draw(this.ctx));

            // Draw enemies
            this.enemies.forEach(enemy => enemy.draw(this.ctx));

            // Draw player
            if (this.player) {
                this.player.draw(this.ctx);
            }
        }

        // Restore context
        this.ctx.restore();

        // Draw HUD (not affected by camera)
        if (this.state === GAME_STATES.PLAYING) {
            this.drawHUD();
        }

        // Draw screens
        if (this.state === GAME_STATES.START) {
            this.drawStartScreen();
        } else if (this.state === GAME_STATES.GAME_OVER) {
            this.drawGameOverScreen();
        } else if (this.state === GAME_STATES.WIN) {
            this.drawWinScreen();
        }
    }

    drawBackground() {
        // Draw clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 10; i++) {
            const x = i * 500 + 100;
            this.drawCloud(x, 80);
            this.drawCloud(x + 250, 150);
        }

        // Draw grass on ground
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, 550, CONFIG.level.width, 10);
    }

    drawCloud(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
        this.ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawGoal() {
        // Draw White House entrance (simplified)
        // Building
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);

        // Door
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(this.goal.x + 25, this.goal.y + 40, 30, 60);

        // Columns
        this.ctx.fillStyle = '#F5F5F5';
        this.ctx.fillRect(this.goal.x + 5, this.goal.y + 20, 10, 80);
        this.ctx.fillRect(this.goal.x + 65, this.goal.y + 20, 10, 80);

        // Roof
        this.ctx.fillStyle = '#DC143C';
        this.ctx.beginPath();
        this.ctx.moveTo(this.goal.x - 10, this.goal.y);
        this.ctx.lineTo(this.goal.x + this.goal.width / 2, this.goal.y - 30);
        this.ctx.lineTo(this.goal.x + this.goal.width + 10, this.goal.y);
        this.ctx.fill();

        // Flag
        this.ctx.fillStyle = '#002868';
        this.ctx.fillRect(this.goal.x + this.goal.width / 2 - 2, this.goal.y - 60, 4, 30);
        this.ctx.fillStyle = '#BF0A30';
        this.ctx.fillRect(this.goal.x + this.goal.width / 2 + 2, this.goal.y - 55, 20, 15);
    }

    drawHUD() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, CONFIG.canvas.width, 40);

        // Score
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 20px "Courier New"';
        this.ctx.fillText(`Score: ${this.score}`, 20, 28);

        // Lives
        this.ctx.fillText(`Lives: ${this.lives}`, CONFIG.canvas.width - 150, 28);

        // Draw hearts
        for (let i = 0; i < this.lives; i++) {
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillText('♥', CONFIG.canvas.width - 100 + (i * 25), 28);
        }
    }

    drawStartScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 48px "Courier New"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('WHITE HOUSE RUNNER', CONFIG.canvas.width / 2, 200);

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 24px "Courier New"';
        this.ctx.fillText('Help Trump reach the White House!', CONFIG.canvas.width / 2, 280);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 20px "Courier New"';
        this.ctx.fillText('Press SPACE to Start', CONFIG.canvas.width / 2, 380);

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '18px "Courier New"';
        this.ctx.fillText('Collect stars and avoid enemies!', CONFIG.canvas.width / 2, 450);

        this.ctx.textAlign = 'left';
    }

    drawGameOverScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = 'bold 48px "Courier New"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', CONFIG.canvas.width / 2, 250);

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 32px "Courier New"';
        this.ctx.fillText(`Final Score: ${this.score}`, CONFIG.canvas.width / 2, 320);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 20px "Courier New"';
        this.ctx.fillText('Press R to Restart', CONFIG.canvas.width / 2, 400);

        this.ctx.textAlign = 'left';
    }

    drawWinScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = 'bold 48px "Courier New"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('YOU WIN!', CONFIG.canvas.width / 2, 200);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 36px "Courier New"';
        this.ctx.fillText('Welcome to the White House!', CONFIG.canvas.width / 2, 270);

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 32px "Courier New"';
        this.ctx.fillText(`Final Score: ${this.score}`, CONFIG.canvas.width / 2, 340);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 20px "Courier New"';
        this.ctx.fillText('Press R to Play Again', CONFIG.canvas.width / 2, 420);

        this.ctx.textAlign = 'left';
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// ==================== PLAYER CLASS ====================
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.player.width;
        this.height = CONFIG.player.height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isGrounded = false;
        this.direction = 1; // 1 for right, -1 for left
        this.animationFrame = 0;
        this.animationTimer = 0;
    }

    update(keys, platforms) {
        // Horizontal movement
        this.velocityX = 0;
        if (keys['ArrowLeft']) {
            this.velocityX = -CONFIG.player.speed;
            this.direction = -1;
        }
        if (keys['ArrowRight']) {
            this.velocityX = CONFIG.player.speed;
            this.direction = 1;
        }

        // Apply gravity
        this.velocityY += CONFIG.player.gravity;
        if (this.velocityY > CONFIG.player.maxFallSpeed) {
            this.velocityY = CONFIG.player.maxFallSpeed;
        }

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Keep player in bounds horizontally
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > CONFIG.level.width) {
            this.x = CONFIG.level.width - this.width;
        }

        // Collision with platforms
        this.isGrounded = false;
        platforms.forEach(platform => {
            if (this.checkPlatformCollision(platform)) {
                // Landing on top of platform
                if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.isGrounded = true;
                }
            }
        });

        // Animation
        if (this.velocityX !== 0) {
            this.animationTimer++;
            if (this.animationTimer > 8) {
                this.animationFrame = (this.animationFrame + 1) % 4;
                this.animationTimer = 0;
            }
        } else {
            this.animationFrame = 0;
        }
    }

    jump() {
        if (this.isGrounded) {
            this.velocityY = -CONFIG.player.jumpForce;
            this.isGrounded = false;
        }
    }

    checkPlatformCollision(platform) {
        return this.x < platform.x + platform.width &&
               this.x + this.width > platform.x &&
               this.y < platform.y + platform.height &&
               this.y + this.height > platform.y;
    }

    draw(ctx) {
        // Draw 8-bit Trump character
        ctx.save();

        // Flip context if facing left
        if (this.direction === -1) {
            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(this.x, this.y);
        }

        // Hair (blonde)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(4, 2, 24, 8);
        ctx.fillRect(0, 4, 6, 6);

        // Face (orange-ish)
        ctx.fillStyle = '#FFA07A';
        ctx.fillRect(8, 8, 16, 12);

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(10, 12, 3, 3);
        ctx.fillRect(19, 12, 3, 3);

        // Suit (dark)
        ctx.fillStyle = '#1C1C1C';
        ctx.fillRect(6, 20, 20, 16);

        // Shirt (white)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(14, 22, 4, 8);

        // Tie (red)
        ctx.fillStyle = '#DC143C';
        ctx.fillRect(14, 24, 4, 10);

        // Arms
        ctx.fillStyle = '#1C1C1C';
        ctx.fillRect(2, 22, 4, 10);
        ctx.fillRect(26, 22, 4, 10);

        // Hands
        ctx.fillStyle = '#FFA07A';
        ctx.fillRect(2, 30, 4, 4);
        ctx.fillRect(26, 30, 4, 4);

        // Legs
        ctx.fillStyle = '#1C1C1C';
        const legOffset = this.animationFrame % 2 === 0 ? 0 : 2;
        ctx.fillRect(10, 36, 5, 12 - legOffset);
        ctx.fillRect(17, 36, 5, 12 + legOffset);

        // Shoes
        ctx.fillStyle = '#000000';
        ctx.fillRect(9, 46, 6, 4);
        ctx.fillRect(17, 46, 6, 4);

        ctx.restore();
    }
}

// ==================== PLATFORM CLASS ====================
class Platform {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Add some texture
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = 0; i < this.width; i += 20) {
            ctx.fillRect(this.x + i, this.y, 2, this.height);
        }
    }
}

// ==================== STAR CLASS ====================
class Star {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.star.width;
        this.height = CONFIG.star.height;
        this.rotation = 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        this.rotation += 0.05;
        ctx.rotate(this.rotation);

        // Draw 5-pointed star
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * 10;
            const y = Math.sin(angle) * 10;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();

        // Inner glow
        ctx.strokeStyle = '#FFF700';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }
}

// ==================== ENEMY CLASS ====================
class Enemy {
    constructor(x, y, minX, maxX) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.enemy.width;
        this.height = CONFIG.enemy.height;
        this.minX = minX;
        this.maxX = maxX;
        this.speed = CONFIG.enemy.speed;
        this.direction = 1;
    }

    update() {
        this.x += this.speed * this.direction;

        // Reverse direction at patrol boundaries
        if (this.x <= this.minX || this.x >= this.maxX) {
            this.direction *= -1;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Security guard / reporter character
        // Head
        ctx.fillStyle = '#FFD4A3';
        ctx.fillRect(8, 2, 16, 12);

        // Hair
        ctx.fillStyle = '#4B3621';
        ctx.fillRect(8, 0, 16, 4);

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(10, 6, 3, 3);
        ctx.fillRect(19, 6, 3, 3);

        // Body (suit)
        ctx.fillStyle = '#1E3A8A';
        ctx.fillRect(6, 14, 20, 18);

        // Arms
        ctx.fillRect(2, 16, 4, 12);
        ctx.fillRect(26, 16, 4, 12);

        // Legs
        ctx.fillStyle = '#1E3A8A';
        ctx.fillRect(10, 32, 5, 12);
        ctx.fillRect(17, 32, 5, 12);

        // Shoes
        ctx.fillStyle = '#000000';
        ctx.fillRect(9, 42, 6, 3);
        ctx.fillRect(17, 42, 6, 3);

        ctx.restore();
    }
}

// ==================== OBSTACLE CLASS ====================
class Obstacle {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(ctx) {
        // Draw bush
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y + 10, 12, 0, Math.PI * 2);
        ctx.arc(this.x + 30, this.y + 10, 12, 0, Math.PI * 2);
        ctx.arc(this.x + 20, this.y, 12, 0, Math.PI * 2);
        ctx.fill();

        // Darker green for depth
        ctx.fillStyle = '#1a6b1a';
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 15, 6, 0, Math.PI * 2);
        ctx.arc(this.x + 25, this.y + 15, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ==================== INITIALIZE GAME ====================
let game;
window.addEventListener('load', () => {
    game = new Game();
    initDebugPanel();
});

// ==================== DEBUG PANEL ====================
const DEFAULT_VALUES = {
    playerSpeed: 5,
    jumpForce: 12,
    gravity: 0.5,
    maxFallSpeed: 15,
    playerWidth: 32,
    playerHeight: 32,
    enemySpeed: 2
};

function initDebugPanel() {
    const debugPanel = document.getElementById('debugPanel');
    const debugToggle = document.getElementById('debugToggle');
    const debugClose = document.getElementById('debugClose');
    const copyBtn = document.getElementById('copyValues');
    const resetBtn = document.getElementById('resetValues');
    const debugValues = document.getElementById('debugValues');

    // Toggle debug panel with button
    debugToggle.addEventListener('click', () => {
        debugPanel.classList.toggle('hidden');
    });

    // Close debug panel
    debugClose.addEventListener('click', () => {
        debugPanel.classList.add('hidden');
    });

    // Keyboard shortcut - D key
    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyD' && !e.repeat) {
            debugPanel.classList.toggle('hidden');
        }
    });

    // Setup all the sliders
    setupSlider('playerSpeed', 'playerSpeedValue', (value) => {
        CONFIG.player.speed = value;
    });

    setupSlider('jumpForce', 'jumpForceValue', (value) => {
        CONFIG.player.jumpForce = value;
    });

    setupSlider('gravity', 'gravityValue', (value) => {
        CONFIG.player.gravity = value;
    });

    setupSlider('maxFallSpeed', 'maxFallSpeedValue', (value) => {
        CONFIG.player.maxFallSpeed = value;
    });

    setupSlider('playerWidth', 'playerWidthValue', (value) => {
        CONFIG.player.width = value;
        if (game.player) {
            game.player.width = value;
        }
    });

    setupSlider('playerHeight', 'playerHeightValue', (value) => {
        CONFIG.player.height = value;
        if (game.player) {
            game.player.height = value;
        }
    });

    setupSlider('enemySpeed', 'enemySpeedValue', (value) => {
        CONFIG.enemy.speed = value;
        if (game.enemies) {
            game.enemies.forEach(enemy => {
                enemy.speed = value;
            });
        }
    });

    // Update debug values display
    updateDebugDisplay();

    // Copy values to clipboard
    copyBtn.addEventListener('click', () => {
        const values = {
            player: {
                width: CONFIG.player.width,
                height: CONFIG.player.height,
                speed: CONFIG.player.speed,
                jumpForce: CONFIG.player.jumpForce,
                gravity: CONFIG.player.gravity,
                maxFallSpeed: CONFIG.player.maxFallSpeed
            },
            enemy: {
                speed: CONFIG.enemy.speed
            }
        };

        const text = `// Optimized Physics Values
CONFIG = {
    player: {
        width: ${values.player.width},
        height: ${values.player.height},
        speed: ${values.player.speed},
        jumpForce: ${values.player.jumpForce},
        gravity: ${values.player.gravity},
        maxFallSpeed: ${values.player.maxFallSpeed}
    },
    enemy: {
        speed: ${values.enemy.speed}
    }
};`;

        navigator.clipboard.writeText(text).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy Values to Clipboard';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            copyBtn.textContent = 'Copy failed!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy Values to Clipboard';
            }, 2000);
        });
    });

    // Reset to default values
    resetBtn.addEventListener('click', () => {
        document.getElementById('playerSpeed').value = DEFAULT_VALUES.playerSpeed;
        document.getElementById('jumpForce').value = DEFAULT_VALUES.jumpForce;
        document.getElementById('gravity').value = DEFAULT_VALUES.gravity;
        document.getElementById('maxFallSpeed').value = DEFAULT_VALUES.maxFallSpeed;
        document.getElementById('playerWidth').value = DEFAULT_VALUES.playerWidth;
        document.getElementById('playerHeight').value = DEFAULT_VALUES.playerHeight;
        document.getElementById('enemySpeed').value = DEFAULT_VALUES.enemySpeed;

        // Trigger change events
        document.getElementById('playerSpeed').dispatchEvent(new Event('input'));
        document.getElementById('jumpForce').dispatchEvent(new Event('input'));
        document.getElementById('gravity').dispatchEvent(new Event('input'));
        document.getElementById('maxFallSpeed').dispatchEvent(new Event('input'));
        document.getElementById('playerWidth').dispatchEvent(new Event('input'));
        document.getElementById('playerHeight').dispatchEvent(new Event('input'));
        document.getElementById('enemySpeed').dispatchEvent(new Event('input'));

        resetBtn.textContent = 'Reset Complete!';
        setTimeout(() => {
            resetBtn.textContent = 'Reset to Defaults';
        }, 2000);
    });
}

function setupSlider(sliderId, valueId, callback) {
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(valueId);

    slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        valueDisplay.textContent = value;
        callback(value);
        updateDebugDisplay();
    });
}

function updateDebugDisplay() {
    const debugValues = document.getElementById('debugValues');
    const values = `
<strong>Player Physics:</strong>
• Speed: ${CONFIG.player.speed} px/frame
• Jump Force: ${CONFIG.player.jumpForce}
• Gravity: ${CONFIG.player.gravity}
• Max Fall Speed: ${CONFIG.player.maxFallSpeed}
• Size: ${CONFIG.player.width}x${CONFIG.player.height}px

<strong>Enemy Settings:</strong>
• Speed: ${CONFIG.enemy.speed} px/frame

<strong>Tip:</strong> Use the "Copy Values" button to get formatted code to share!
    `.trim();

    debugValues.innerHTML = values;
}
