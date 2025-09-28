let slider = document.querySelector(".slider .list");
let items = document.querySelectorAll(".slider .list .item");
let next = document.querySelector(".slider .next");
let prev = document.querySelector(".slider .prev");
let dots = document.querySelectorAll(".slider .dots li");

let totalItems = items.length;

// Clone first & last slide
let firstClone = items[0].cloneNode(true);
let lastClone = items[totalItems - 1].cloneNode(true);
slider.appendChild(firstClone);
slider.insertBefore(lastClone, slider.firstChild);

// Update list & items
items = document.querySelectorAll(".slider .list .item");

let index = 1; // Start from real first slide
let slideWidth = items[0].offsetWidth;

// Set initial position
slider.style.left = -slideWidth * index + "px";

let refreshInterval = setInterval(() => { moveNext(); }, 3000);

function moveNext() {
    if (index >= items.length - 1) return;
    index++;
    moveSlide();
}

function movePrev() {
    if (index <= 0) return;
    index--;
    moveSlide();
}

function moveSlide() {
    slider.style.transition = "left 0.6s ease-in-out";
    slider.style.left = -slideWidth * index + "px";

    updateDots();

    clearInterval(refreshInterval);
    refreshInterval = setInterval(() => { moveNext(); }, 3000);
}

// Handle transition end for infinite effect
slider.addEventListener("transitionend", () => {
    if (items[index].isEqualNode(firstClone)) {
        slider.style.transition = "none";
        index = 1;
        slider.style.left = -slideWidth * index + "px";
    }
    if (items[index].isEqualNode(lastClone)) {
        slider.style.transition = "none";
        index = totalItems;
        slider.style.left = -slideWidth * index + "px";
    }
});

// Buttons
next.onclick = moveNext;
prev.onclick = movePrev;

// Update dots
function updateDots() {
    document.querySelector(".slider .dots li.active").classList.remove("active");
    let dotIndex = index - 1;
    if (dotIndex >= totalItems) dotIndex = 0;
    if (dotIndex < 0) dotIndex = totalItems - 1;
    dots[dotIndex].classList.add("active");
}

// Dots click
dots.forEach((dot, key) => {
    dot.addEventListener("click", () => {
        index = key + 1;
        moveSlide();
    });
});

window.onresize = function () {
    slideWidth = items[0].offsetWidth;
    slider.style.left = -slideWidth * index + "px";
};
