// Ilsa Khan Studio — luxury editorial animation system

const drawer = document.querySelector('[data-drawer]');
const menu = document.querySelector('[data-menu]');
if (menu && drawer) menu.addEventListener('click', () => drawer.classList.toggle('open'));

// Page ready fade-in + scroll progress
const progress = document.createElement('div');
progress.className = 'scroll-progress';
document.body.prepend(progress);
requestAnimationFrame(() => document.body.classList.add('site-ready'));

function updateProgress(){
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
  progress.style.width = `${pct}%`;
}
window.addEventListener('scroll', updateProgress, { passive:true });
window.addEventListener('resize', updateProgress);
updateProgress();

// Smooth page transition for internal links
Array.from(document.querySelectorAll('a[href]')).forEach(link => {
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return;
  link.addEventListener('click', event => {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return;
    event.preventDefault();
    document.body.classList.add('is-leaving');
    setTimeout(() => { window.location.href = href; }, 240);
  });
});

// Split select headings into staggered word reveals
const splitTargets = document.querySelectorAll('.page-title h1, .editorial-page h1, .editorial-page h2, .project-intro h1, .project-intro h3, .section-line h2, .related h2, .product-gallery h2, .team-section h2, .founder-note h2, .timeline-section h2, .culture-section h2, .done>h2');
splitTargets.forEach(el => {
  if (el.dataset.split === 'true') return;
  const text = el.innerHTML.trim();
  const parts = text.split(/(\s+)/).map(part => {
    if (/^\s+$/.test(part)) return part;
    return `<span class="word">${part}</span>`;
  }).join('');
  el.innerHTML = parts;
  el.classList.add('text-split');
  el.dataset.split = 'true';
});

// Intersection reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

document.querySelectorAll('.reveal, .project-card, .selected-row a, .related-row a, .product-card, .team-card, .culture-card, .text-split').forEach(el => revealObserver.observe(el));

// Forms: subtle submitted state
Array.from(document.querySelectorAll('form')).forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    if(btn){
      const old = btn.textContent;
      btn.textContent = 'Sent';
      form.classList.add('form-sent');
      setTimeout(() => { btn.textContent = old; form.classList.remove('form-sent'); }, 1600);
    }
  });
});

// Scroll parallax with requestAnimationFrame
let ticking = false;
function parallax(){
  const y = window.scrollY;
  document.querySelectorAll('.hero-panel img, .detail-hero img').forEach((img, i) => {
    const speed = i % 2 === 0 ? 0.035 : 0.022;
    img.style.transform = `translateY(${Math.min(y * speed, 36)}px) scale(1.045)`;
  });
  document.querySelectorAll('.split-quote>img, .story-band>img, .affiliate-intro>img').forEach((img) => {
    const rect = img.getBoundingClientRect();
    const offset = (window.innerHeight - rect.top) * 0.018;
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      img.style.transform = `translateY(${Math.max(-18, Math.min(offset - 18, 24))}px) scale(1.02)`;
    }
  });
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(parallax);
    ticking = true;
  }
}, { passive:true });
parallax();

// Draggable slider rows + floating DRAG cursor
const dragCursor = document.createElement('div');
dragCursor.className = 'drag-cursor';
dragCursor.textContent = 'Drag';
document.body.appendChild(dragCursor);
window.addEventListener('mousemove', (event) => {
  dragCursor.style.left = `${event.clientX}px`;
  dragCursor.style.top = `${event.clientY}px`;
}, { passive:true });

function makeDraggable(row){
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let moved = false;

  row.addEventListener('mouseenter', () => dragCursor.classList.add('show'));
  row.addEventListener('mouseleave', () => {
    dragCursor.classList.remove('show');
    isDown = false;
    row.classList.remove('is-dragging');
  });
  row.addEventListener('mousedown', (event) => {
    isDown = true;
    moved = false;
    row.classList.add('is-dragging');
    startX = event.pageX - row.offsetLeft;
    scrollLeft = row.scrollLeft;
  });
  row.addEventListener('mouseup', () => {
    isDown = false;
    row.classList.remove('is-dragging');
  });
  row.addEventListener('mousemove', (event) => {
    if (!isDown) return;
    event.preventDefault();
    const x = event.pageX - row.offsetLeft;
    const walk = (x - startX) * 1.3;
    if (Math.abs(walk) > 5) moved = true;
    row.scrollLeft = scrollLeft - walk;
  });
  row.addEventListener('click', (event) => {
    if (moved) event.preventDefault();
  }, true);
}

