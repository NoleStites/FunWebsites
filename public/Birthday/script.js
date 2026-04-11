// <!-- THIS FILE CONTAINS CODE RELATING TO OVERCOOKED -->

var resolution = 0;
var counter = 0; // times res btn has been clicked/tapped

let resCount = document.getElementById("resCount");

incrementResolution();

function incrementResolution()
{
    resolution += 1;
    resCount.innerText = `${counter}`;
    runPixelation(resolution);
    
    if (counter++ == 5) {
      let nextBtn = document.getElementById("nextBtn");
      nextBtn.style.transition = "2s opacity";
      nextBtn.style.opacity = "100%";
      nextBtn.style.pointerEvents = "all";
    }
}

function runPixelation(resolution) {
  const img = document.getElementById('sourceImage');
  const canvas = document.getElementById('outputCanvas');
  
  // Always check if the image is loaded
  if (img.complete) {
    // We want the image to be "crushed" down to 80 pixels wide
    pixelate(img, canvas, resolution);
  } else {
    img.onload = () => pixelate(img, canvas, resolution);
    let resBtn = document.getElementById("resBtn");
    resBtn.style.pointerEvents = "all";
  }
}


/**
 * Pixelates an image using area averaging.
 * @param {HTMLImageElement} img - The source image.
 * @param {HTMLCanvasElement} canvas - The target canvas.
 * @param {number} targetWidth - The desired pixelated width.
 */
function pixelate(img, canvas, targetWidth) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  // 1. Calculate dimensions
  const scaleFactor = img.width / targetWidth;
  const targetHeight = Math.floor(img.height / scaleFactor);
  
  canvas.width = img.width;
  canvas.height = img.height;

  // 2. Get original image data
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = img.width;
  tempCanvas.height = img.height;
  tempCtx.drawImage(img, 0, 0);
  const imgData = tempCtx.getImageData(0, 0, img.width, img.height).data;

  // 3. Loop through the "New" grid
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      
      // Calculate the bounds of the "big pixel" in the original image
      const startX = Math.floor(x * scaleFactor);
      const startY = Math.floor(y * scaleFactor);
      const endX = Math.floor((x + 1) * scaleFactor);
      const endY = Math.floor((y + 1) * scaleFactor);

      let r = 0, g = 0, b = 0, count = 0;

      // 4. Sum all pixels in the block
      for (let sy = startY; sy < endY; sy++) {
        for (let sx = startX; sx < endX; sx++) {
          const i = (sy * img.width + sx) * 4;
          r += imgData[i];
          g += imgData[i + 1];
          b += imgData[i + 2];
          count++;
        }
      }

      // 5. Calculate Average and Draw
      const avgR = r / count;
      const avgG = g / count;
      const avgB = b / count;

      ctx.fillStyle = `rgb(${avgR},${avgG},${avgB})`;
      ctx.fillRect(startX, startY, Math.ceil(scaleFactor), Math.ceil(scaleFactor));
    }
  }
}

function initiateNextGift()
{
  let canvas = document.getElementById("outputCanvas");
  let resBtn = document.getElementById("resBtn");
  let nextBtn = document.getElementById("nextBtn");
  let resCount = document.getElementById("resCount");

  canvas.style.opacity = "0%";
  resBtn.style.pointerEvents = "none";
  resBtn.style.opacity = "0%";
  nextBtn.style.opacity = "0%";
  resCount.style.opacity = "0%";

  let mask = document.getElementById("mask");
  mask.style.display = "flex";
  setTimeout(() => {
    mask.style.opacity = "100%";
    displayLink();
  }, 2000);
}

function displayLink()
{
  let twiBtn = document.getElementById("twilightBtn");
  setTimeout(() => {
    twiBtn.style.opacity = "100%";
  }, 4000);
}