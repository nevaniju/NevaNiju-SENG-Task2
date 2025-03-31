
const text = "Typify.";
let index = 0;

function typeEffect() {
    if (index < text.length) {
        document.getElementById("typing-text").innerHTML += text[index];
        index++;
        setTimeout(typeEffect, 125);
    } else {
        document.querySelector("#slogan").style.opacity = "1";
        document.querySelector("#slogan").style.transform = "scale(1)";
    }
}

window.onload = typeEffect;