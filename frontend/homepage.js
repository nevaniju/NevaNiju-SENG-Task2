const text = "Typify.";
let index = 0;

function typeEffect() {
    if (index < text.length) {
        document.getElementById("typing-text").innerHTML += text[index];
        index++;
        setTimeout(typeEffect, 150);
    }
}

window.onload = typeEffect;