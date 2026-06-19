// TODO
// - Randomize weights based on various factors (Lana was suggesting points on one side of a center might have
// a weaker weight than points on the other side)

// Import CSS vars
const root = document.documentElement;
const styles = getComputedStyle(root);
// let scaleX = parseInt(styles.getPropertyValue('--canvasSizeX'));
// let scaleY = parseInt(styles.getPropertyValue('--canvasSizeY'));

// Global vars
var resX = 25; // resolution of canvas (x-direction)
var resY = 25; // resolution of canvas (y-direction)
var maxDist; // maximum distance allowed in the canvas (used for weight calculations)
var numOfSplotches = 3;

const splotchCanvas = document.getElementById("splotchCanvas");
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
let splotches = generateRandomSplotches(numOfSplotches);

// let red = new Splotch(0,0,255,0,0);
// let green = new Splotch(resX/2,resY/2,0,255,0);
// let blue = new Splotch(resX-1,resY-1,0,0,255);
// let splotches = [red, green, blue];

// let p1 = new Splotch(0,0,10,10,10);
// let p2 = new Splotch(2,4,120,200,10);
// let p3 = new Splotch(4,1,50,40,30);
// let splotches = [p1,p2,p3];

// let red1 = new Splotch(0,0,255,0,0);
// let red2 = new Splotch(resX,0,255,0,0);
// let red3 = new Splotch(0,resY,255,0,0);
// let red4 = new Splotch(resX,resY,255,0,0);
// let blue = new Splotch(resX/2,resY/2,0,0,255);
// let splotches = [red1, red2, red3, red4, blue];

colorify(splotches);

// Populates the canvas with color based on the given color splotches
function colorify(splotches)
{
    // Loop through all coordinates
    for (let x = 0; x < resX; x++) {
        for (let y = 0; y < resY; y++) {
            // Calculate weight of each splotch based on distance from current point to the splotch
            let weights = [];
            let weightSum = 0;
            splotches.forEach(splotch => {
                let weight = round3(maxDist - distance(x, y, splotch.x, splotch.y));
                // weight *= Math.random();
                weights.push(weight);
                weightSum += weight;
            });

            // Calculate the weighted average of all splotch reds, greens, and blues
            let colorValues = []; // [r,b,g]
            for (let i = 0; i < 3; i++) {
                let sumOfTop = 0;
                for (let j = 0; j < splotches.length; j++) {
                    switch (i) {
                        case 0:
                            sumOfTop += weights[j] * splotches[j].r;
                            break;
                        case 1:
                            sumOfTop += weights[j] * splotches[j].g;
                            break;
                        case 2:
                            sumOfTop += weights[j] * splotches[j].b;
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

// Given a number of color splotches, will return a list of Splotches
// with a random color and position
function generateRandomSplotches(count)
{
    if (count < 0) {return [];} // Don't allow negative count

    let splotches = [];
    for (let i = 0; i < count; i++) {
        let x = randIntBetween(0, resX);
        let y = randIntBetween(0, resY);
        let r = randIntBetween(0, 255);
        let g = randIntBetween(0, 255);
        let b = randIntBetween(0, 255);
        splotches.push(new Splotch(x, y, r, g, b));
    }
    return splotches;
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

    // Calculate max distance in canvas for future weight calculations using a^2 + b^2 = c^2
    maxDist = (Math.sqrt((resX*resX)+(resY*resY)));

    // Update global vars
    resX = newResX;
    resY = newResY;
}