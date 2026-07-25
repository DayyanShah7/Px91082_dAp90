// Minimal script — just makes sure the background video actually starts.
// Some browsers block autoplay until the first tap/click, even when muted.

const video = document.querySelector('.bg-video');

if (video) {
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {
      const resume = () => {
        video.play();
        window.removeEventListener('pointerdown', resume);
      };
      window.addEventListener('pointerdown', resume, { once: true });
    });
  }
}

const hero = document.getElementById('hero');
const nav = document.getElementById('siteNav');

window.addEventListener("scroll", () => {
    const heroBottom = hero.getBoundingClientRect().bottom;

    if (heroBottom <= 0) {
        nav.classList.add("is-visible");
    } else {
        nav.classList.remove("is-visible");
    }
});

if (hero && nav && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        nav.classList.toggle('is-visible', !entry.isIntersecting);
      });
    },
    { threshold: 0 }
  );
  observer.observe(hero);
}
