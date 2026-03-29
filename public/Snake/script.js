let gameBox = document.getElementById("gameBox");
let gameCanvas = document.getElementById("gameCanvas");
gameCanvas.width = gameBox.offsetWidth;
gameCanvas.height = gameBox.offsetHeight;

var ctx = gameCanvas.getContext("2d");
var pixelSize = 50;
var gameWidth = Math.floor(gameCanvas.width / pixelSize);
var gameHeight = Math.floor(gameCanvas.height / pixelSize);
gameCanvas.width = pixelSize * gameWidth;
gameCanvas.height = pixelSize * gameHeight;

var gameIntervalID;

var snakeHeadX = Math.floor(gameWidth/2);
var snakeHeadY = Math.floor(gameHeight/2);
var prevSnakeHeadX, prevSnakeHeadY;
var snakeHeading = "down";
var snakeSegments = [[snakeHeadX,snakeHeadY-1,7]]; // Order: neck -> tail. Format: [x,y,segment_type 1-14]. 

_clearGrid();
_drawGrid();

// Draw initial snake
drawSegment(snakeHeadX, snakeHeadY, 13);
// drawSegment(snakeSegments[0][0], snakeSegments[0][1], snakeSegments[0][2]);

// Draws the specified type of segment at the given coordinate.
// Segment types can be a numeric value from 1-14 for the following:
// 1: left-right (horizontal)
// 2: up-down (vertical)
// 3: up-to-left
// 4: left-to-down
// 5: down-to-right
// 6: right-to-up
// 7: tail-at-up
// 8: tail-at-left
// 9: tail-at-down
// 10: tail-at-right
// 11: head-going-up
// 12: head-going-left
// 13: head-going-down
// 14: head-going-right
function drawSegment(x, y, type)
{
    x *= pixelSize; // scale-up x
    y *= pixelSize; // scale-up y
    ctx.fillStyle = "green";
    ctx.strokeStyle = "green";
    let thickness = pixelSize*0.5; // Segment thickness
    ctx.lineWidth = thickness;
    let tail_length = pixelSize*0.5; // Length of tail before it starts curving
    let head_padding = pixelSize/10; // Decrease head radius by this padding so it doesnt butt-up against the pizel border

    ctx.beginPath();
    switch(type)
    {
        case 1:
            ctx.fillRect(x, y + pixelSize/2 - thickness/2, pixelSize, thickness);
            break;
        case 2:
            ctx.fillRect(x + pixelSize/2 - thickness/2, y, thickness, pixelSize);
            break;
        case 3:
            ctx.beginPath();
            ctx.moveTo(x+pixelSize/2, y);
            ctx.arcTo(x+pixelSize/2, y+pixelSize/2, x, y+pixelSize/2, pixelSize/2);
            ctx.stroke();
            break;
        case 4:
            ctx.beginPath();
            ctx.moveTo(x, y+pixelSize/2);
            ctx.arcTo(x+pixelSize/2, y+pixelSize/2, x+pixelSize/2, y+pixelSize, pixelSize/2);
            ctx.stroke();
            break;
        case 5:
            ctx.beginPath();
            ctx.moveTo(x+pixelSize/2, y+pixelSize);
            ctx.arcTo(x+pixelSize/2, y+pixelSize/2, x+pixelSize, y+pixelSize/2, pixelSize/2);
            ctx.stroke();
            break;
        case 6:
            ctx.beginPath();
            ctx.moveTo(x+pixelSize, y+pixelSize/2);
            ctx.arcTo(x+pixelSize/2, y+pixelSize/2, x+pixelSize/2, y, pixelSize/2);
            ctx.stroke();
            break;
        case 7:
            ctx.fillRect(x + pixelSize/2 - thickness/2, y+pixelSize-tail_length, thickness, tail_length);
            ctx.arc(x + pixelSize/2, y+pixelSize-tail_length, thickness/2, 0, 2 * Math.PI); 
            ctx.fill();
            break;
        case 8:ctx.fillRect(x+pixelSize-tail_length, y + pixelSize/2 - thickness/2, tail_length, thickness);
            ctx.arc(x+pixelSize-tail_length, y+pixelSize/2, thickness/2, 0, 2 * Math.PI); 
            ctx.fill();
            ctx.fillRect(x+pixelSize-tail_length, y + pixelSize/2 - thickness/2, tail_length, thickness);
            ctx.arc(x+pixelSize-tail_length, y+pixelSize/2, thickness/2, 0, 2 * Math.PI); 
            ctx.fill();
            break;
        case 9:
            ctx.fillRect(x + pixelSize/2 - thickness/2, y, thickness, tail_length);
            ctx.arc(x + pixelSize/2, y+tail_length, thickness/2, 0, 2 * Math.PI); 
            ctx.fill();
            break;
        case 10:
            ctx.fillRect(x, y + pixelSize/2 - thickness/2, tail_length, thickness);
            ctx.arc(x+tail_length, y+pixelSize/2, thickness/2, 0, 2 * Math.PI); 
            ctx.fill();
            break;
        case 11:
            ctx.arc(x + pixelSize/2, y + pixelSize/2, pixelSize/2 - head_padding, 0, 2 * Math.PI); 
            ctx.fill();
            ctx.fillRect(x + pixelSize/2 - thickness/2, y+pixelSize/2, thickness, pixelSize/2);
            break;
        case 12:
            ctx.arc(x + pixelSize/2, y + pixelSize/2, pixelSize/2 - head_padding, 0, 2 * Math.PI); 
            ctx.fill();
            ctx.fillRect(x+pixelSize/2, y + pixelSize/2 - thickness/2, pixelSize/2, thickness);
            break;
        case 13:
            ctx.arc(x + pixelSize/2, y + pixelSize/2, pixelSize/2 - head_padding, 0, 2 * Math.PI); 
            ctx.fill();
            ctx.fillRect(x + pixelSize/2 - thickness/2, y, thickness, pixelSize/2);
            break;
        case 14:
            ctx.arc(x + pixelSize/2, y + pixelSize/2, pixelSize/2 - head_padding, 0, 2 * Math.PI); 
            ctx.fill();
            ctx.fillRect(x, y + pixelSize/2 - thickness/2, pixelSize/2, thickness);
            break;
    }
    ctx.closePath();
}

