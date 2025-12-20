
const canvas = document.getElementById("hourglass");
let sandLocations = []; // Coordinates of each grain of sand in the canvas

startHourglass();


function startHourglass()
{
    if (!canvas.getContext) {
        console.error("HTML canvas is not supported by your browser!");
    }
    const ctx = canvas.getContext("2d");

    // Define the colors
    const background = [255, 255, 255];
    let notSand = [[0,0,0]]; 
    let sandShades = [[255,0,0], [251,238,172]]; 

    // Draw a blank canvas to allow for future pixel manipulation
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw a hard surface for sand to fall onto
    ctx.moveTo(0, Math.floor(canvas.height*0.75));
    ctx.lineTo(canvas.width, Math.floor(canvas.height*0.75));
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw a single grain of sand for testing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let x = Math.floor(canvas.width/2);
    let y = 0;
    sandLocations.push([x,y]);
    const pixel = (y * canvas.width + x) * 4;
    data[pixel] = sandShades[0][0];
    data[pixel+1] = sandShades[0][1];
    data[pixel+2] = sandShades[0][2];

    // Put the modified pixels back
    ctx.putImageData(imageData, 0, 0);

    for (let i = 0; i < 1; i++) {
        updateTick(ctx, canvas.width, canvas.height, sandShades, background);
    }
}

// Returns the index into the 'data' object for the given pixel coordinate
function getPixelOfCoordinate(x, y)
{
    return (y * canvas.width + x) * 4;
}

// Helper function to determine if an array contains another array
function arrayContainsArray(arr, item)
{
    const arrAsString = arr.map(JSON.stringify);
    const itemAsString = JSON.stringify(item);
    return arrAsString.includes(itemAsString);
}

// Call whenever you want to move to the next tick in time
// Coords go from 0 to (dimension-1)
function updateTick(ctx, width, height, sandShades, backgroundColor)
{
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Update grains of sand starting from bottom-right moving up
    // so that everything cascades down nicely
    // let numSandGrains = 0;
    // for (let i = data.length-4; i >= 0; i -= 4) {
    for (let i = 0; i < sandLocations.length; i++) {
        let x = sandLocations[i][0];
        let y = sandLocations[i][1];
        let color = getPixelOfCoordinate(x, y);
        console.log(color);

        // let color = [data[i], data[i+1], data[i+2]];
        // let x = (i % (width*4)) / 4;
        // let y = Math.floor(i / (width*4));

        // Dont update non-sand pixels
        // if (!arrayContainsArray(sandShades, color)) {
        //     continue;
        // }
        // numSandGrains++;

        
        // console.log(`(${x}, ${y})`);        <canvas id="hourglass" width="3" height="5"></canvas>


        // Case 1: pixel below is empty (not sand or solid)
        if (y < height - 1) {
            const belowPixel = getPixelOfCoordinate(x, y+1);
            let belowColor = [data[belowPixel], data[belowPixel+1], data[belowPixel+2]];
            if (belowColor == backgroundColor) { // Sand falls
                data[belowPixel] = color[0];
                data[belowPixel+1] = color[1];
                data[belowPixel+2] = color[2];

                // TODO: update sandLocation coordinate to be below the current position
            }
        }


        // let fallDirection = (ctx, width, height, x, y);
        // Base case: do not update non-sand pixels
        // if (color == (0,0,0) || color == (255,255,255)) {
        //     continue;
        // }

        // data[i] = 200;   // red
        // data[i + 1] = 0; // green
        // data[i + 2] = 0; // blue
        // alpha (data[i+3]) left unchanged
    }
    // console.log(`Amount of sand: ${numSandGrains}`);

    // Put the modified pixels back
    ctx.putImageData(imageData, 0, 0);
}

// Given the (x,y) coordinate of a grain of sand, will determine
// how it show fall by returning one of the following strings:
//      "down": should be moved to the pixel below
//      "left": should be moved to the pixel down-left
//      "right": should be moved to the pixel down-right
//      "leftRight": can go either down-left or down-right
//      "none": do not move (has nowhere to go)
function determineFallDirection(ctx, width, height, x, y)
{
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Fetch the three pixels below the current pixel
    const leftPixel_start = (y+1 * width + x-1) * 4;
    let leftPixel_rgb;
    leftPixel_rgb = (data[leftPixel_start], data[leftPixel_start+1], data[leftPixel_start+2]);
    

    const centerPixel_start = (y+1 * width + x) * 4;
    const centerPixel_rgb = (data[centerPixel_start], data[centerPixel_start+1], data[centerPixel_start+2]);
    
    const rightPixel_start = (y+1 * width + x+1) * 4;
    const rightPixel_rgb = (data[rightPixel_start], data[rightPixel_start+1], data[rightPixel_start+2]);


    let direction = "";

    if (centerPixel)

    data[leftPixel] = 255;
    data[leftPixel+1] = 0;
    data[leftPixel+2] = 0;

    data[centerPixel] = 0;
    data[centerPixel+1] = 255;
    data[centerPixel+2] = 0;

    data[rightPixel] = 0;
    data[rightPixel+1] = 0;
    data[rightPixel+2] = 255;

    // Put the modified pixels back
    ctx.putImageData(imageData, 0, 0);
}