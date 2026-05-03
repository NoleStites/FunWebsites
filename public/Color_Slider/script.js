
function changeCircleSize()
{
    let size = document.getElementById("circleSizeInput").value;
    document.documentElement.style.setProperty('--scale', `${size}`);
}

function changeSpeed()
{
    let speed = document.getElementById("animationSize").value;
    document.documentElement.style.setProperty('--animationSpeed', `${speed}s`);
}

function changeDelay()
{
    let delay = document.getElementById("animationDelay").value;
    document.documentElement.style.setProperty('--delayFactor', `${delay}`);
}