// TODO:
// - Make a list of pivot coordinates and headings containing the following structures: (x, y, heading), 
//   that is, where was the snake when it changed direction and what direction did it go in
// - Make the snake body take up less space than the grid so that, when snake turns and starts slithering next to itself, the body
//   parts dont appear merged into a big blob
// - Give the snake a round head, perhaps
// - Create a game loop that causes the snake to be forever moving
// - Make the keyboard input change the snakes direction (heading)

// Turn the snake based off of keyboard input
document.addEventListener("keypress", function(e) {
    // Check direction of movement based on the key pressed
    switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
            handleMovementUp();
            break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
            handleMovementLeft();
            break;
        case 's':
        case 'S':
        case 'ArrowDown':
            handleMovementDown();
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            handleMovementRight();
            break;
    }
});

// Movement functions
function handleMovementUp()
{
    if (snakeHeading == "left" || snakeHeading == "right")
    {
        snakeHeading = "up";
    }
}

function handleMovementLeft()
{
    if (snakeHeading == "up" || snakeHeading == "down")
    {
        snakeHeading = "left";
    }
}

function handleMovementDown()
{
    if (snakeHeading == "left" || snakeHeading == "right")
    {
        snakeHeading = "down";
    }
}

function handleMovementRight()
{
    if (snakeHeading == "up" || snakeHeading == "down")
    {
        snakeHeading = "right";
    }
}

// Clears the grid of all color
function _clearGrid()
{
    ctx.clearRect(0, 0, pixelSize*gameWidth, pixelSize*gameHeight);
}

// Draws the grid lines of the game board
function _drawGrid()
{
    // ctx.fillStyle = "red";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    for (let i = 0; i < gameWidth; i++)
    {
        for (let j = 0; j < gameHeight; j++)
        {
            // ctx.fillStyle = randomColor();
            // ctx.fillRect(i*pixelSize, j*pixelSize, pixelSize, pixelSize);
            ctx.strokeRect(i*pixelSize, j*pixelSize, pixelSize, pixelSize);
        }
    }
}

// Draws the snake on the game board at the given location
function _drawSnake(newHeadX, newHeadY, heading, ateApple)
{
    // Draw head
    switch(heading)
    {
        case "up":
            drawSegment(newHeadX, newHeadY, 11);
            break;
        case "left":
            drawSegment(newHeadX, newHeadY, 12);
            break;
        case "down":
            drawSegment(newHeadX, newHeadY, 13);
            break;
        case "right":
            drawSegment(newHeadX, newHeadY, 14);
            break;
    }
    // Draw neck

    // Draw rest of body (minus last segment)
    
    return;
}

// Returns a random integer between two given values (inclusive)
function randIntBetween(a, b) {
    return (Math.floor(Math.random() * b) + a);
}

// Updates the game board by redrawing everything
function updateBoard(heading, ateApple)
{
    _clearGrid();
    _drawGrid();
    _drawSnake(snakeHeadX, snakeHeadY, heading, ateApple);
}

// Returns a random rgb string value
function randomColor() {
    return `rgb(${randIntBetween(0, 255)}, ${randIntBetween(0, 255)}, ${randIntBetween(0, 255)})`;
}

// Gives the snake another segment afetr eating an apple
function eatApple()
{
    return;
}

// The top-level to run every game tick responsible for all game actions
function generateGameTick()
{
    // Fetch current heading
    let heading = snakeHeading;
    let changeX, changeY = 0;

    // Assuming +x is right and +y is down
    switch (heading)
    {
        case "up":
            changeX = 0;
            changeY = -1;
            break;
        case "left":
            changeX = -1;
            changeY = 0;
            break;
        case "down":
            changeX = 0;
            changeY = 1;
            break;
        case "right":
            changeX = 1;
            changeY = 0;
            break;
    }

    // Check if snake is moving out of bounds
    if (snakeHeadX + changeX > gameWidth-1 || snakeHeadX + changeX < 0 || snakeHeadY + changeY > gameHeight-1 || snakeHeadY + changeY < 0)
    {
        endGame();
    }

    // Check if snake collides with self
    // if()
    // {
        // endGame();
    // }

    // Determine if the snake ate an apple
    let ateApple = false;
    // if ()
    // {
    //     ateApple = true;
    //     eatApple();
    // }

    // Move the snake
    prevSnakeHeadX = snakeHeadX;
    prevSnakeHeadY = snakeHeadY;
    snakeHeadX += changeX;
    snakeHeadY += changeY;
    updateBoard(heading, ateApple);

}

// Logic for terminating the game
function endGame()
{
    clearInterval(gameIntervalID);
    console.log("GAME OVER");
    return;
}

// Begins the game logic (and loop timer)
function startGameLoop()
{
    gameIntervalID = setInterval(generateGameTick, 500);
}
