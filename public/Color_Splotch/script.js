// TODO
// - Add and remove custom color splotches
// - Add an animate button that starts slowly changing the color center coords and rgb values 
//   so that points slowly move around and change color

// Import CSS vars
const root = document.documentElement;
const styles = getComputedStyle(root);

// Default configurations
var resX = 30;
var resY = 30;
var blendFactor = 5; // High: less blend; Low: more blend
var numOfSplotches = 3;

document.getElementById("resInputX").value = resX;
document.getElementById("resInputY").value = resY;
document.getElementById("blendInput").value = blendFactor;
document.getElementById("splotchCount").value = numOfSplotches;

// Global vars
var pixelSizeX;
var pixelSizeY;
var maxDist; // maximum distance allowed in the canvas (used for weight calculations)
var isDragging = false;
var selectedSplotch;
var selectedCoordDisplay;
var centerIsSelected = false;
var inputIsSelected = false;

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

function disableCheckmarks()
{
    let checkmarks = document.getElementsByClassName("check");
    hideMover();
    for (let i = 0; i < checkmarks.length; i++) {
        checkmarks[i].checked = false;
    };
    centerIsSelected = false;
}

// Used when a checkbox is checked
function toggleCheckmarks(clickedCheckmark)
{
    let checkmarks = document.getElementsByClassName("check");
    let alreadyChecked = clickedCheckmark.checked;
    hideMover();

    if (centerIsSelected) {
        for (let i = 0; i < checkmarks.length; i++) {
            checkmarks[i].checked = false;
        };
        if (!alreadyChecked) {
            clickedCheckmark.checked = true;
            showMover(selectedSplotch);
        } else {
            centerIsSelected = false;
        }
    }
    else {
        centerIsSelected = true;
        clickedCheckmark.checked = true;
        showMover(selectedSplotch);
    }
}

// Create an HTML center (a point and an rgb) and append it to the point list
function createHTMLColorCenter(splotch)
{
    let centerList = document.getElementById("centerList");

    let div = document.createElement("div");
    let span = document.createElement("span");
    let input = document.createElement("input");
    let label = document.createElement("label");

    // Make the checkbox
    let checkbox = input.cloneNode();
    checkbox.classList.add("check");
    checkbox.id = `${splotch.x}-${splotch.y}-check`;
    checkbox.type = "checkbox";

    let center = div.cloneNode();
    center.classList.add("centerBox");
    center.addEventListener("click", (e) => {
        selectedSplotch = splotch;
        selectedCoordDisplay = center;
        toggleCheckmarks(checkbox);
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
    inputX.classList.add("inputX");
    inputX.type = "number";
    inputX.min = 0;
    inputX.max = resX-1;
    inputX.value = splotch.x;
    inputX.addEventListener("input", (e) => {
        if (e.target.value > resX-1) {e.target.value = resX-1;}
        if (e.target.value < 0) {e.target.value = 0;}
        splotch.x = e.target.value;
        colorify(splotches);
    });

    let inputY = input.cloneNode();
    inputY.id = `${splotch.x}-${splotch.y}-y`;
    inputY.classList.add("inputY");
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

    center.appendChild(checkbox);
    center.appendChild(colorPreview);
    center.appendChild(point);

    centerList.appendChild(center);
}

// Shows the mover square after moving it to the coords of the given splotch (color center coord)
function showMover(splotch)
{
    mover.style.left = splotch.x * parseInt(mover.style.width) + "px";
    mover.style.top = splotch.y * parseInt(mover.style.height) + "px";
    mover.style.display = "block";
}

// Hides the mover
function hideMover()
{
    mover.style.display = "none";
}

// Event Listeners
document.getElementById("resInputX").addEventListener("change", (e) => {
    let newResX = e.target.value;
    if (newResX > 100) {e.target.value = e.target.max;}
    if (newResX < 2) {e.target.value = e.target.min;}

    updateCanvasResolution(newResX, resY);
    splotches = generateRandomSplotches(numOfSplotches);
    disableCheckmarks();
    colorify(splotches);
});

document.getElementById("resInputY").addEventListener("change", (e) => {
    let newResY = e.target.value;
    updateCanvasResolution(resX, newResY);
    splotches = generateRandomSplotches(numOfSplotches);
    disableCheckmarks();
    colorify(splotches);
});

document.getElementById("blendInput").addEventListener("change", (e) => {
    blendFactor = e.target.value;
    colorify(splotches);
});

document.getElementById("randomizeBtn").addEventListener("click", () => {
    splotches = generateRandomSplotches(numOfSplotches);
    disableCheckmarks();
    colorify(splotches);
});

document.getElementById("splotchCount").addEventListener("input", (e) => {
    numOfSplotches = e.target.value;
});

mover.addEventListener("mousedown", () => {
    isDragging = true;
});

mover.addEventListener("touchstart", (e) => {
    isDragging = true;
    if (e.cancelable) e.preventDefault();
}, { passive: false });

window.addEventListener("mouseup", () => {
    isDragging = false;
});

window.addEventListener("touchend", () => {
    isDragging = false;
});

let currCoord = "0,0";

function handleMove(clientX, clientY) {
    if (!isDragging) {return;}
    let rect = canvasMask.getBoundingClientRect();

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    let coordX = Math.floor(x / pixelSizeX) * pixelSizeX;
    let coordY = Math.floor(y / pixelSizeY) * pixelSizeY;

    if (`${coordX},${coordY}` == currCoord) {return;}

    selectedSplotch.x = coordX / (rect.width / resX);
    selectedSplotch.y = coordY / (rect.height / resY);
    colorify(splotches);

    currCoord = `${coordX},${coordY}`;
    mover.style.left = coordX + "px";
    mover.style.top = coordY + "px";
    
    selectedCoordDisplay.children[2].children[1].value = Math.round(selectedSplotch.x);
    selectedCoordDisplay.children[2].children[3].value = Math.round(selectedSplotch.y);
}

canvasMask.addEventListener("mousemove", (e) => {
    handleMove(e.clientX, e.clientY);
});

canvasMask.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
    if (e.cancelable) e.preventDefault();
}, { passive: false });