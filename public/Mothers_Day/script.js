var step = 0; // 0 is first slide, 1 is second, etc.

const slideBox = document.getElementById("slideBox");
const slides = document.getElementsByClassName("slide");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

slideContent(step);

document.getElementById("rightBtn").addEventListener("click", function(e) {
    if (step+1 < slides.length) {
        step++;
    } else {
        return;
    }

    updateButtonState(step);
    slideContent(step);
});

document.getElementById("leftBtn").addEventListener("click", function() {
    if (step > 0) {
        step--;
    } else {
        return;
    }

    updateButtonState(step);
    slideContent(step);
});

// Readjust the previewed content when the window size changes
window.addEventListener("resize", function() {
    slideContent(step);
});

// Disables or re-enables buttons based on current step/slide
function updateButtonState(step)
{
    if (step == slides.length - 1) {
        rightBtn.disabled = true;
    } else if (step == 0) {
        leftBtn.disabled = true;
    } else {
        leftBtn.disabled = false;
        rightBtn.disabled = false;
    }
}

// Given the step (slide number starting at 0), will
// slide the content box to preview the slide
function slideContent(step)
{
    const slideWidth = slides[0].offsetWidth;
    let offset = -1*slideWidth*step;
    slideBox.style.transform = `translateX(${offset}px)`;
}