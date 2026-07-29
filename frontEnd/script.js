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

//map code below
(function(){
  var META = { minx:1.1633177663106686, maxy:0.46346627568515525, s:51817.496594797456, ox:82.32042215313379, oy:48.0 };

  var stage    = document.getElementById('stage');
  var paths    = Array.prototype.slice.call(
                   document.querySelectorAll('#inkgroup .ink'));
  var tip      = document.getElementById('tip');
  var tipDot   = document.getElementById('tipDot');
  var tipHalo  = document.getElementById('tipHalo');
  var chX      = document.getElementById('chX');
  var chY      = document.getElementById('chY');
  var rLon     = document.getElementById('rLon');
  var rLat     = document.getElementById('rLat');
  var rPct     = document.getElementById('rPct');
  var rNodes   = document.getElementById('rNodes');
  var pbar     = document.getElementById('pbar');
  var nameEl   = document.getElementById('cityname');

  // ---- measure every path, build one continuous timeline ----
  var lens = paths.map(function(p){ return p.getTotalLength(); });
  var total = lens.reduce(function(a,b){ return a+b; }, 0);
  var starts = [], acc = 0;
  lens.forEach(function(L,i){ starts[i] = acc; acc += L; });

  paths.forEach(function(p,i){
    p.style.strokeDasharray  = lens[i] + ' ' + lens[i];
    p.style.strokeDashoffset = lens[i];
  });

  var nodeCount = paths.reduce(function(a,p){
    return a + (p.getAttribute('d').match(/,/g)||[]).length;
  },0);

  // inverse Web Mercator -> lon/lat, so the readout shows real coordinates
  function unproject(x,y){
    var mx = (x - META.ox)/META.s + META.minx;
    var my = META.maxy - (y - META.oy)/META.s;
    var lon = mx * 180/Math.PI;
    var lat = (2*Math.atan(Math.exp(my)) - Math.PI/2) * 180/Math.PI;
    return [lon, lat];
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render(prog){
    prog = Math.max(0, Math.min(1, prog));
    var drawn = prog * total;

    var activeIdx = -1;
    for (var i=0;i<paths.length;i++){
      var local = drawn - starts[i];
      if (local <= 0){
        paths[i].style.strokeDashoffset = lens[i];
      } else if (local >= lens[i]){
        paths[i].style.strokeDashoffset = 0;
      } else {
        paths[i].style.strokeDashoffset = lens[i] - local;
        activeIdx = i;
      }
    }

    if (activeIdx > -1){
      var pt = paths[activeIdx].getPointAtLength(drawn - starts[activeIdx]);
      tip.style.opacity = 1;
      tipDot.setAttribute('cx', pt.x);  tipDot.setAttribute('cy', pt.y);
      tipHalo.setAttribute('cx', pt.x); tipHalo.setAttribute('cy', pt.y);
      chX.setAttribute('y1', pt.y); chX.setAttribute('y2', pt.y);
      chY.setAttribute('x1', pt.x); chY.setAttribute('x2', pt.x);
      var ll = unproject(pt.x, pt.y);
      rLon.textContent = ll[0].toFixed(4) + '°E';
      rLat.textContent = ll[1].toFixed(4) + '°N';
    } else {
      tip.style.opacity = prog >= 1 ? 0 : 0;
    }

    rPct.textContent   = Math.round(prog*100) + '%';
    rNodes.textContent = Math.round(prog*nodeCount).toLocaleString();
    pbar.style.height  = (prog*100) + '%';
    nameEl.classList.toggle('on', prog > 0.97);
  }

  if (reduce){ render(1); return; }

  /* initial code for map visibility....screen can be scrolled as soon as the map plotation is completed
  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      var r = stage.getBoundingClientRect();
      var scrollable = r.height - window.innerHeight;
      var prog = scrollable > 0 ? (-r.top) / scrollable : 0;
      render(prog);
      ticking = false;
    });
  }
*/

// extra scrool required after map plotation
var HOLD = 0.35;   // ← last 35% of the scroll = map sits fully drawn (your extra scrolls)
  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      var r = stage.getBoundingClientRect();
      var scrollable = r.height - window.innerHeight;
      var raw = scrollable > 0 ? (-r.top) / scrollable : 0;
      render(raw / (1 - HOLD));   // finishes drawing early, then holds; render() clamps at 1
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  render(0);
  onScroll();
})();