// TODO: 
// move CSS animations to JS (refer to recent Gemini chat)

    var lightMode = true;
    var lightModeBtn = document.getElementById("darkLightMode");
    lightModeBtn.addEventListener("click", changePalette);
    document.documentElement.setAttribute('data-theme', "light");

    // Set default circle properties
    let numCircles = 20;
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    let scale = styles.getPropertyValue('--scale').trim();
    document.getElementById("circleSizeInput").value = 11-parseInt(scale);
    document.getElementById("animationSpeed").value = 5.2 - 1;
    document.getElementById("animationDelay").value = 0.1;
    document.getElementById("numCircles").value = numCircles;

    let translateScale = 0.5*scale+1;
    let animationSpeed = 1;
    let delay = 0.1;
    let cosSinAngles = [];

window.onload = () => {
    generateCircles(numCircles);
};

function generateCircles(num)
{
    const circleBox = document.getElementById("innerBox");
    circleBox.innerHTML = "";
    cosSinAngles = [];
    for (let i = 0; i < num; i++) {
        let newCircle = document.createElement("div");
        newCircle.id = `color${i+1}`;
        newCircle.classList.add("colorSquare");
        newCircle.style.backgroundColor = `hsl(${(360/num)*i}, 100%, 50%)`;
        
        // 1. Calculate the angle for THIS specific circle
        let angle = (2 * Math.PI / num) * i;

        // 2. Get the X and Y unit vectors (values between -1 and 1)
        let cos_angle = Math.cos(angle)*100;
        let sin_angle = Math.sin(angle)*100;
        cosSinAngles.push([cos_angle, sin_angle]);

        circleBox.appendChild(newCircle);
    }
    updateAnimations(num);
}

function updateAnimations(num)
{    
    let circles = document.getElementsByClassName("colorSquare");
    
    // --- STEP 1: RESET EVERYTHING ---
    for (let circle of circles) {
        // This stops current animations and resets transforms to 0%
        circle.getAnimations().forEach(anim => anim.cancel());
    }

    // --- STEP 2: APPLY NEW ANIMATIONS ---
    let counter = 0;
    for (let circle of circles)
    {
        let targetX = cosSinAngles[counter][0] * translateScale;
        let targetY = cosSinAngles[counter][1] * translateScale;

        circle.animate([
                { transform: `translate(0%)` },
                { transform: `translate(${targetX}%, ${targetY}%)` },
        ],
        {
            duration: animationSpeed*1000,
            iterations: Infinity,
            easing: "linear",
            fill: "forwards",
            direction: "alternate",
            delay: delay*counter*500
        });

        counter++;
    }
}

function changeCircleSize()
{
    let size = document.getElementById("circleSizeInput").value;
    size = 11 - size;
    document.documentElement.style.setProperty('--scale', `${size}`);
    scale = size;
    translateScale = 0.5*scale+1;
    updateAnimations(numCircles);
}

function changeSpeed()
{
    let speed = document.getElementById("animationSpeed").value;
    speed = 5.2 - speed;
    animationSpeed = speed;
    updateAnimations(numCircles);
}

function changeDelay()
{
    delay = document.getElementById("animationDelay").value;
    updateAnimations(numCircles);
}

function changeNumCircles()
{
    let input = document.getElementById("numCircles");
    if ((parseInt(input.value) < parseInt(input.min)) || (parseInt(input.value) > parseInt(input.max))) {
        input.value = numCircles;
        return;
    }
    numCircles = input.value;
    generateCircles(numCircles);
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