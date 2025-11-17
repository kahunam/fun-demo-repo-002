# White House Runner

A fun, 2D side-scrolling platformer game featuring an 8-bit style character navigating through the White House Gardens to reach the White House entrance.

## Features

- **Classic platformer gameplay** - Mario-style jumping and running mechanics
- **8-bit pixel art graphics** - Retro aesthetic with hand-drawn pixel characters
- **Physics simulation** - Realistic gravity and jumping mechanics
- **Collectibles** - Gather gold stars for points throughout the level
- **Enemies** - Avoid patrolling security guards and obstacles
- **Lives system** - 3 lives to complete the challenge
- **Smooth camera** - Side-scrolling camera follows the player
- **Multiple sections** - Garden entrance, fountain courtyard, rose garden, and White House approach

## How to Play

### Controls
- **Arrow Keys (←/→)** - Move left and right
- **Spacebar** - Jump
- **R** - Restart game (after game over or win)

### Objective
Navigate from the left side of the level to the White House entrance on the right side while:
- Collecting gold stars (+10 points each)
- Avoiding enemies and obstacles
- Using platforms to traverse difficult sections
- Preserving your 3 lives

### Scoring
- **Star collection:** +10 points per star
- **Level completion:** +100 points
- **Lives remaining bonus:** +50 points per life

## Game Structure

### Level Sections
1. **Garden Entrance** - Tutorial area with basic platforming
2. **Fountain Courtyard** - Medium difficulty with more platforms
3. **Rose Garden** - Challenging platforming section
4. **White House Approach** - Final stretch to the goal

### Enemies
- Patrolling security guards move back and forth in set patterns
- Contact with enemies costs 1 life

### Obstacles
- Static bushes and hedges
- Contact with obstacles costs 1 life

## Running the Game

Simply open `index.html` in a modern web browser. No server or build process required!

```bash
# Open with your default browser
open index.html

# Or on Linux
xdg-open index.html

# Or on Windows
start index.html
```

## Technical Details

- **Technology:** Pure HTML5 Canvas, Vanilla JavaScript, CSS3
- **Resolution:** 800x600 pixels
- **Level Size:** 4000 pixels wide
- **Target Performance:** 60 FPS
- **No dependencies** - Works offline, no external libraries

## Development

The game is built with three main files:
- `index.html` - Game structure and canvas element
- `styles.css` - UI styling and layout
- `game.js` - All game logic, physics, and rendering

### Code Structure
- **Game Engine** - Main game loop and state management
- **Player Class** - Character physics and controls
- **Platform Class** - Collision surfaces
- **Star Class** - Collectible items
- **Enemy Class** - Patrolling opponents
- **Obstacle Class** - Static hazards

## Browser Compatibility

Works best in modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

Created for educational and entertainment purposes.