document.querySelectorAll('.selected-row, .related-row, .product-gallery-grid, .team-grid, .culture-grid').forEach(makeDraggable);

// Search overlay
const searchOpen = document.querySelector('[data-search-open]');
const searchOverlay = document.querySelector('[data-search-overlay]');
const searchClose = document.querySelector('[data-search-close]');
if (searchOpen && searchOverlay) {
  searchOpen.addEventListener('click', () => {
    searchOverlay.classList.add('open');
    const input = searchOverlay.querySelector('input');
    setTimeout(() => input && input.focus(), 120);
  });
}
if (searchClose && searchOverlay) searchClose.addEventListener('click', () => searchOverlay.classList.remove('open'));
if (searchOverlay) searchOverlay.addEventListener('click', (event) => {
  if (event.target === searchOverlay) searchOverlay.classList.remove('open');
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && searchOverlay) searchOverlay.classList.remove('open');
});

// Mobile accordions
Array.from(document.querySelectorAll('.mobile-accordion')).forEach(button => {
  button.addEventListener('click', () => {
    const section = button.closest('.mobile-section');
    if(section) section.classList.toggle('open');
  });
});


// Infinite horizontal marquee sliders for internal project pages
function setMarqueeDuration(root){
  const track = root.querySelector('.marquee-track');
  if(!track) return;
  const originalItems = Array.from(track.children).filter(el => !el.hasAttribute('data-clone'));
  if(!originalItems.length) return;
  const gap = parseFloat(getComputedStyle(track).gap || '0');
  let width = 0;
  originalItems.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    width += rect.width;
    if(index < originalItems.length - 1) width += gap;
  });
  const speed = Number(root.dataset.speed || 30);
  const duration = Math.max(width / speed, 18);
  track.style.setProperty('--marquee-duration', `${duration}s`);
}

function initAutoMarquees(){
  document.querySelectorAll('[data-auto-marquee]').forEach(root => {
    const track = root.querySelector('.marquee-track');
    if(!track) return;
    if(!root.dataset.marqueeReady){
      const originals = Array.from(track.children);
      originals.forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('data-clone','true');
        clone.setAttribute('aria-hidden','true');
        track.appendChild(clone);
      });
      root.dataset.marqueeReady = 'true';
    }
    setMarqueeDuration(root);
  });
}
window.addEventListener('load', initAutoMarquees);
window.addEventListener('resize', () => {
  window.clearTimeout(window.__ikMarqueeResize);
  window.__ikMarqueeResize = window.setTimeout(initAutoMarquees, 150);
});


// Mobile fallback: force all reveal content visible to avoid blank sections
function forceMobileContentVisible(){
  if(window.innerWidth > 980) return;
  document.body.classList.add('site-ready');
  document.querySelectorAll('.reveal, .project-card, .selected-row a, .related-row a, .product-card, .team-card, .culture-card, .text-split').forEach(el => {
    el.classList.add('in-view');
  });
}
forceMobileContentVisible();
window.addEventListener('load', forceMobileContentVisible);
window.addEventListener('resize', () => {
  window.clearTimeout(window.__ikMobileForce);
  window.__ikMobileForce = window.setTimeout(forceMobileContentVisible, 120);
});


