const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const revealEls = Array.from(document.querySelectorAll(".reveal"));

function markVisible(el) {
  el.classList.add("is-visible");
}

function isInView(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
}

// Show hero (and anything already on screen) without waiting on the observer.
revealEls.filter(isInView).forEach(markVisible);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          markVisible(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  revealEls.forEach((el) => {
    if (!el.classList.contains("is-visible")) observer.observe(el);
  });
} else {
  revealEls.forEach(markVisible);
}
