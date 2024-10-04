let planktonImg; // Image for plankton
let cloudImg; // Image for clouds
let chlorophylls = []; // Array for chlorophylls
let clouds = []; // Array for enemy clouds
let gameWon = false; // Track if the game is won
let playAgainButton; // Button to restart the game
let maze = [
  "###############",
  "#.............#",
  "#.###.###.###.#",
  "#.###.###.###.#",
  "#.............#",
  "#.###.#.#.###.#",
  "#.....#.#.....#",
  "###.#.#.#.#.###",
  "#...#.#.#.#...#",
  "#.###.###.###.#",
  "#.............#",
  "###############",
];

function preload() {
  // Load images
  planktonImg = loadImage("/Images/plankton.png");
  cloudImg = loadImage("/Images/cloud.png");
}

function setup() {
  createCanvas(800, 600); // Set a fixed canvas size
  plankton = new Plankton(1, 1);

  // Generate chlorophylls only in the empty spaces
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === ".") {
        chlorophylls.push(new Chlorophyll(x, y)); // Add chlorophylls at valid positions
      }
    }
  }

  clouds.push(new Cloud(6, 5));
  clouds.push(new Cloud(10, 5));

  // Create the play again button and style it
  playAgainButton = createButton("Play Again");
  playAgainButton.style("background-color", "black"); // Set button color to blue
  playAgainButton.style("color", "#FFFFFF"); // Set text color to white
  playAgainButton.style("border", "none"); // Remove border
  playAgainButton.style("padding", "10px 20px"); // Add padding
  playAgainButton.style("font-size", "16px"); // Increase font size
  playAgainButton.position(width / 2 - 60, height / 2 + 40); // Center the button horizontally
  playAgainButton.mousePressed(restartGame);
  playAgainButton.hide(); // Initially hidden
}

function draw() {
  // Make the maze background transparent
  clear(); // Clears the background without adding a solid color
  drawMaze();

  if (gameWon) {
    // Display winner message
    textSize(32);
    fill(255);
    textAlign(CENTER, CENTER);
    text("You Win!", width / 2, height / 2);
    playAgainButton.position(width / 2 - 60, height / 2 + 40); // Center the button
    playAgainButton.show(); // Show the Play Again button
    noLoop();
    return; // Stop the rest of the game logic
  }

  plankton.update();
  plankton.display();

  for (let chlorophyll of chlorophylls) {
    chlorophyll.display();
  }

  for (let cloud of clouds) {
    cloud.update();
    cloud.display();
    if (cloud.catches(plankton)) {
      gameOver();
    }
  }

  plankton.eat(chlorophylls);

  // Check if all chlorophyll has been eaten
  if (chlorophylls.length === 0) {
    gameWon = true;
  }
}

function drawMaze() {
  let size = width / maze[0].length;
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === "#") {
        fill(12, 132, 231); // Blue walls
        rect(x * size, y * size, size, size);
      }
    }
  }
}

class Plankton {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = width / maze[0].length;
    this.speed = 0.2; // Slower speed for plankton
    this.progress = 0;
    this.targetX = x;
    this.targetY = y;
  }

  update() {
    this.progress += this.speed;

    if (this.progress >= 1) {
      this.progress = 0;
      this.x = this.targetX;
      this.y = this.targetY;

      if (keyIsDown(LEFT_ARROW) && maze[this.y][this.x - 1] !== "#") {
        this.targetX--;
      }
      if (keyIsDown(RIGHT_ARROW) && maze[this.y][this.x + 1] !== "#") {
        this.targetX++;
      }
      if (keyIsDown(UP_ARROW) && maze[this.y - 1][this.x] !== "#") {
        this.targetY--;
      }
      if (keyIsDown(DOWN_ARROW) && maze[this.y + 1][this.x] !== "#") {
        this.targetY++;
      }
    }
  }

  display() {
    let dx = (this.targetX - this.x) * this.progress;
    let dy = (this.targetY - this.y) * this.progress;
    image(
      planktonImg,
      (this.x + dx) * this.size,
      (this.y + dy) * this.size,
      this.size,
      this.size
    ); // Draw plankton image
  }

  eat(chlorophylls) {
    for (let i = chlorophylls.length - 1; i >= 0; i--) {
      if (
        dist(this.targetX, this.targetY, chlorophylls[i].x, chlorophylls[i].y) <
        1
      ) {
        chlorophylls.splice(i, 1);
      }
    }
  }
}

class Chlorophyll {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = (width / maze[0].length) * 0.5; // Set the size based on the maze size
  }

  display() {
    fill(0, 255, 0); // Green color for chlorophyll
    ellipse(
      this.x * (width / maze[0].length) + width / maze[0].length / 2,
      this.y * (width / maze[0].length) + width / maze[0].length / 2,
      this.size
    ); // Draw chlorophyll as a green circle
  }
}

class Cloud {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = (width / maze[0].length) * 0.8;
    this.direction = 1;
    this.speed = 0.1; // Slower speed for clouds
    this.progress = 0;
  }

  update() {
    this.progress += this.speed;
    if (this.progress >= 1) {
      this.progress = 0;
      if (this.y === 1 || this.y === maze.length - 2) {
        this.direction *= -1;
      }
      this.y += this.direction;
    }
  }

  display() {
    image(
      cloudImg,
      (this.x * width) / maze[0].length,
      (this.y * width) / maze[0].length,
      this.size,
      this.size
    ); // Draw cloud image
  }

  catches(plankton) {
    return dist(this.x, this.y, plankton.x, plankton.y) < 1;
  }
}

function gameOver() {
  noLoop();
  textSize(32);
  fill(255);
  textAlign(CENTER, CENTER);
  text("Game Over", width / 2, height / 2);
  playAgainButton.position(width / 2 - 60, height / 2 + 40); // Center the button
  playAgainButton.show(); // Show the Play Again button
}

function restartGame() {
  gameWon = false;
  plankton = new Plankton(1, 1); // Reset plankton's position
  chlorophylls = []; // Reset chlorophylls

  // Recreate chlorophylls
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === ".") {
        chlorophylls.push(new Chlorophyll(x, y));
      }
    }
  }

  // Hide the play again button and restart the game loop
  playAgainButton.hide();
  loop();
}
