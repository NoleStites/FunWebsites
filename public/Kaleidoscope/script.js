var lightMode = true;
document.documentElement.setAttribute('data-theme', "light");
var lightModeBtn = document.getElementById("darkLightMode");
lightModeBtn.addEventListener("click", changePalette);

function changeCircleSize()
{
    let size = document.getElementById("circleSizeInput").value;
    size = 11 - size;
    document.documentElement.style.setProperty('--scale', `${size}`);
}

function changeSpeed()
{
    let speed = document.getElementById("animationSpeed").value;
    speed = 5.2 - speed;
    document.documentElement.style.setProperty('--animationSpeed', `${speed}s`);
}

function changeDelay()
{
    let delay = document.getElementById("animationDelay").value;
    document.documentElement.style.setProperty('--delayFactor', `${delay}`);
}

function changePalette() {
    if (lightMode) {
        document.documentElement.setAttribute('data-theme', "dark");
        localStorage.setItem('selectedTheme', "dark");
        lightModeBtn.innerText = "Light Mode";
        lightMode = false;
    }
    else {
        document.documentElement.setAttribute('data-theme', "light");
        localStorage.setItem('selectedTheme', "light");
        lightModeBtn.innerText = "Dark Mode";
        lightMode = true;
    }
}