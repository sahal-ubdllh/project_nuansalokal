document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector(".banner-slider .list");
  const next = document.querySelector(".banner-slider .next");
  const prev = document.querySelector(".banner-slider .prev");
  const dots = document.querySelectorAll(".banner-slider .dots li");

  if (!slider) return;

  let slides = document.querySelectorAll(".banner-slider .list .item");
  const totalSlides = slides.length;

  // 🔹 Clone untuk looping mulus
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[totalSlides - 1].cloneNode(true);
  slider.appendChild(firstClone);
  slider.insertBefore(lastClone, slides[0]);

  slides = document.querySelectorAll(".banner-slider .list .item");
  let index = 1;
  const size = 100;

  // set posisi awal
  slider.style.transform = `translateX(-${index * size}%)`;

  let autoSlide;

  function moveSlide() {
    slider.style.transition = "transform 0.6s ease-in-out";
    slider.style.transform = `translateX(-${index * size}%)`;

    // update dots (skip clone index)
    updateDots();
  }

  function moveNext() {
    if (index >= slides.length - 1) return;
    index++;
    moveSlide();
  }

  function movePrev() {
    if (index <= 0) return;
    index--;
    moveSlide();
  }

  function updateDots() {
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === ((index - 1 + totalSlides) % totalSlides));
    });
  }

  // Transisi selesai → reset posisi biar seamless
  slider.addEventListener("transitionend", () => {
    if (slides[index].isEqualNode(firstClone)) {
      slider.style.transition = "none";
      index = 1;
      slider.style.transform = `translateX(-${index * size}%)`;
    }
    if (slides[index].isEqualNode(lastClone)) {
      slider.style.transition = "none";
      index = totalSlides;
      slider.style.transform = `translateX(-${index * size}%)`;
    }
  });

  // Auto-slide
  function startAutoSlide() {
    stopAutoSlide();
    autoSlide = setInterval(() => {
      index++;
      moveSlide();
    }, 2000);
  }

  function stopAutoSlide() {
    clearInterval(autoSlide);
  }

  // Tombol
  next?.addEventListener("click", () => {
    index++;
    moveSlide();
    startAutoSlide();
  });

  prev?.addEventListener("click", () => {
    index--;
    moveSlide();
    startAutoSlide();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      index = i + 1;
      moveSlide();
      startAutoSlide();
    });
  });

  // Pause saat hover
  slider.addEventListener("mouseenter", stopAutoSlide);
  slider.addEventListener("mouseleave", startAutoSlide);

  // Responsive
  window.addEventListener("resize", () => {
    slider.style.transition = "none";
    slider.style.transform = `translateX(-${index * size}%)`;
  });

  // Start
  startAutoSlide();
});
