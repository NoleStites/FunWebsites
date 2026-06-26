// TODO
// - Add and remove custom color splotches
// - Add an animate button that starts slowly changing the color center coords and rgb values 
//   so that points slowly move around and change color

// Import CSS vars
const root = document.documentElement;
const styles = getComputedStyle(root);
// let scaleX = parseInt(styles.getPropertyValue('--canvasSizeX'));
// let scaleY = parseInt(styles.getPropertyValue('--canvasSizeY'));

// Global vars
var resX = document.getElementById("resInputX").value; // resolution of canvas (x-direction)
var resY = document.getElementById("resInputY").value; // resolution of canvas (y-direction)
var pixelSizeX;
var pixelSizeY;
var maxDist; // maximum distance allowed in the canvas (used for weight calculations)
var numOfSplotches = document.getElementById("splotchCount").value;
var blendFactor = 1; // High: less blend; Low: more blend
var isDragging = false;
var selectedSplotch;

const splotchCanvas = document.getElementById("splotchCanvas");
const canvasMask = document.getElementById("canvasMask");
const mover = document.getElementById("mover");
updateCanvasResolution(resX, resY);
const ctx = splotchCanvas.getContext("2d");

// Generate random coords for splotches
class Splotch {
    constructor(x, y, r, g, b) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

// Generate and draw random color splotches
var splotches = generateRandomSplotches(numOfSplotches);
colorify(splotches);

// Populates the canvas with color based on the given color splotches
function colorify(splotches)
{
    let splotchList = Object.values(splotches);

    // Loop through all coordinates
    for (let x = 0; x < resX; x++) {
        for (let y = 0; y < resY; y++) {
            // Calculate weight of each splotch based on distance from current point to the splotch
            let weights = [];
            let weightSum = 0;
            splotchList.forEach(splotch => {
                let weight = round3(maxDist - distance(x, y, splotch.x, splotch.y));
                weight = round3(Math.pow(weight, blendFactor));
                weights.push(weight);
                weightSum += weight;
            });

            // Calculate the weighted average of all splotch reds, greens, and blues
            let colorValues = []; // [r,b,g]
            for (let i = 0; i < 3; i++) {
                let sumOfTop = 0;
                for (let j = 0; j < splotchList.length; j++) {
                    switch (i) {
                        case 0:
                            sumOfTop += weights[j] * splotchList[j].r;
                            break;
                        case 1:
                            sumOfTop += weights[j] * splotchList[j].g;
                            break;
                        case 2:
                            sumOfTop += weights[j] * splotchList[j].b;
                            break;
                    }
                }
                let weightedAverage = sumOfTop / weightSum;
                colorValues.push(Math.round(weightedAverage));
            }
            ctx.fillStyle = `rgb(${colorValues[0]}, ${colorValues[1]}, ${colorValues[2]})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

// Rounds the given number to 3 decimal places
function round3(num)
{
    return Math.round(num * 1000) / 1000;
}

// Returns the distance between the two given points
function distance(x1, y1, x2, y2)
{
    return round3(Math.sqrt( Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2)) );
}

// Given a number of color splotches, will return a dictionary of Splotches
// with a random color and position
// Key (string): x,y
// Value: Splotch object
function generateRandomSplotches(count)
{
    if (count < 0) {return [];} // Don't allow negative count

    // Remove current colors from the HTML color list
    clearColorCenterList();

    let splotchesDict = {};
    for (let i = 0; i < count; i++) {
        let x = randIntBetween(0, resX);
        let y = randIntBetween(0, resY);
        let r = randIntBetween(0, 255);
        let g = randIntBetween(0, 255);
        let b = randIntBetween(0, 255);
        let newSplotch = new Splotch(x, y, r, g, b);
        splotchesDict[`${x},${y}`] = newSplotch;
        createHTMLColorCenter(newSplotch);
    }
    return splotchesDict;
}

// Returns a random integer between two given values (exclusive)
function randIntBetween(a, b) 
{
    return (Math.floor(Math.random() * b) + a);
}

// Changes the resolution of the color splotch canvas to newSize x newSize
function updateCanvasResolution(newResX, newResY) 
{
    // Update canvas
    splotchCanvas.width = newResX;
    splotchCanvas.height = newResY;
    splotchCanvas.style.aspectRatio = `${newResX}/${newResY}`;
    canvasMask.style.aspectRatio = `${newResX}/${newResY}`;

    // Update mover size
    pixelSizeX = splotchCanvas.offsetWidth / newResX;
    pixelSizeY = splotchCanvas.offsetHeight / newResY;
    mover.style.width = Math.round(pixelSizeX) + "px";
    mover.style.height = Math.round(pixelSizeY) + "px";

    // Calculate max distance in canvas for future weight calculations using a^2 + b^2 = c^2
    maxDist = (Math.sqrt((resX*resX)+(resY*resY)));

    // Update global vars
    resX = newResX;
    resY = newResY;
}

// Clears all current points in the HTML color center list
function clearColorCenterList()
{
    let centerList = document.getElementById("centerList");
    centerList.innerHTML = "";
}

// Returns the RGB equivalent to a given hex color code
function hexToRgb(hex) {
  // Remove the hash if it exists
  hex = hex.replace('#', '');

  // Extract channels and parse to base-10 integers
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b };
}

// Create an HTML center (a point and an rgb) and append it to the point list
function createHTMLColorCenter(splotch)
{
    let centerList = document.getElementById("centerList");

    let div = document.createElement("div");
    let span = document.createElement("span");
    let input = document.createElement("input");
    let label = document.createElement("label");

    let center = div.cloneNode();
    center.classList.add("centerBox");
    center.addEventListener("click", () => {
        selectedSplotch = splotch;
        showMover(splotch);
    });

    // Make the color preview
    let colorPreview = input.cloneNode();
    colorPreview.type = "color";
    colorPreview.id = `${splotch.x}-${splotch.y}-color`;
    colorPreview.value = `rgb(${splotch.r},${splotch.g},${splotch.b})`;
    colorPreview.addEventListener("input", (e) => {
        let newRGB = hexToRgb(e.target.value);
        splotch.r = newRGB.r;
        splotch.g = newRGB.g;
        splotch.b = newRGB.b;
        colorify(splotches);
    });

    // Make the point
    let point = div.cloneNode();
    point.classList.add("point");
    point.classList.add("pill");

    let leftParen = span.cloneNode();
    leftParen.innerText = '(';
    let comma = span.cloneNode();
    comma.innerText = ',';
    let rightParen = span.cloneNode();
    rightParen.innerText = ')';

    let inputX = input.cloneNode();
    inputX.id = `${splotch.x}-${splotch.y}-x`;
    inputX.type = "number";
    inputX.min = 0;
    inputX.max = resX-1;
    inputX.value = splotch.x;
    inputX.addEventListener("input", (e) => {
        splotch.x = e.target.value;
        colorify(splotches);
    });

    let inputY = input.cloneNode();
    inputY.id = `${splotch.x}-${splotch.y}-y`;
    inputY.type = "number";
    inputY.min = 0;
    inputY.max = resY-1;
    inputY.value = splotch.y;
    inputY.addEventListener("input", (e) => {
        splotch.y = e.target.value;
        colorify(splotches);
    });

    // Put it all together
    point.appendChild(leftParen);
    point.appendChild(inputX);
    point.appendChild(comma.cloneNode(true));
    point.appendChild(inputY);
    point.appendChild(rightParen);

    center.appendChild(colorPreview);
    center.appendChild(point);

    centerList.appendChild(center);
}

// Hides the mover square
function hideMove()
{
    mover.style.display = "none";
}

// Shows the mover square after moving it to the coords of the given splotch (color center coord)
function showMover(splotch)
{
    mover.style.left = splotch.x * parseInt(mover.style.width) + "px";
    mover.style.top = splotch.y * parseInt(mover.style.height) + "px";
    mover.style.display = "block";
}

// Create an HTML center (a point and an rgb) and append it to the point list
// function createHTMLColorCenter(splotch)
// {
//     let centerList = document.getElementById("centerList");

//     let div = document.createElement("div");
//     let span = document.createElement("span");
//     let input = document.createElement("input");
//     let label = document.createElement("label");

//     let center = div.cloneNode();
//     center.classList.add("centerBox");

//     // Make the color preview
//     let colorPreview = div.cloneNode();
//     colorPreview.id = `${splotch.x}-${splotch.y}-color`;
//     colorPreview.classList.add("colorPreview");
//     colorPreview.style.backgroundColor = `rgb(${splotch.r},${splotch.g},${splotch.b})`;

//     // Make the point
//     let point = div.cloneNode();
//     point.classList.add("point");
//     point.classList.add("pill");

//     let leftParen = span.cloneNode();
//     leftParen.innerText = '(';
//     let comma = span.cloneNode();
//     comma.innerText = ',';
//     let rightParen = span.cloneNode();
//     rightParen.innerText = ')';

//     let inputX = input.cloneNode();
//     inputX.id = `${splotch.x}-${splotch.y}-x`;
//     inputX.type = "number";
//     inputX.min = 0;
//     inputX.max = resX-1;
//     inputX.value = splotch.x;
//     inputX.addEventListener("input", (e) => {
//         splotch.x = e.target.value;
//         colorify(splotches);
//     });

//     let inputY = input.cloneNode();
//     inputY.id = `${splotch.x}-${splotch.y}-y`;
//     inputY.type = "number";
//     inputY.min = 0;
//     inputY.max = resY-1;
//     inputY.value = splotch.y;
//     inputY.addEventListener("input", (e) => {
//         splotch.y = e.target.value;
//         colorify(splotches);
//     });

//     // Make the color
//     let color = div.cloneNode();
//     color.classList.add("colorValue");
//     color.classList.add("pill");

//     let rLabel = label.cloneNode();
//     rLabel.htmlFor = `${splotch.x}-${splotch.y}-r`;
//     rLabel.innerText = "red: ";
//     let rInput = input.cloneNode();
//     rInput.id = `${splotch.x}-${splotch.y}-r`;
//     rInput.type = "number";
//     rInput.min = 0;
//     rInput.max = 255;
//     rInput.value = splotch.r;
//     rInput.addEventListener("input", (e) => {
//         splotch.r = e.target.value;
//         colorPreview.style.backgroundColor = `rgb(${splotch.r},${splotch.g},${splotch.b})`;
//         colorify(splotches);
//     });

//     let gLabel = label.cloneNode();
//     gLabel.htmlFor = `${splotch.x}-${splotch.y}-g`;
//     gLabel.innerText = "green: ";
//     let gInput = input.cloneNode();
//     gInput.id = `${splotch.x}-${splotch.y}-g`;
//     gInput.type = "number";
//     gInput.min = 0;
//     gInput.max = 255;
//     gInput.value = splotch.g;
//     gInput.addEventListener("input", (e) => {
//         splotch.g = e.target.value;
//         colorPreview.style.backgroundColor = `rgb(${splotch.r},${splotch.g},${splotch.b})`;
//         colorify(splotches);
//     });

//     let bLabel = label.cloneNode();
//     bLabel.htmlFor = `${splotch.x}-${splotch.y}-b`;
//     bLabel.innerText = "blue: ";
//     let bInput = input.cloneNode();
//     bInput.id = `${splotch.x}-${splotch.y}-b`;
//     bInput.type = "number";
//     bInput.min = 0;
//     bInput.max = 255;
//     bInput.value = splotch.b;
//     bInput.addEventListener("input", (e) => {
//         splotch.b = e.target.value;
//         colorPreview.style.backgroundColor = `rgb(${splotch.r},${splotch.g},${splotch.b})`;
//         colorify(splotches);
//     });

//     // Put it all together
//     point.appendChild(leftParen);
//     point.appendChild(inputX);
//     point.appendChild(comma.cloneNode(true));
//     point.appendChild(inputY);
//     point.appendChild(rightParen);

//     color.appendChild(rLabel);
//     color.appendChild(rInput);
//     color.appendChild(comma.cloneNode(true));
//     color.appendChild(gLabel);
//     color.appendChild(gInput);
//     color.appendChild(comma.cloneNode(true));
//     color.appendChild(bLabel);
//     color.appendChild(bInput);

//     center.appendChild(colorPreview);
//     center.appendChild(point);
//     center.appendChild(color);

//     centerList.appendChild(center);
// }

// Event Listeners
document.getElementById("resInputX").addEventListener("change", (e) => {
    let newResX = e.target.value;
    updateCanvasResolution(newResX, resY);
    splotches = generateRandomSplotches(numOfSplotches);
    colorify(splotches);
});

document.getElementById("resInputY").addEventListener("change", (e) => {
    let newResY = e.target.value;
    updateCanvasResolution(resX, newResY);
    splotches = generateRandomSplotches(numOfSplotches);
    colorify(splotches);
});

document.getElementById("blendInput").addEventListener("change", (e) => {
    blendFactor = e.target.value;
    colorify(splotches);
});

document.getElementById("randomizeBtn").addEventListener("click", () => {
    splotches = generateRandomSplotches(numOfSplotches);
    colorify(splotches);
});

document.getElementById("splotchCount").addEventListener("input", (e) => {
    numOfSplotches = e.target.value;
});

mover.addEventListener("mousedown", () => {
    isDragging = true;
});

window.addEventListener("mouseup", () => {
    isDragging = false;
});

let currCoord = "0,0";
canvasMask.addEventListener("mousemove", (e) => {
    if (!isDragging) {return;}
    let rect = canvasMask.getBoundingClientRect();

    // Calculate relative positions
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let coordX = Math.floor(x / pixelSizeX) * pixelSizeX;
    let coordY = Math.floor(y / pixelSizeY) * pixelSizeY;

    if (`${coordX},${coordY}` == currCoord) {return;}

    // Update and redraw the color center
    selectedSplotch.x = coordX / resX / 4;
    selectedSplotch.y = coordY / resY / 4;
    colorify(splotches);

    // Move the mover
    currCoord = `${coordX},${coordY}`;
    mover.style.left = coordX + "px";
    mover.style.top = coordY + "px";
    
    // console.log(coordX / resX / 4, coordY / resY / 4);
});