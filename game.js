// ==================== GAME CONFIGURATION ====================
const CONFIG = {
    canvas: {
        width: 800,
        height: 600
    },
    player: {
        width: 32,
        height: 32,
        speed: 7,
        jumpForce: 15,
        gravity: 0.8,
        maxFallSpeed: 13
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
        points: 10,
        flashDuration: 60 // frames (1 second at 60fps)
    },
    timeBonus: {
        maxBonus: 1000,    // Maximum time bonus
        decreaseRate: 1,   // Points decrease per frame (at 60fps)
        minBonus: 0        // Minimum time bonus
    },
    levels: {
        total: 3
    }
};

// ==================== GAME STATE ====================
const GAME_STATES = {
    CHARACTER_SELECT: 'characterSelect',
    START: 'start',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver',
    WIN: 'win'
};

// ==================== PRESIDENT CHARACTER DATA ====================
const PRESIDENTS = [
    {
        id: 'biden',
        name: 'Joe Biden',
        years: '2021-Present',
        hair: '#E8E8E8',      // White/very light gray (older appearance)
        face: '#FFE4C4',
        suit: '#000080',       // Navy blue
        tie: '#DC143C',        // Red
        features: 'wrinkles'   // Special feature for older appearance
    },
    {
        id: 'trump',
        name: 'Donald Trump',
        years: '2017-2021',
        hair: '#FFB347',       // Golden blonde
        face: '#FFA07A',       // Orange-ish
        suit: '#1C1C1C',       // Dark suit
        tie: '#DC143C',        // Red
        features: 'distinctive-hair' // Special hair style
    },
    {
        id: 'obama',
        name: 'Barack Obama',
        years: '2009-2017',
        hair: '#2C1810',       // Dark brown/black
        face: '#8B6F47',       // Brown
        suit: '#1C1C1C',
        tie: '#0000FF'         // Blue
    },
    {
        id: 'bush-w',
        name: 'George W. Bush',
        years: '2001-2009',
        hair: '#8B7355',       // Gray-brown
        face: '#FFE4C4',
        suit: '#1C1C1C',
        tie: '#DC143C'
    },
    {
        id: 'clinton',
        name: 'Bill Clinton',
        years: '1993-2001',
        hair: '#C0C0C0',       // Gray
        face: '#FFE4C4',
        suit: '#000080',
        tie: '#DC143C'
    },
    {
        id: 'bush-hw',
        name: 'George H.W. Bush',
        years: '1989-1993',
        hair: '#A9A9A9',       // Gray
        face: '#FFE4C4',
        suit: '#1C1C1C',
        tie: '#DC143C'
    },
    {
        id: 'reagan',
        name: 'Ronald Reagan',
        years: '1981-1989',
        hair: '#4B3621',       // Dark brown
        face: '#FFE4C4',
        suit: '#1C1C1C',
        tie: '#DC143C'
    },
    {
        id: 'carter',
        name: 'Jimmy Carter',
        years: '1977-1981',
        hair: '#A9A9A9',       // Gray
        face: '#FFE4C4',
        suit: '#000080',
        tie: '#8B0000'         // Dark red
    },
    {
        id: 'ford',
        name: 'Gerald Ford',
        years: '1974-1977',
        hair: '#8B7355',       // Gray-brown
        face: '#FFE4C4',
        suit: '#1C1C1C',
        tie: '#0000FF'
    },
    {
        id: 'nixon',
        name: 'Richard Nixon',
        years: '1969-1974',
        hair: '#2C1810',       // Dark
        face: '#FFE4C4',
        suit: '#1C1C1C',
        tie: '#DC143C'
    }
];

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = GAME_STATES.CHARACTER_SELECT;
        this.score = 0;
        this.lives = 3;
        this.currentLevel = 1;
        this.camera = { x: 0, y: 0 };
        this.timeBonus = CONFIG.timeBonus.maxBonus;
        this.levelStartTime = 0;

        // Character selection
        this.selectedCharacterIndex = 1; // Default to Trump (index 1)
        this.selectedCharacter = PRESIDENTS[this.selectedCharacterIndex];

        this.keys = {};
        this.setupEventListeners();

        this.player = null;
        this.platforms = [];
        this.stars = [];
        this.enemies = [];
        this.obstacles = [];
        this.starAnimations = []; // Active star collection animations

        this.initializeLevel();
        this.gameLoop();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Character selection controls
            if (this.state === GAME_STATES.CHARACTER_SELECT) {
                if (e.code === 'ArrowLeft') {
                    e.preventDefault();
                    this.selectedCharacterIndex = (this.selectedCharacterIndex - 1 + PRESIDENTS.length) % PRESIDENTS.length;
                    this.selectedCharacter = PRESIDENTS[this.selectedCharacterIndex];
                }
                if (e.code === 'ArrowRight') {
                    e.preventDefault();
                    this.selectedCharacterIndex = (this.selectedCharacterIndex + 1) % PRESIDENTS.length;
                    this.selectedCharacter = PRESIDENTS[this.selectedCharacterIndex];
                }
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    this.state = GAME_STATES.START;
                }
            }
            // Game controls
            else if (e.code === 'Space') {
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
        // Create player with selected character
        this.player = new Player(100, 400, this.selectedCharacter);

        // Reset arrays
        this.platforms = [];
        this.stars = [];
        this.enemies = [];
        this.obstacles = [];
        this.starAnimations = [];

        // Create level-specific content
        switch(this.currentLevel) {
            case 1:
                this.initializeLevel1();
                break;
            case 2:
                this.initializeLevel2();
                break;
            case 3:
                this.initializeLevel3();
                break;
        }
    }

    initializeLevel1() {
        // Level 1: Outside the White House - jumping over gates, security guard enemies

        // Create ground platforms
        this.platforms = [
            new Platform(0, 550, CONFIG.level.width, CONFIG.level.groundHeight, '#2d5016'),
        ];

        // Gates and entrance area platforms
        this.platforms.push(new Platform(300, 480, 120, 20, '#8B4513'));
        this.platforms.push(new Platform(500, 450, 100, 20, '#8B4513'));
        this.platforms.push(new Platform(700, 420, 120, 20, '#8B4513'));

        // Garden path area
        this.platforms.push(new Platform(1000, 480, 150, 20, '#8B4513'));
        this.platforms.push(new Platform(1200, 440, 100, 20, '#8B4513'));
        this.platforms.push(new Platform(1400, 400, 120, 20, '#8B4513'));

        // Front lawn obstacle course
        this.platforms.push(new Platform(1700, 470, 130, 20, '#8B4513'));
        this.platforms.push(new Platform(1900, 430, 110, 20, '#8B4513'));
        this.platforms.push(new Platform(2100, 390, 130, 20, '#8B4513'));

        // Fountain area
        this.platforms.push(new Platform(2400, 460, 160, 20, '#8B4513'));
        this.platforms.push(new Platform(2650, 420, 120, 20, '#8B4513'));

        // Final approach to entrance
        this.platforms.push(new Platform(2900, 480, 180, 20, '#8B4513'));
        this.platforms.push(new Platform(3150, 450, 140, 20, '#8B4513'));
        this.platforms.push(new Platform(3400, 480, 200, 20, '#8B4513'));

        // Stars - scattered across level
        const starPositions = [
            {x: 200, y: 480}, {x: 350, y: 410}, {x: 550, y: 380}, {x: 750, y: 350},
            {x: 900, y: 480}, {x: 1050, y: 410}, {x: 1250, y: 370}, {x: 1450, y: 330},
            {x: 1600, y: 480}, {x: 1750, y: 400}, {x: 1950, y: 360}, {x: 2150, y: 320},
            {x: 2300, y: 480}, {x: 2450, y: 390}, {x: 2700, y: 350}, {x: 2950, y: 410},
            {x: 3200, y: 380}, {x: 3450, y: 410}, {x: 3650, y: 480}
        ];

        starPositions.forEach(pos => {
            this.stars.push(new Star(pos.x, pos.y));
        });

        // Security guard enemies (patrolling)
        this.enemies.push(new Enemy(600, 518, 500, 750, 'security'));
        this.enemies.push(new Enemy(1100, 518, 1000, 1300, 'security'));
        this.enemies.push(new Enemy(1600, 518, 1500, 1800, 'security'));
        this.enemies.push(new Enemy(2200, 518, 2000, 2400, 'security'));
        this.enemies.push(new Enemy(2800, 518, 2700, 3000, 'security'));
        this.enemies.push(new Enemy(3300, 518, 3200, 3550, 'security'));

        // Gates as obstacles
        this.obstacles.push(new Obstacle(800, 470, 40, 80, '#4A4A4A', 'gate'));
        this.obstacles.push(new Obstacle(1600, 470, 40, 80, '#4A4A4A', 'gate'));
        this.obstacles.push(new Obstacle(2500, 470, 40, 80, '#4A4A4A', 'gate'));

        // Goal: White House front door
        this.goal = {
            x: CONFIG.level.width - 100,
            y: 450,
            width: 80,
            height: 100,
            type: 'whitehouse'
        };
    }

    initializeLevel2() {
        // Level 2: Inside the White House - office spaces and halls

        // Ground (floor)
        this.platforms = [
            new Platform(0, 550, CONFIG.level.width, CONFIG.level.groundHeight, '#8B7355'),
        ];

        // Office furniture platforms
        this.platforms.push(new Platform(250, 480, 100, 20, '#654321'));
        this.platforms.push(new Platform(450, 440, 120, 20, '#654321'));
        this.platforms.push(new Platform(650, 400, 100, 20, '#654321'));

        // Hallway desks and tables
        this.platforms.push(new Platform(900, 470, 140, 20, '#654321'));
        this.platforms.push(new Platform(1100, 420, 110, 20, '#654321'));
        this.platforms.push(new Platform(1300, 380, 130, 20, '#654321'));
        this.platforms.push(new Platform(1500, 450, 120, 20, '#654321'));

        // State room furniture
        this.platforms.push(new Platform(1800, 460, 150, 20, '#654321'));
        this.platforms.push(new Platform(2000, 410, 120, 20, '#654321'));
        this.platforms.push(new Platform(2200, 370, 140, 20, '#654321'));

        // Library shelves
        this.platforms.push(new Platform(2500, 480, 130, 20, '#654321'));
        this.platforms.push(new Platform(2700, 430, 120, 20, '#654321'));
        this.platforms.push(new Platform(2900, 390, 140, 20, '#654321'));

        // Final corridor
        this.platforms.push(new Platform(3200, 470, 150, 20, '#654321'));
        this.platforms.push(new Platform(3400, 440, 180, 20, '#654321'));

        // Stars
        const starPositions = [
            {x: 150, y: 480}, {x: 300, y: 410}, {x: 500, y: 370}, {x: 700, y: 330},
            {x: 850, y: 480}, {x: 950, y: 400}, {x: 1150, y: 350}, {x: 1350, y: 310},
            {x: 1550, y: 380}, {x: 1750, y: 480}, {x: 1850, y: 390}, {x: 2050, y: 340},
            {x: 2250, y: 300}, {x: 2450, y: 480}, {x: 2550, y: 410}, {x: 2750, y: 360},
            {x: 2950, y: 320}, {x: 3250, y: 400}, {x: 3450, y: 370}, {x: 3650, y: 480}
        ];

        starPositions.forEach(pos => {
            this.stars.push(new Star(pos.x, pos.y));
        });

        // Staff/Reporter enemies
        this.enemies.push(new Enemy(500, 518, 400, 700, 'reporter'));
        this.enemies.push(new Enemy(1000, 518, 900, 1200, 'reporter'));
        this.enemies.push(new Enemy(1600, 518, 1500, 1850, 'reporter'));
        this.enemies.push(new Enemy(2100, 518, 2000, 2350, 'reporter'));
        this.enemies.push(new Enemy(2700, 518, 2600, 2950, 'reporter'));
        this.enemies.push(new Enemy(3300, 518, 3200, 3550, 'reporter'));

        // Obstacles (furniture, plants)
        this.obstacles.push(new Obstacle(750, 510, 40, 40, '#228B22', 'plant'));
        this.obstacles.push(new Obstacle(1400, 510, 40, 40, '#228B22', 'plant'));
        this.obstacles.push(new Obstacle(2300, 510, 40, 40, '#228B22', 'plant'));
        this.obstacles.push(new Obstacle(3100, 510, 40, 40, '#228B22', 'plant'));

        // Goal: Corridor to Oval Office
        this.goal = {
            x: CONFIG.level.width - 120,
            y: 420,
            width: 100,
            height: 130,
            type: 'corridor'
        };
    }

    initializeLevel3() {
        // Level 3: Oval Office themed - eagle at the end

        // Ornate floor
        this.platforms = [
            new Platform(0, 550, CONFIG.level.width, CONFIG.level.groundHeight, '#B8860B'),
        ];

        // Presidential furniture platforms (elegant design)
        this.platforms.push(new Platform(300, 470, 130, 20, '#8B4513'));
        this.platforms.push(new Platform(500, 420, 140, 20, '#8B4513'));
        this.platforms.push(new Platform(700, 380, 120, 20, '#8B4513'));
        this.platforms.push(new Platform(900, 350, 130, 20, '#8B4513'));

        // Oval office area
        this.platforms.push(new Platform(1200, 460, 150, 20, '#8B4513'));
        this.platforms.push(new Platform(1400, 410, 140, 20, '#8B4513'));
        this.platforms.push(new Platform(1600, 370, 150, 20, '#8B4513'));

        // Presidential seal area
        this.platforms.push(new Platform(1900, 450, 160, 20, '#8B4513'));
        this.platforms.push(new Platform(2100, 400, 140, 20, '#8B4513'));
        this.platforms.push(new Platform(2300, 360, 150, 20, '#8B4513'));

        // Flag display area
        this.platforms.push(new Platform(2600, 440, 140, 20, '#8B4513'));
        this.platforms.push(new Platform(2800, 390, 150, 20, '#8B4513'));
        this.platforms.push(new Platform(3000, 350, 140, 20, '#8B4513'));

        // Final approach to eagle
        this.platforms.push(new Platform(3300, 430, 160, 20, '#8B4513'));
        this.platforms.push(new Platform(3500, 480, 180, 20, '#8B4513'));

        // Stars (bonus points)
        const starPositions = [
            {x: 200, y: 480}, {x: 350, y: 400}, {x: 550, y: 350}, {x: 750, y: 310}, {x: 950, y: 280},
            {x: 1100, y: 480}, {x: 1250, y: 390}, {x: 1450, y: 340}, {x: 1650, y: 300},
            {x: 1800, y: 480}, {x: 1950, y: 380}, {x: 2150, y: 330}, {x: 2350, y: 290},
            {x: 2500, y: 480}, {x: 2650, y: 370}, {x: 2850, y: 320}, {x: 3050, y: 280},
            {x: 3250, y: 360}, {x: 3350, y: 360}, {x: 3550, y: 410}, {x: 3750, y: 480}
        ];

        starPositions.forEach(pos => {
            this.stars.push(new Star(pos.x, pos.y));
        });

        // Elite security enemies (faster)
        this.enemies.push(new Enemy(550, 518, 450, 800, 'elite'));
        this.enemies.push(new Enemy(1100, 518, 1000, 1400, 'elite'));
        this.enemies.push(new Enemy(1700, 518, 1600, 2000, 'elite'));
        this.enemies.push(new Enemy(2250, 518, 2150, 2500, 'elite'));
        this.enemies.push(new Enemy(2900, 518, 2800, 3200, 'elite'));

        // Decorative obstacles
        this.obstacles.push(new Obstacle(1000, 510, 40, 40, '#FFD700', 'trophy'));
        this.obstacles.push(new Obstacle(2000, 510, 40, 40, '#FFD700', 'trophy'));
        this.obstacles.push(new Obstacle(3100, 510, 40, 40, '#FFD700', 'trophy'));

        // Goal: Eagle (final goal)
        this.goal = {
            x: CONFIG.level.width - 150,
            y: 400,
            width: 120,
            height: 150,
            type: 'eagle'
        };
    }

    startGame() {
        this.state = GAME_STATES.PLAYING;
        this.score = 0;
        this.lives = 3;
        this.timeBonus = CONFIG.timeBonus.maxBonus;
        this.levelStartTime = Date.now();
        // Update player character to match current selection
        if (this.player) {
            this.player.character = this.selectedCharacter;
        }
    }

    restart() {
        this.state = GAME_STATES.CHARACTER_SELECT;
        this.score = 0;
        this.lives = 3;
        this.currentLevel = 1;
        this.camera = { x: 0, y: 0 };
        this.initializeLevel();
    }

    update() {
        if (this.state !== GAME_STATES.PLAYING) return;

        // Update time bonus (decrease over time)
        if (this.timeBonus > CONFIG.timeBonus.minBonus) {
            this.timeBonus -= CONFIG.timeBonus.decreaseRate;
            if (this.timeBonus < CONFIG.timeBonus.minBonus) {
                this.timeBonus = CONFIG.timeBonus.minBonus;
            }
        }

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

        // Update star animations
        this.starAnimations = this.starAnimations.filter(anim => {
            anim.frame++;
            return anim.frame < anim.maxFrames;
        });
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

                // Create star collection animation
                this.starAnimations.push({
                    x: star.x,
                    y: star.y,
                    frame: 0,
                    maxFrames: 30,
                    points: CONFIG.star.points
                });

                // Flash player
                if (this.player) {
                    this.player.flash();
                }

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
        // Trigger damage flash effect
        if (this.player) {
            this.player.damageFlash();
        }
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
        // Add level completion bonus
        this.score += 100 + (this.lives * 50);

        // Add time bonus (rounded to nearest integer)
        const timeBonusPoints = Math.round(this.timeBonus);
        this.score += timeBonusPoints;

        // Check if there are more levels
        if (this.currentLevel < CONFIG.levels.total) {
            // Advance to next level
            this.currentLevel++;
            this.camera = { x: 0, y: 0 };
            this.initializeLevel();
            this.state = GAME_STATES.START;
            // Reset time bonus for new level
            this.timeBonus = CONFIG.timeBonus.maxBonus;
            this.levelStartTime = Date.now();
        } else {
            // Game complete!
            this.state = GAME_STATES.WIN;
        }
    }

    render() {
        // Clear canvas with level-specific background color
        switch(this.currentLevel) {
            case 1:
                this.ctx.fillStyle = '#87CEEB'; // Sky blue for outside
                break;
            case 2:
                this.ctx.fillStyle = '#F5F5DC'; // Beige for inside
                break;
            case 3:
                this.ctx.fillStyle = '#E6E6FA'; // Lavender for Oval Office
                break;
            default:
                this.ctx.fillStyle = '#87CEEB';
        }
        this.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        // Save context for camera transform
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        if (this.state === GAME_STATES.PLAYING || this.state === GAME_STATES.WIN || this.state === GAME_STATES.GAME_OVER) {
            // Draw background elements
            this.drawBackground();

            // Draw goal
            this.drawGoal();

            // Draw platforms
            this.platforms.forEach(platform => platform.draw(this.ctx));

            // Draw obstacles
            this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));

            // Draw stars
            this.stars.forEach(star => star.draw(this.ctx));

            // Draw star collection animations
            this.starAnimations.forEach(anim => this.drawStarAnimation(anim));

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
        if (this.state === GAME_STATES.CHARACTER_SELECT) {
            this.drawCharacterSelectScreen();
        } else if (this.state === GAME_STATES.START) {
            this.drawStartScreen();
        } else if (this.state === GAME_STATES.GAME_OVER) {
            this.drawGameOverScreen();
        } else if (this.state === GAME_STATES.WIN) {
            this.drawWinScreen();
        }
    }

    drawBackground() {
        switch(this.currentLevel) {
            case 1:
                // Outside - clouds and grass
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                for (let i = 0; i < 10; i++) {
                    const x = i * 500 + 100;
                    this.drawCloud(x, 80);
                    this.drawCloud(x + 250, 150);
                }
                // Draw grass on ground
                this.ctx.fillStyle = '#228B22';
                this.ctx.fillRect(0, 550, CONFIG.level.width, 10);
                break;

            case 2:
                // Inside - windows and carpet pattern
                // Windows
                this.ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
                for (let i = 0; i < 20; i++) {
                    this.ctx.fillRect(i * 200 + 50, 50, 80, 120);
                }
                // Carpet pattern
                this.ctx.fillStyle = 'rgba(139, 0, 0, 0.1)';
                this.ctx.fillRect(0, 550, CONFIG.level.width, 10);
                break;

            case 3:
                // Oval Office - elegant details
                // Presidential seal pattern on floor (subtle)
                this.ctx.fillStyle = 'rgba(184, 134, 11, 0.2)';
                for (let i = 0; i < 8; i++) {
                    this.ctx.beginPath();
                    this.ctx.arc(i * 500 + 250, 560, 30, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                // Ornate carpet
                this.ctx.fillStyle = 'rgba(139, 0, 0, 0.2)';
                this.ctx.fillRect(0, 550, CONFIG.level.width, 10);
                break;
        }
    }

    drawCloud(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
        this.ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawGoal() {
        if (!this.goal) return;

        switch(this.goal.type) {
            case 'whitehouse':
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
                break;

            case 'corridor':
                // Fancy doorway
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);

                // Door frame
                this.ctx.strokeStyle = '#FFD700';
                this.ctx.lineWidth = 4;
                this.ctx.strokeRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);

                // Door panels
                this.ctx.fillStyle = '#654321';
                this.ctx.fillRect(this.goal.x + 10, this.goal.y + 10, 35, 50);
                this.ctx.fillRect(this.goal.x + 55, this.goal.y + 10, 35, 50);
                this.ctx.fillRect(this.goal.x + 10, this.goal.y + 70, 35, 50);
                this.ctx.fillRect(this.goal.x + 55, this.goal.y + 70, 35, 50);

                // Door handle
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(this.goal.x + 80, this.goal.y + 65, 5, 0, Math.PI * 2);
                this.ctx.fill();
                break;

            case 'eagle':
                // Draw American Eagle
                const centerX = this.goal.x + this.goal.width / 2;
                const centerY = this.goal.y + this.goal.height / 2;

                // Eagle body
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(centerX - 20, centerY - 10, 40, 50);

                // Wings
                this.ctx.fillStyle = '#654321';
                this.ctx.beginPath();
                this.ctx.moveTo(centerX - 20, centerY);
                this.ctx.lineTo(centerX - 60, centerY - 20);
                this.ctx.lineTo(centerX - 50, centerY + 20);
                this.ctx.fill();

                this.ctx.beginPath();
                this.ctx.moveTo(centerX + 20, centerY);
                this.ctx.lineTo(centerX + 60, centerY - 20);
                this.ctx.lineTo(centerX + 50, centerY + 20);
                this.ctx.fill();

                // Head
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY - 20, 18, 0, Math.PI * 2);
                this.ctx.fill();

                // Beak
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.moveTo(centerX, centerY - 20);
                this.ctx.lineTo(centerX + 15, centerY - 18);
                this.ctx.lineTo(centerX, centerY - 16);
                this.ctx.fill();

                // Eyes
                this.ctx.fillStyle = '#000000';
                this.ctx.beginPath();
                this.ctx.arc(centerX - 5, centerY - 22, 3, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(centerX + 5, centerY - 22, 3, 0, Math.PI * 2);
                this.ctx.fill();

                // Shield
                this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                this.ctx.fillRect(centerX - 15, centerY + 10, 30, 20);
                this.ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
                this.ctx.fillRect(centerX - 15, centerY + 30, 30, 10);

                // Stars around eagle
                this.ctx.fillStyle = '#FFD700';
                for (let i = 0; i < 5; i++) {
                    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                    const sx = centerX + Math.cos(angle) * 70;
                    const sy = centerY + Math.sin(angle) * 70;
                    this.ctx.fillText('★', sx, sy);
                }
                break;
        }
    }

    drawStarAnimation(anim) {
        const alpha = 1 - (anim.frame / anim.maxFrames);
        const scale = 1 + (anim.frame / anim.maxFrames) * 2;
        const offsetY = -anim.frame * 2;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.translate(anim.x + 10, anim.y + offsetY);
        this.ctx.scale(scale, scale);

        // Draw points text
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 16px "Courier New"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`+${anim.points}`, 0, 0);

        // Draw sparkle stars
        for (let i = 0; i < 3; i++) {
            const angle = (anim.frame + i * 120) * Math.PI / 180;
            const radius = 15 + anim.frame * 0.5;
            const sx = Math.cos(angle) * radius;
            const sy = Math.sin(angle) * radius;

            this.ctx.fillText('★', sx, sy);
        }

        this.ctx.restore();
    }

    drawHUD() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, CONFIG.canvas.width, 70);

        // Level
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 20px "Courier New"';
        this.ctx.fillText(`Level: ${this.currentLevel}/${CONFIG.levels.total}`, 20, 28);

        // Score
        this.ctx.fillText(`Score: ${this.score}`, 200, 28);

        // Lives
        this.ctx.fillText(`Lives: ${this.lives}`, CONFIG.canvas.width - 150, 28);

        // Draw hearts
        for (let i = 0; i < this.lives; i++) {
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillText('♥', CONFIG.canvas.width - 100 + (i * 25), 28);
        }

        // Time Bonus with decreasing color intensity
        const timeBonusValue = Math.round(this.timeBonus);
        const bonusPercentage = this.timeBonus / CONFIG.timeBonus.maxBonus;

        // Color transitions from green (high) to yellow (medium) to red (low)
        let bonusColor;
        if (bonusPercentage > 0.6) {
            bonusColor = '#00FF00'; // Green
        } else if (bonusPercentage > 0.3) {
            bonusColor = '#FFFF00'; // Yellow
        } else {
            bonusColor = '#FF6600'; // Orange-red
        }

        this.ctx.fillStyle = bonusColor;
        this.ctx.font = 'bold 18px "Courier New"';
        this.ctx.fillText(`Time Bonus: ${timeBonusValue}`, 20, 58);

        // Add a small progress bar
        const barWidth = 150;
        const barHeight = 8;
        const barX = 200;
        const barY = 48;

        // Background bar
        this.ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Bonus bar
        this.ctx.fillStyle = bonusColor;
        this.ctx.fillRect(barX, barY, barWidth * bonusPercentage, barHeight);

        // Border
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    drawCharacterSelectScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 48px "Courier New"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SELECT YOUR PRESIDENT', CONFIG.canvas.width / 2, 80);

        // Draw character preview cards
        const cardWidth = 180;
        const cardHeight = 280;
        const startX = CONFIG.canvas.width / 2 - cardWidth - 120;
        const cardY = 140;

        // Draw 3 cards: previous, current (selected), next
        for (let i = -1; i <= 1; i++) {
            const index = (this.selectedCharacterIndex + i + PRESIDENTS.length) % PRESIDENTS.length;
            const president = PRESIDENTS[index];
            const x = startX + (i + 1) * (cardWidth + 40);
            const isSelected = i === 0;
            const scale = isSelected ? 1 : 0.8;
            const cardH = cardHeight * scale;
            const cardW = cardWidth * scale;
            const yOffset = isSelected ? 0 : 20;

            // Card background
            this.ctx.fillStyle = isSelected ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(x - (cardW - cardWidth) / 2, cardY + yOffset, cardW, cardH);

            // Card border
            this.ctx.strokeStyle = isSelected ? '#FFD700' : '#666666';
            this.ctx.lineWidth = isSelected ? 4 : 2;
            this.ctx.strokeRect(x - (cardW - cardWidth) / 2, cardY + yOffset, cardW, cardH);

            // Draw mini character preview
            const charX = x + cardWidth / 2 - 32;
            const charY = cardY + yOffset + 40;
            this.drawMiniCharacter(charX, charY, president, scale);

            // President info
            this.ctx.fillStyle = isSelected ? '#FFD700' : '#CCCCCC';
            this.ctx.font = isSelected ? 'bold 20px "Courier New"' : 'bold 16px "Courier New"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(president.name, x + cardWidth / 2, cardY + yOffset + 180);

            this.ctx.fillStyle = isSelected ? '#FFFFFF' : '#999999';
            this.ctx.font = isSelected ? '16px "Courier New"' : '14px "Courier New"';
            this.ctx.fillText(president.years, x + cardWidth / 2, cardY + yOffset + 210);
        }

        // Instructions
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 24px "Courier New"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('← → to Select', CONFIG.canvas.width / 2, 480);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 28px "Courier New"';
        this.ctx.fillText('SPACE to Confirm', CONFIG.canvas.width / 2, 530);

        this.ctx.textAlign = 'left';
    }

    drawMiniCharacter(x, y, president, scale = 1) {
        this.ctx.save();
        this.ctx.translate(x, y);
        if (scale !== 1) {
            this.ctx.scale(scale, scale);
        }

        // Hair with special styling
        this.ctx.fillStyle = president.hair;
        if (president.features === 'distinctive-hair') {
            // Trump's distinctive hair style
            this.ctx.fillRect(2, 2, 28, 7);
            this.ctx.fillRect(0, 3, 4, 5);
            this.ctx.fillRect(22, 1, 8, 3);
        } else {
            // Normal hair
            this.ctx.fillRect(4, 2, 24, 8);
            this.ctx.fillRect(0, 4, 6, 6);
        }

        // Face
        this.ctx.fillStyle = president.face;
        this.ctx.fillRect(8, 8, 16, 12);

        // Add wrinkles for Biden
        if (president.features === 'wrinkles') {
            this.ctx.strokeStyle = 'rgba(139, 90, 43, 0.4)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(9, 9);
            this.ctx.lineTo(23, 9);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(7, 14);
            this.ctx.lineTo(10, 14);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(22, 14);
            this.ctx.lineTo(25, 14);
            this.ctx.stroke();
        }

        // Eyes
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(10, 12, 3, 3);
        this.ctx.fillRect(19, 12, 3, 3);

        // Mouth
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(13, 17, 6, 1);

        // Suit
        this.ctx.fillStyle = president.suit;
        this.ctx.fillRect(6, 20, 20, 16);

        // Shirt
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(14, 22, 4, 8);

        // Tie
        this.ctx.fillStyle = president.tie;
        this.ctx.fillRect(14, 24, 4, 10);

        // Arms
        this.ctx.fillStyle = president.suit;
        this.ctx.fillRect(2, 22, 4, 10);
        this.ctx.fillRect(26, 22, 4, 10);

        // Hands
        this.ctx.fillStyle = president.face;
        this.ctx.fillRect(2, 30, 4, 4);
        this.ctx.fillRect(26, 30, 4, 4);

        // Legs
        this.ctx.fillStyle = president.suit;
        this.ctx.fillRect(10, 36, 5, 12);
        this.ctx.fillRect(17, 36, 5, 12);

        // Shoes
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(9, 46, 6, 4);
        this.ctx.fillRect(17, 46, 6, 4);

        this.ctx.restore();
    }

    drawStartScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 48px "Courier New"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('WHITE HOUSE RUNNER', CONFIG.canvas.width / 2, 150);

        // Level indicator
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = 'bold 36px "Courier New"';
        this.ctx.fillText(`LEVEL ${this.currentLevel}`, CONFIG.canvas.width / 2, 220);

        // Level description
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 20px "Courier New"';
        let levelDesc = '';
        switch(this.currentLevel) {
            case 1:
                levelDesc = 'Outside the White House';
                break;
            case 2:
                levelDesc = 'Inside the White House';
                break;
            case 3:
                levelDesc = 'Reach the Eagle in the Oval Office';
                break;
        }
        this.ctx.fillText(levelDesc, CONFIG.canvas.width / 2, 260);

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 24px "Courier New"';
        this.ctx.fillText(`${this.selectedCharacter.name}`, CONFIG.canvas.width / 2, 320);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 20px "Courier New"';
        this.ctx.fillText('Press SPACE to Start', CONFIG.canvas.width / 2, 400);

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '18px "Courier New"';
        this.ctx.fillText('Collect stars and avoid enemies!', CONFIG.canvas.width / 2, 460);
        this.ctx.fillText(`Score: ${this.score}`, CONFIG.canvas.width / 2, 490);

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
    constructor(x, y, character) {
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
        this.character = character || PRESIDENTS[1]; // Default to Trump if not specified
        this.flashTimer = 0; // For flash effect when collecting stars
        this.damageFlashTimer = 0; // For red flash effect when taking damage
    }

    flash() {
        this.flashTimer = CONFIG.star.flashDuration;
    }

    damageFlash() {
        this.damageFlashTimer = 30; // Flash for 0.5 seconds at 60fps
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

        // Update flash timers
        if (this.flashTimer > 0) {
            this.flashTimer--;
        }
        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer--;
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
        // Draw 8-bit president character
        ctx.save();

        // Apply damage flash effect if active (red flash with red tint)
        if (this.damageFlashTimer > 0) {
            ctx.shadowColor = '#FF0000';
            ctx.shadowBlur = 25;
            // Add red tint overlay
            if (Math.floor(this.damageFlashTimer / 3) % 2 === 0) {
                ctx.globalCompositeOperation = 'lighter';
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            }
        }
        // Apply collection flash effect if active (gold flash)
        else if (this.flashTimer > 0 && Math.floor(this.flashTimer / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15;
        }

        // Flip context if facing left
        if (this.direction === -1) {
            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(this.x, this.y);
        }

        // Draw red flash background when taking damage
        if (this.damageFlashTimer > 0 && Math.floor(this.damageFlashTimer / 3) % 2 === 0) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
            ctx.fillRect(-2, -2, this.width + 4, this.height + 4);
        }

        // Hair with special styling
        ctx.fillStyle = this.character.hair;
        if (this.character.features === 'distinctive-hair') {
            // Trump's distinctive hair style - swept back
            ctx.fillRect(2, 2, 28, 7);
            ctx.fillRect(0, 3, 4, 5);
            // Hair swoosh
            ctx.fillRect(22, 1, 8, 3);
        } else {
            // Normal hair
            ctx.fillRect(4, 2, 24, 8);
            ctx.fillRect(0, 4, 6, 6);
        }

        // Face
        ctx.fillStyle = this.character.face;
        ctx.fillRect(8, 8, 16, 12);

        // Add wrinkles for Biden
        if (this.character.features === 'wrinkles') {
            ctx.strokeStyle = 'rgba(139, 90, 43, 0.4)';
            ctx.lineWidth = 1;
            // Forehead wrinkles
            ctx.beginPath();
            ctx.moveTo(9, 9);
            ctx.lineTo(23, 9);
            ctx.stroke();
            // Eye wrinkles
            ctx.beginPath();
            ctx.moveTo(7, 14);
            ctx.lineTo(10, 14);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(22, 14);
            ctx.lineTo(25, 14);
            ctx.stroke();
        }

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(10, 12, 3, 3);
        ctx.fillRect(19, 12, 3, 3);

        // Add smile/mouth for more character
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(13, 17, 6, 1);

        // Suit
        ctx.fillStyle = this.character.suit;
        ctx.fillRect(6, 20, 20, 16);

        // Shirt (white)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(14, 22, 4, 8);

        // Tie
        ctx.fillStyle = this.character.tie;
        ctx.fillRect(14, 24, 4, 10);

        // Arms
        ctx.fillStyle = this.character.suit;
        ctx.fillRect(2, 22, 4, 10);
        ctx.fillRect(26, 22, 4, 10);

        // Hands
        ctx.fillStyle = this.character.face;
        ctx.fillRect(2, 30, 4, 4);
        ctx.fillRect(26, 30, 4, 4);

        // Legs
        ctx.fillStyle = this.character.suit;
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
    constructor(x, y, minX, maxX, type = 'security') {
        this.x = x;
        this.y = y;
        this.width = CONFIG.enemy.width;
        this.height = CONFIG.enemy.height;
        this.minX = minX;
        this.maxX = maxX;
        this.type = type;

        // Speed varies by type
        switch(type) {
            case 'security':
                this.speed = CONFIG.enemy.speed;
                break;
            case 'reporter':
                this.speed = CONFIG.enemy.speed * 1.2;
                break;
            case 'elite':
                this.speed = CONFIG.enemy.speed * 1.5;
                break;
            default:
                this.speed = CONFIG.enemy.speed;
        }

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

        let suitColor, hairColor, accessory;

        switch(this.type) {
            case 'security':
                suitColor = '#1E3A8A'; // Dark blue
                hairColor = '#4B3621'; // Brown
                accessory = 'badge';
                break;
            case 'reporter':
                suitColor = '#696969'; // Gray
                hairColor = '#8B4513'; // Saddle brown
                accessory = 'mic';
                break;
            case 'elite':
                suitColor = '#000000'; // Black
                hairColor = '#2F4F4F'; // Dark slate
                accessory = 'sunglasses';
                break;
        }

        // Head
        ctx.fillStyle = '#FFD4A3';
        ctx.fillRect(8, 2, 16, 12);

        // Hair
        ctx.fillStyle = hairColor;
        ctx.fillRect(8, 0, 16, 4);

        // Eyes or sunglasses
        if (accessory === 'sunglasses') {
            ctx.fillStyle = '#000000';
            ctx.fillRect(9, 6, 6, 4);
            ctx.fillRect(18, 6, 6, 4);
        } else {
            ctx.fillStyle = '#000000';
            ctx.fillRect(10, 6, 3, 3);
            ctx.fillRect(19, 6, 3, 3);
        }

        // Body (suit)
        ctx.fillStyle = suitColor;
        ctx.fillRect(6, 14, 20, 18);

        // Accessory
        if (accessory === 'badge') {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(10, 18, 4, 4);
        } else if (accessory === 'mic') {
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(4, 18, 3, 8);
        }

        // Arms
        ctx.fillStyle = suitColor;
        ctx.fillRect(2, 16, 4, 12);
        ctx.fillRect(26, 16, 4, 12);

        // Legs
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
    constructor(x, y, width, height, color, type = 'bush') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.type = type;
    }

    draw(ctx) {
        ctx.save();

        switch(this.type) {
            case 'gate':
                // Metal gate
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);

                // Gate bars
                ctx.fillStyle = '#696969';
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(this.x + 5 + i * 12, this.y, 6, this.height);
                }

                // Gate top
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(this.x, this.y, this.width, 8);
                break;

            case 'plant':
                // Potted plant
                // Pot
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(this.x + 8, this.y + 25, 24, 15);

                // Plant
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
                break;

            case 'trophy':
                // Trophy
                // Cup
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x + 10, this.y, 20, 25);

                // Handles
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.x + 5, this.y + 10, 5, 0, Math.PI);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(this.x + 35, this.y + 10, 5, 0, Math.PI);
                ctx.stroke();

                // Base
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x + 15, this.y + 25, 10, 5);
                ctx.fillRect(this.x + 8, this.y + 30, 24, 10);
                break;

            default: // bush
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x + 10, this.y + 10, 12, 0, Math.PI * 2);
                ctx.arc(this.x + 30, this.y + 10, 12, 0, Math.PI * 2);
                ctx.arc(this.x + 20, this.y, 12, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#1a6b1a';
                ctx.beginPath();
                ctx.arc(this.x + 15, this.y + 15, 6, 0, Math.PI * 2);
                ctx.arc(this.x + 25, this.y + 15, 6, 0, Math.PI * 2);
                ctx.fill();
                break;
        }

        ctx.restore();
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
    playerSpeed: 7,
    jumpForce: 15,
    gravity: 0.8,
    maxFallSpeed: 13,
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
