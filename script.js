

// hello there welcome, the variable below is being extracted from css,
// it is used to set all values related to distances and widths and ...
// it makes game functional in almost all screen sizes
var x = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--x'));


var container = document.getElementById("container");
var playerBox = document.getElementById("player");
var target = document.getElementById("target");
var startBtn = document.getElementById("start");
var resetBtn = document.getElementById("reset");
var wrapper = document.getElementById("wrapper");

var scoreHolder = document.getElementById("score");
var healthHolder = document.getElementById("health");
var levelHolder = document.getElementById("level");
var health = healthHolder.innerText = 100;
var score = scoreHolder.innerText = 0;
var level = levelHolder.innerText = 0;

//starting postion for player, the same as css
const leftDef = 2.35 * x;
const upDef = 5.5 * x;

// Add path to your images here, no need to adjust anything else
var images = [
    "./assets/images/1.png",
    "./assets/images/2.png",
];

// Unlike any other game, decreaseing this amount will make game harder
// It makes the player movement and changing the postion of target faster.
var difficulty = 6;

// coordinates of target element are stored here
var targetX;
var targetY;

// making any of bools below, will make player move in that direction
var goingLeft = false;
var goingRight = false;
var goingUp = false;
var goingDown = false;

// position of player is stored here
var leftPos = leftDef;
var upPos = upDef;

// interval for main game funciton (search for runtime funciton) will be stored here
var running = null;

// the bools that each of this funcitons are setting, will be checked by runtime funciton
function isGoingToLeft() {
    goingLeft = true;
    goingRight = false;
    goingUp = false;
    goingDown = false;
}

function isGoingToRight() {
    goingLeft = false;
    goingRight = true;
    goingUp = false;
    goingDown = false;
}

function isGoingToUp() {
    goingLeft = false;
    goingRight = false;
    goingUp = true;
    goingDown = false;
}

function isGoingToDown() {
    goingLeft = false;
    goingRight = false;
    goingUp = false;
    goingDown = true;
}

// these funciotns are called via intervals from runtime function after checking isGoingTo bools
// moving limitaions are set here
function goToLeft() {
    if(leftPos <= 0) {
        return 0;
    }
    leftPos -= ((0.05 * x)/difficulty) * 6;
    playerBox.style.left = leftPos + "px";
}

function goToRight() {
    if (leftPos >= (leftDef * 2)) {
        return 0;
    }
    leftPos += ((0.05 * x)/difficulty) * 6;
    playerBox.style.left = leftPos + "px";
}

function goToUp() {
    if (upPos <= (0)) {
        return 0;
    }
    upPos -= ((0.05 * x)/difficulty) * 6;
    playerBox.style.top = upPos + "px";
}

function goToDown() {
    if (upPos >= (upDef)) {
        return 0;
    }
    upPos += ((0.05 * x)/difficulty) * 6;
    playerBox.style.top = upPos + "px";
}

// used for checking collision of player with target and raindrops (search for raindrops)
function checkCollision(a, b) {
    var playerRect = a.getBoundingClientRect();
    var targetRect = b.getBoundingClientRect();

    // Check for collision
    if (playerRect.left < targetRect.right &&
        playerRect.right > targetRect.left &&
        playerRect.top < targetRect.bottom &&
        playerRect.bottom > targetRect.top) {
        
        return true;
    } else {
        return false;
    }
}

function getRandomNumber(a) {
    var randomNumber = Math.floor(Math.random() * a);
    return randomNumber;
}

function getRandomNumberFromArray(array) {
    // Generate a random number between 0 and array.length - 1
    var randomNumber = Math.floor(Math.random() * array.length);
    return randomNumber;
}

//creates a new child for #container element, any image that is falling from top, is a raindrop (raindrops)
function rainDrops() {
    let div = document.createElement("div");
    div.classList.add("image-child");
    let img = document.createElement("img");
    let randomNum = getRandomNumberFromArray(images);
    img.src = images[randomNum];
    div.appendChild(img);
    return div;
}

