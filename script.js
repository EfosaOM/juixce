const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const hero = document.querySelector(".hero");
const revealEls = Array.from(document.querySelectorAll(".reveal"));

function markVisible(el) {
  el.classList.add("is-visible");
}

function isInView(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
}

requestAnimationFrame(() => {
  if (hero) hero.classList.add("is-ready");
  revealEls.filter(isInView).forEach(markVisible);
});

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

(function initRolesMarquee() {
  const track = document.getElementById("roles-track");
  const viewportEl = document.getElementById("roles-viewport");
  const roles = track && track.closest(".hero-roles");
  if (!track || !roles || !viewportEl) return;

  const phrases = [
    "Award Winning Record Producer",
    "Creative Director",
    "Artist",
    "Extraordinary",
  ];

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function buildSegment() {
    const frag = document.createDocumentFragment();
    phrases.forEach((text) => {
      const item = document.createElement("span");
      item.className = "hero-roles-item";
      item.textContent = text;
      frag.appendChild(item);

      const dot = document.createElement("span");
      dot.className = "hero-roles-dot";
      dot.setAttribute("aria-hidden", "true");
      frag.appendChild(dot);
    });
    return frag;
  }

  function fillTrack() {
    track.innerHTML = "";
    track.appendChild(buildSegment());

    // Fill past the viewport so the row never looks empty.
    const viewport = viewportEl.clientWidth || window.innerWidth;
    while (track.scrollWidth < viewport * 1.25) {
      track.appendChild(buildSegment());
    }

    const loopWidth = track.scrollWidth;

    // Exact second copy for a seamless wrap (leave left → enter right).
    const clone = document.createDocumentFragment();
    Array.from(track.children).forEach((child) => {
      clone.appendChild(child.cloneNode(true));
    });
    track.appendChild(clone);

    return loopWidth;
  }

  if (reduceMotion) {
    track.appendChild(buildSegment());
    return;
  }

  let loopWidth = 0;
  let offset = 0;
  let lastTime = null;
  let running = false;
  const speed = 48;

  function frame(time) {
    if (!running) return;
    if (lastTime == null) lastTime = time;
    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    offset -= speed * delta;
    if (offset <= -loopWidth) offset += loopWidth;
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
    requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    loopWidth = fillTrack();
    offset = 0;
    running = true;
    lastTime = null;
    requestAnimationFrame(frame);
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const wasRunning = running;
      running = false;
      loopWidth = fillTrack();
      offset = 0;
      track.style.transform = "translate3d(0, 0, 0)";
      if (wasRunning) {
        running = true;
        lastTime = null;
        requestAnimationFrame(frame);
      }
    }, 150);
  });

  if (!roles.classList.contains("is-visible")) {
    const startObserver = new MutationObserver(() => {
      if (roles.classList.contains("is-visible")) {
        startObserver.disconnect();
        start();
      }
    });
    startObserver.observe(roles, {
      attributes: true,
      attributeFilter: ["class"],
    });
  } else {
    start();
  }
})();
