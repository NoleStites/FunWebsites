
let gameBox = document.getElementById("gameBox");
let gameCanvas = document.getElementById("gameCanvas");
gameCanvas.width = gameBox.offsetWidth;
gameCanvas.height = gameBox.offsetHeight;

var ctx = gameCanvas.getContext("2d");
// var pixelSize = 50;
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
var prevSnakeHeading = snakeHeading;
var snakeSegments = [[snakeHeadX,snakeHeadY-1,2], [snakeHeadX,snakeHeadY-2,7]]; // Order: neck -> tail. Format: [x,y,segment_type 1-14]. 

var appleX = 0;
var appleY = 0;

_clearGrid();
_drawGrid();
spawnApple();

// Spawns a new apple randomly on the board (excludes snake tiles)
// Returns 0 if apple spawned
// Returns 1 if no space for apple to spawn (player won)
function spawnApple()
{
    // Create list of all coordinates
    let valid_tiles = [];
    for (let i = 0; i < gameWidth; i++)
    {
        for (let j = 0; j < gameHeight; j++)
        {
            valid_tiles.push(`${i},${j}`);
        }
    }

    // Remove invalid tiles
    let index = valid_tiles.indexOf(`${snakeHeadX},${snakeHeadY}`);
    if (index > -1) valid_tiles.splice(index, 1);
    for (const segment of snakeSegments) {
        index = valid_tiles.indexOf(`${segment[0]},${segment[1]}`);
        if (index > -1) valid_tiles.splice(index, 1);
    }

    // Verify that there are valid tiles
    if (valid_tiles.length == 0) return 1;

    // Choose a random tile from what is left
    let rand_index = randIntBetween(0, valid_tiles.length-1);

    // Draw apple
    let coord = valid_tiles[rand_index].split(',');
    drawSegment(Number(coord[0]), Number(coord[1]), 15); // 15: of type 'apple'

    appleX = Number(coord[0]);
    appleY = Number(coord[1]);

    return 0;
}

// Draw initial snake
drawSegment(snakeHeadX, snakeHeadY, 13);
for (const segment of snakeSegments) {
    drawSegment(segment[0], segment[1], segment[2])
}

// Draws the specified type of segment at the given coordinate.
// Segment types can be a numeric value from 1-15 for the following:
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
// 15: apple
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
    let apple_padding = pixelSize/6; // Same as head_padding but unique

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
        case 15:
            ctx.arc(x + pixelSize/2, y + pixelSize/2, pixelSize/2 - apple_padding, 0, 2 * Math.PI); 
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.fillStyle = "green";
            break;
    }
    ctx.closePath();
}

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
    // Determine head and neck segment types
    let head_type = 0; // The segment type for the head
    let neck_type = 0; // The segment attached to the head; determined based on heading

    // Handle neck type based on whether snake turned or not
    if (snakeHeading == prevSnakeHeading) { // No turn
        switch(heading)
        {
            case "up":
                head_type = 11;
                neck_type = 2;
                break;
            case "left":
                head_type = 12;
                neck_type = 1;
                break;
            case "down":
                head_type = 13;
                neck_type = 2;
                break;
            case "right":
                head_type = 14;
                neck_type = 1;
                break;
        }
    } else { // Turn
        switch(heading)
        {
            case "up":
                head_type = 11;
                if (prevSnakeHeading == "right") {
                    neck_type = 3;
                } else if (prevSnakeHeading == "left") {
                    neck_type = 6;
                }
                break;
            case "left":
                head_type = 12;
                if (prevSnakeHeading == "up") {
                    neck_type = 4;
                } else if (prevSnakeHeading == "down") {
                    neck_type = 3;
                }
                break;
            case "down":
                head_type = 13;
                if (prevSnakeHeading == "right") {
                    neck_type = 4;
                } else if (prevSnakeHeading == "left") {
                    neck_type = 5;
                }
                break;
            case "right":
                head_type = 14;
                if (prevSnakeHeading == "up") {
                    neck_type = 5;
                } else if (prevSnakeHeading == "down") {
                    neck_type = 6;
                }
                break;
        }
    }

    // Draw the head and neck
    drawSegment(newHeadX, newHeadY, head_type); // Head
    drawSegment(prevSnakeHeadX, prevSnakeHeadY, neck_type); // Neck

    // Add neck to the segment list
    snakeSegments.splice(0, 0, [prevSnakeHeadX, prevSnakeHeadY, neck_type]);

    // Draw rest of body (minus last segment and future tail)
    let upper_bound_diff = 2;
    if (ateApple) upper_bound_diff = 1;
    for (let i = 0; i < snakeSegments.length - upper_bound_diff; i++) // Ignore last one and second-to-last one (which becomes the tail)
    {
        drawSegment(snakeSegments[i][0], snakeSegments[i][1], snakeSegments[i][2]);
    }

    // if (ateApple) return;

    // Draw tail
    let apple_diff = 0;
    if (ateApple) apple_diff = 1;

    let pre_tail_segment = snakeSegments.at(-2 + apple_diff); // The segment directly before the previous tail that will become the new tail
    let neighbor_segment = snakeSegments.at(-3 + apple_diff); // The segment adjacent to the pre_tail_segment
    let tail_type = 0; // The segment type for the tail
    
    // Determine tail direction based on location of neighboring segment
    if (neighbor_segment[1] > pre_tail_segment[1]) { // Tail going up
        tail_type = 7;
    } else if (neighbor_segment[0] > pre_tail_segment[0]) { // Tail going left
        tail_type = 8;
    } else if (neighbor_segment[1] < pre_tail_segment[1]) { // Tail going down
        tail_type = 9;
    } else { // Tail going right
        tail_type = 10
    }
    drawSegment(pre_tail_segment[0], pre_tail_segment[1], tail_type);  
    
    // Remove old tail from segment list
    if (!ateApple) snakeSegments.pop();

    return;
}

// Draws the apple on the board
function _drawApple()
{
    drawSegment(appleX, appleY, 15);
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
    _drawApple();
}

// Returns a random rgb string value
function randomColor() {
    return `rgb(${randIntBetween(0, 255)}, ${randIntBetween(0, 255)}, ${randIntBetween(0, 255)})`;
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
    for (const segment of snakeSegments)
    {
        if((snakeHeadX + changeX == segment[0]) && (snakeHeadY + changeY == segment[1]))
        {
            endGame();
        }
    }

    // Determine if the snake ate an apple
    let ateApple = false;
    if (snakeHeadX + changeX == appleX && snakeHeadY + changeY == appleY)
    {
        ateApple = true;
    }

    // Move the snake
    prevSnakeHeadX = snakeHeadX;
    prevSnakeHeadY = snakeHeadY;
    snakeHeadX += changeX;
    snakeHeadY += changeY;
    updateBoard(heading, ateApple);
    prevSnakeHeading = snakeHeading;

    // Spawn new apple if necessary
    if (ateApple) spawnApple();
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
    // gameIntervalID = setInterval(generateGameTick, 500);
    gameIntervalID = setInterval(generateGameTick, 200);
}