// this funciton is in charge of creating and destroying raindrops
function rainer() {
    let div = rainDrops();
    container.appendChild(div);

    // Set initial top position
    let topPosition = 0;
    let lefPosition = getRandomNumber(4.2 * x);

    // it would've be so much better if the positon was relative, but they cause unexpected bugs
    div.style.position = 'absolute';
    div.style.top = ((window.innerHeight)/2 - ((x*6.5)/2)) + topPosition + 'px';
    div.style.left = ((window.innerWidth)/2 - (x*5)/2) + lefPosition + 'px';

    // Move the raindrop downwards using setInterval
    let intervalId = setInterval(function() {
        topPosition += (x * 0.01); // Adjust this value to control the speed of the raindrop
        div.style.top = ((window.innerHeight)/2 - ((x*6.5)/2)) + topPosition + 'px';
        // If the raindrop moves beyond the container, remove it
        if (topPosition > container.offsetHeight) {
            clearInterval(intervalId);
            div.remove();
        }
    }, 20); // Change this value to adjust the interval time
}

// the interval for rainer funciton will be stored in this variable
var setRainingCondition = null;

function setRain() {
    if (!setRainingCondition) {
        setRainingCondition = setInterval(rainer, 312 * difficulty);
    }
}

// Listen for keydown events to start the movement
document.addEventListener("keydown", function(event) {
    switch (event.key) {
        case "ArrowLeft":
            isGoingToLeft();
            break;
        case "ArrowRight":
            isGoingToRight();
            break;
        case "ArrowUp":
            isGoingToUp();
            break;
        case "ArrowDown":
            isGoingToDown();
            break;
    }
});

// Listen for keyup events to stop the movement
document.addEventListener("keyup", function(event) {
    switch (event.key) {
        case "ArrowLeft":
        case "ArrowRight":
        case "ArrowUp":
        case "ArrowDown":
            goingLeft = false;
            goingRight = false;
            goingUp = false;
            goingDown = false;
            break;
    }
});


//this function is in charge of random changing position of the target
function randomizer() {
    targetY = Math.round(Math.random() * 5.25 * x);
    targetX = Math.round(Math.random() * 4.75 * x);
    target.style.left = targetX + "px";
    target.style.top = targetY + "px";
}


// main game funciton, checks collisions and moves the player if related bools are set true
function runtime() {
    // Check for collision with raindrops
    let raindrops = document.querySelectorAll(".image-child");
    raindrops.forEach(raindrop => {
        if (checkCollision(playerBox, raindrop)) {
            console.log("Player collided with a raindrop!");
            // Reduce player's health
            health -= 20; // Adjust the amount of health reduction as needed
            if (health <= 0) {
                alert("GAMEOVER! Your Score: " + (level * 10 + score));
                location.reload();
            }
            healthHolder.innerText = health;
            // Remove the raindrop
            raindrop.remove();
        }
    });

    // Check for collision with target
    if (checkCollision(playerBox, target)) {
        console.log("Collision detected with the target!");
        randomizer();
        score++;
        // Update health
        if (health + 15 <= 100) {
            health += 15;
        } else {
            health = 100;
        }
        healthHolder.innerText = health;
        
        if (score % 10 === 0) {
            level++;
            levelHolder.innerText = level;
            difficulty--;
            score = 0;
            if (level == 6) {
                alert (" Wow, I didn't expect this much")
                location.reload();
            }
        }

        
        scoreHolder.innerText = score;
        clearInterval(randomElementGenerating);
        randomElementGenerating = setInterval(randomizer, 500 * difficulty);
    }

    // checking for related bools and calling movement function to move the player
    switch (true) {
        case goingLeft:
            goToLeft();
            break;
        case goingRight:
            goToRight();
            break;
        case goingUp:
            goToUp();
            break;
        case goingDown:
            goToDown();
            break;
        default:
    }
}

// interval for random positioning of target will be stored here
var randomElementGenerating = null;

// fires when you press start button
function starter() {
    
    if (!running) {
        running = setInterval(runtime, 5 * difficulty);
    }
    if (!randomElementGenerating) {
        randomElementGenerating = setInterval(randomizer, 500 * difficulty);
    }
}

// reloads the page in case of resetting the game, fires when reset button is pressed
function resetter() {
    location.reload();
}

startBtn.addEventListener("click", starter);
startBtn.addEventListener("click", setRain);

resetBtn.onclick = resetter;

//------------------------------------------------End


