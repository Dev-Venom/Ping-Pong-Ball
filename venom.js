const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game Constants
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Paddle
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const PADDLE_MARGIN = 20;
const PLAYER_COLOR = "#4caf50";
const AI_COLOR = "#f44336";
const PADDLE_SPEED = 7;

// Ball
const BALL_SIZE = 15;
const BALL_COLOR = "#fff";
let ballX = CANVAS_WIDTH / 2 - BALL_SIZE / 2;
let ballY = CANVAS_HEIGHT / 2 - BALL_SIZE / 2;
let ballSpeedX = 6 * (Math.random() > 0.5 ? 1 : -1);
let ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);

// Player Paddle
let playerY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;

// AI Paddle
let aiY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;

// Mouse Control
canvas.addEventListener("mousemove", (evt) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = evt.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT / 2;
  // Clamp within canvas
  playerY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, playerY));
});

// Draw
function drawRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}
function drawBall(x, y, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
}

// Draw net
function drawNet() {
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 3;
  for (let i = 0; i < CANVAS_HEIGHT; i += 30) {
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, i);
    ctx.lineTo(CANVAS_WIDTH / 2, i + 16);
    ctx.stroke();
  }
}

// Collision detection
function ballCollidesWithPaddle(x, y, paddleX, paddleY) {
  return (
    x < paddleX + PADDLE_WIDTH &&
    x + BALL_SIZE > paddleX &&
    y < paddleY + PADDLE_HEIGHT &&
    y + BALL_SIZE > paddleY
  );
}

// AI logic: move towards ball with some limited speed
function moveAI() {
  const aiCenter = aiY + PADDLE_HEIGHT / 2;
  if (aiCenter < ballY + BALL_SIZE / 2 - 8) {
    aiY += PADDLE_SPEED * 0.85;
  } else if (aiCenter > ballY + BALL_SIZE / 2 + 8) {
    aiY -= PADDLE_SPEED * 0.85;
  }
  // Clamp AI paddle
  aiY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, aiY));
}

// Update game state
function update() {
  // Move ball
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Top & bottom wall collision
  if (ballY <= 0 || ballY + BALL_SIZE >= CANVAS_HEIGHT) {
    ballSpeedY *= -1;
    ballY = Math.max(0, Math.min(CANVAS_HEIGHT - BALL_SIZE, ballY));
  }

  // Player paddle collision
  if (
    ballCollidesWithPaddle(
      ballX, ballY,
      PADDLE_MARGIN, playerY
    )
  ) {
    ballX = PADDLE_MARGIN + PADDLE_WIDTH;
    ballSpeedX *= -1.05; // Slightly increase speed
    // Add some randomness to ball's Y velocity
    let deltaY = (ballY + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
    ballSpeedY = deltaY * 0.2 + (Math.random() - 0.5) * 3;
  }

  // AI paddle collision
  if (
    ballCollidesWithPaddle(
      ballX, ballY,
      CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, aiY
    )
  ) {
    ballX = CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH - BALL_SIZE;
    ballSpeedX *= -1.05;
    let deltaY = (ballY + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2);
    ballSpeedY = deltaY * 0.18 + (Math.random() - 0.5) * 2.5;
  }

  // Left or right wall (reset ball)
  if (ballX < 0 || ballX > CANVAS_WIDTH) {
    // Reset ball to center
    ballX = CANVAS_WIDTH / 2 - BALL_SIZE / 2;
    ballY = CANVAS_HEIGHT / 2 - BALL_SIZE / 2;
    // Start ball in a random direction
    ballSpeedX = 6 * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);
  }

  moveAI();
}

// Render everything
function render() {
  // Clear screen
  drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, "#222");
  drawNet();
  // Paddles
  drawRect(PADDLE_MARGIN, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, PLAYER_COLOR);
  drawRect(CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, AI_COLOR);
  // Ball
  drawBall(ballX, ballY, BALL_SIZE, BALL_COLOR);
}

// Game loop
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

gameLoop();