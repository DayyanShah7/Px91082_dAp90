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