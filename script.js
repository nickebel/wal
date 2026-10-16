(() => {
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  function closeMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    mainNav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mainNav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  });
  mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  const revealButton = document.getElementById('revealMessage');
  const secretMessage = document.getElementById('secretMessage');
  revealButton.addEventListener('click', () => {
    const reveal = secretMessage.hidden;
    secretMessage.hidden = !reveal;
    revealButton.setAttribute('aria-expanded', String(reveal));
    revealButton.innerHTML = reveal ? 'Mensagem aberta <span aria-hidden="true">♥</span>' : 'Abrir sua mensagem <span aria-hidden="true">♥</span>';
    if (reveal) { secretMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); launchConfetti(65); }
  });

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  function closeLightbox() {
    if (typeof lightbox.close === 'function') lightbox.close();
    else lightbox.removeAttribute('open');
    lightboxImage.removeAttribute('src');
  }
  document.querySelectorAll('.gallery-card').forEach(card => card.addEventListener('click', () => {
    lightboxImage.src = card.dataset.image;
    lightboxImage.alt = card.querySelector('img').alt || 'Foto do Wal';
    lightboxCaption.textContent = card.dataset.caption || '';
    if (typeof lightbox.showModal === 'function') lightbox.showModal();
    else lightbox.setAttribute('open', '');
  }));
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  lightbox.addEventListener('close', () => lightboxImage.removeAttribute('src'));

  function launchConfetti(count) {
    const layer = document.getElementById('confettiLayer');
    const colors = ['#ffac3b', '#ffd574', '#8bcce2', '#fffef9', '#6f9cae'];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = (Math.random() * 100) + '%';
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.setProperty('--duration', (2 + Math.random() * 2.2) + 's');
      piece.style.setProperty('--drift', Math.round(Math.random() * 180 - 90) + 'px');
      piece.style.animationDelay = (Math.random() * .55) + 's';
      layer.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove(), { once: true });
    }
  }
  document.getElementById('celebrateButton').addEventListener('click', event => {
    launchConfetti(130);
    const button = event.currentTarget;
    const oldText = button.innerHTML;
    button.innerHTML = 'Boas energias enviadas! <span aria-hidden="true">♥</span>';
    button.setAttribute('aria-label', 'Boas energias enviadas para o Wal');
    window.setTimeout(() => { button.innerHTML = oldText; button.removeAttribute('aria-label'); }, 2600);
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.intro-heading, .intro-message, .values-row, .athlete-copy, .gallery-heading, .gallery-card, .final-copy, .final-action');
    targets.forEach((target, index) => {
      target.classList.add('js-reveal');
      if (target.classList.contains('gallery-card')) target.style.transitionDelay = ((index % 3) * 70) + 'ms';
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, { threshold: .12 });
    targets.forEach(target => observer.observe(target));
  }
})();