// Home page: scroll-triggered horizontal gallery movement — slower premium version
function initHomeScrollGallery(){
  const gallery = document.querySelector('[data-scroll-gallery]');
  const track = document.querySelector('[data-scroll-track]');
  if(!gallery || !track) return;

  const cards = Array.from(track.querySelectorAll('.home-card-block')).length ? Array.from(track.querySelectorAll('.home-card-block')) : Array.from(track.querySelectorAll('.scroll-project-card'));
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const smootherStep = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (start, end, amt) => start + (end - start) * amt;

  let targetX = 0;
  let currentX = 0;
  let activeProgress = 0;
  let rafId = null;

  function measure(){
    if(window.innerWidth <= 980){
      targetX = 0;
      activeProgress = 0;
      track.style.transform = 'none';
      cards.forEach(card => card.style.setProperty('--float-y', '0px'));
      return;
    }

    const rect = gallery.getBoundingClientRect();
    const total = Math.max(gallery.offsetHeight - window.innerHeight, 1);
    const passed = clamp(-rect.top, 0, total);
    const progress = passed / total;
    const eased = smootherStep(progress);
    const maxMove = Math.max(track.scrollWidth - window.innerWidth + window.innerWidth * 0.24, 0);

    activeProgress = progress;
    targetX = -maxMove * eased;

    cards.forEach((card, index) => {
      const wave = Math.sin(progress * Math.PI * 1.08 + index * 0.6);
      const drift = Math.cos(progress * Math.PI * 0.92 + index * 0.45);
      const floatY = wave * 14 + drift * 4;
      card.style.setProperty('--float-y', `${floatY.toFixed(2)}px`);
    });
  }

  function animate(){
    currentX = lerp(currentX, targetX, 0.065);
    track.style.transform = `translate3d(${currentX}px,0,0)`;

    if(Math.abs(currentX - targetX) > 0.12){
      rafId = window.requestAnimationFrame(animate);
    } else {
      currentX = targetX;
      track.style.transform = `translate3d(${currentX}px,0,0)`;
      rafId = null;
    }
  }

  function update(){
    measure();
    if(window.innerWidth <= 980) return;
    if(!rafId) rafId = window.requestAnimationFrame(animate);
  }

  update();
  window.addEventListener('scroll', update, { passive:true });
  window.addEventListener('resize', update);
}
initHomeScrollGallery();
window.addEventListener('load', initHomeScrollGallery);


// Spaces page: inject centered Explore overlay (black theme variant)
if (document.body.classList.contains('spaces-page')) {
  document.querySelectorAll('.project-card .image-wrap').forEach((wrap) => {
    if (wrap.querySelector('.explore-overlay')) return;
    const overlay = document.createElement('span');
    overlay.className = 'explore-overlay';
    overlay.innerHTML = '<span class="explore-plus" aria-hidden="true"></span><span class="explore-label">Explore</span>';
    wrap.appendChild(overlay);
  });
}


// Approach page: sticky stacked image sequence with slow premium scroll animation
function initApproachScrollSequence(){
  const section = document.querySelector('[data-approach-sequence]');
  if(!section) return;
  if(section.dataset.sequenceBound === 'true') return;
  section.dataset.sequenceBound = 'true';

  const header = document.querySelector('.site-header');
  const cards = Array.from(section.querySelectorAll('[data-sequence-card]'));
  if(!cards.length) return;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  let targetProgress = 0;
  let currentProgress = 0;

  function setHeaderOffset(){
    const offset = header ? header.offsetHeight : 0;
    section.style.setProperty('--header-offset', `${offset}px`);
  }

  function setMobileLayout(){
    cards.forEach((card, index) => {
      card.style.transform = 'none';
      card.style.zIndex = String(cards.length - index);
      card.style.opacity = '1';
    });
  }

  function computeTarget(){
    setHeaderOffset();
    if(window.innerWidth <= 980){
      targetProgress = 0;
      currentProgress = 0;
      setMobileLayout();
      return;
    }

    const rect = section.getBoundingClientRect();
    const total = Math.max(section.offsetHeight - window.innerHeight, 1);
    const passed = clamp(-rect.top, 0, total);
    targetProgress = (passed / total) * (cards.length - 1);
  }

  function render(){
    if(window.innerWidth > 980){
      currentProgress += (targetProgress - currentProgress) * 0.06;
      if(Math.abs(targetProgress - currentProgress) < 0.0004) currentProgress = targetProgress;

      const base = Math.floor(currentProgress);
      const local = ease(currentProgress - base);

      cards.forEach((card, index) => {
        let translate = 110;
        let zIndex = index + 1;

        if(index < base){
          translate = 0;
          zIndex = index + 1;
        } else if(index === base){
          translate = 0;
          zIndex = cards.length + 1;
        } else if(index === base + 1){
          translate = (1 - local) * 110;
          zIndex = cards.length + 2;
        }

        if(index > base + 1){
          translate = 110;
        }

        if(base >= cards.length - 1 && index === cards.length - 1){
          translate = 0;
          zIndex = cards.length + 2;
        }

        card.style.transform = `translate3d(0, ${translate}%, 0)`;
        card.style.opacity = '1';
        card.style.zIndex = String(zIndex);
      });
    } else {
      setMobileLayout();
    }

    requestAnimationFrame(render);
  }

  computeTarget();
  requestAnimationFrame(render);
  window.addEventListener('scroll', computeTarget, { passive: true });
  window.addEventListener('resize', computeTarget);
  window.addEventListener('load', computeTarget);
}
initApproachScrollSequence();
window.addEventListener('load', initApproachScrollSequence);
