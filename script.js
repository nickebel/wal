(() => {
  // A prévia fica disponível com ?preview=1. O link público mostra o contador até segunda-feira.
  const birthdayGate = document.getElementById('birthdayGate');
  const previewMode = new URLSearchParams(window.location.search).get('preview') === '1';
  const birthdayRelease = new Date('2026-10-19T00:00:00-03:00').getTime();
  if (birthdayGate) {
    if (previewMode || Date.now() >= birthdayRelease) {
      birthdayGate.hidden = true;
    } else {
      const gateFields = {
        days: document.getElementById('gateDays'),
        hours: document.getElementById('gateHours'),
        minutes: document.getElementById('gateMinutes'),
        seconds: document.getElementById('gateSeconds')
      };
      const padTime = value => String(value).padStart(2, '0');
      const refreshBirthdayCountdown = () => {
        const remaining = birthdayRelease - Date.now();
        if (remaining <= 0) {
          birthdayGate.hidden = true;
          window.clearInterval(birthdayTimer);
          return;
        }
        const totalSeconds = Math.floor(remaining / 1000);
        gateFields.days.textContent = padTime(Math.floor(totalSeconds / 86400));
        gateFields.hours.textContent = padTime(Math.floor((totalSeconds % 86400) / 3600));
        gateFields.minutes.textContent = padTime(Math.floor((totalSeconds % 3600) / 60));
        gateFields.seconds.textContent = padTime(totalSeconds % 60);
      };
      refreshBirthdayCountdown();
      const birthdayTimer = window.setInterval(refreshBirthdayCountdown, 1000);
    }
  }


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

  // Cantinho do Wal — registros e fotos são guardados no navegador, via IndexedDB.
  const walForm = document.getElementById('walEntryForm');
  const walTitle = document.getElementById('walEntryTitle');
  const walText = document.getElementById('walEntryText');
  const walPhotoInput = document.getElementById('walPhotoFiles');
  const walPreview = document.getElementById('walPhotoPreview');
  const walStatus = document.getElementById('walFormStatus');
  const walEntriesContainer = document.getElementById('walEntries');
  const walEntryCount = document.getElementById('walEntryCount');
  const walClearButton = document.getElementById('clearWalEntry');
  const walMaxPhotos = 6;
  const walMaxPhotoBytes = 12 * 1024 * 1024;
  let pendingWalPhotos = [];
  let pendingWalPreviewUrls = [];
  let savedWalImageUrls = [];
  let walDatabasePromise = null;

  function openWalDatabase() {
    if (walDatabasePromise) return walDatabasePromise;
    walDatabasePromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('Este navegador não oferece armazenamento local compatível.'));
        return;
      }
      const request = window.indexedDB.open('wal-cantinho-db', 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains('entries')) {
          database.createObjectStore('entries', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Não foi possível abrir o cantinho.'));
      request.onblocked = () => reject(new Error('Feche outras abas deste site e tente novamente.'));
    });
    return walDatabasePromise;
  }

  function walReadEntries() {
    return openWalDatabase().then(database => new Promise((resolve, reject) => {
      const transaction = database.transaction('entries', 'readonly');
      const request = transaction.objectStore('entries').getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error || new Error('Não foi possível ler suas lembranças.'));
    }));
  }

  function walWriteEntry(entry) {
    return openWalDatabase().then(database => new Promise((resolve, reject) => {
      const transaction = database.transaction('entries', 'readwrite');
      transaction.objectStore('entries').put(entry);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('Não foi possível guardar este registro.'));
      transaction.onabort = () => reject(transaction.error || new Error('O armazenamento foi interrompido.'));
    }));
  }

  function walDeleteEntry(id) {
    return openWalDatabase().then(database => new Promise((resolve, reject) => {
      const transaction = database.transaction('entries', 'readwrite');
      transaction.objectStore('entries').delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('Não foi possível apagar este registro.'));
    }));
  }

  function setWalStatus(message) {
    if (walStatus) walStatus.textContent = message;
  }

  function revokeWalPreviewUrls() {
    pendingWalPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    pendingWalPreviewUrls = [];
  }

  function renderWalPreviews() {
    if (!walPreview) return;
    revokeWalPreviewUrls();
    walPreview.replaceChildren();
    pendingWalPhotos.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'wal-preview-item';
      const image = document.createElement('img');
      const url = URL.createObjectURL(file);
      pendingWalPreviewUrls.push(url);
      image.src = url;
      image.alt = file.name || 'Foto selecionada';
      image.title = file.name || 'Foto selecionada';
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'wal-preview-remove';
      remove.textContent = '×';
      remove.setAttribute('aria-label', 'Remover ' + (file.name || 'foto') + ' das fotos selecionadas');
      remove.addEventListener('click', () => {
        pendingWalPhotos.splice(index, 1);
        renderWalPreviews();
        setWalStatus('');
      });
      item.append(image, remove);
      walPreview.appendChild(item);
    });
  }

  function createWalEmptyState() {
    const empty = document.createElement('div');
    empty.className = 'wal-empty';
    const star = document.createElement('span');
    star.setAttribute('aria-hidden', 'true');
    star.textContent = '✳';
    const title = document.createElement('p');
    title.textContent = 'Seu cantinho está esperando a primeira lembrança.';
    const detail = document.createElement('small');
    detail.textContent = 'Escreva uma mensagem ou adicione fotos para começar.';
    empty.append(star, title, detail);
    return empty;
  }

  async function renderWalEntries() {
    if (!walEntriesContainer) return;
    savedWalImageUrls.forEach(url => URL.revokeObjectURL(url));
    savedWalImageUrls = [];
    const entries = await walReadEntries();
    entries.sort((a, b) => b.createdAt - a.createdAt);
    walEntryCount.textContent = entries.length + (entries.length === 1 ? ' registro' : ' registros');
    walEntriesContainer.replaceChildren();
    if (entries.length === 0) {
      walEntriesContainer.appendChild(createWalEmptyState());
      return;
    }
    entries.forEach(entry => {
      const card = document.createElement('article');
      card.className = 'wal-entry-card';
      const meta = document.createElement('div');
      meta.className = 'wal-entry-meta';
      const date = document.createElement('time');
      date.dateTime = new Date(entry.createdAt).toISOString();
      date.textContent = new Date(entry.createdAt).toLocaleString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'wal-entry-delete';
      remove.textContent = 'Apagar registro';
      remove.addEventListener('click', async () => {
        if (!window.confirm('Apagar esta lembrança deste navegador?')) return;
        try {
          await walDeleteEntry(entry.id);
          setWalStatus('Registro apagado do seu cantinho.');
          await renderWalEntries();
        } catch (error) {
          setWalStatus('Não foi possível apagar agora. Tente novamente.');
        }
      });
      meta.append(date, remove);
      card.appendChild(meta);
      const heading = document.createElement('h4');
      heading.textContent = entry.title || 'Uma lembrança do Wal';
      card.appendChild(heading);
      if (entry.text) {
        const paragraph = document.createElement('p');
        paragraph.className = 'wal-entry-text';
        paragraph.textContent = entry.text;
        card.appendChild(paragraph);
      }
      if (entry.photos && entry.photos.length) {
        const photos = document.createElement('div');
        photos.className = 'wal-entry-photos';
        entry.photos.forEach(photo => {
          const button = document.createElement('button');
          button.type = 'button';
          button.setAttribute('aria-label', 'Ampliar foto ' + (photo.name || 'adicionada ao cantinho'));
          const image = document.createElement('img');
          const url = URL.createObjectURL(photo.blob);
          savedWalImageUrls.push(url);
          image.src = url;
          image.alt = photo.name || 'Foto guardada no Cantinho do Wal';
          image.loading = 'lazy';
          button.appendChild(image);
          button.addEventListener('click', () => {
            lightboxImage.src = url;
            lightboxImage.alt = image.alt;
            lightboxCaption.textContent = (entry.title || 'Uma lembrança do Wal') + (photo.name ? ' — ' + photo.name : '');
            if (typeof lightbox.showModal === 'function') lightbox.showModal();
            else lightbox.setAttribute('open', '');
          });
          photos.appendChild(button);
        });
        card.appendChild(photos);
      }
      walEntriesContainer.appendChild(card);
    });
  }

  if (walForm && walPhotoInput && walPreview && walStatus) {
    walPhotoInput.addEventListener('change', () => {
      const chosen = Array.from(walPhotoInput.files || []);
      const accepted = [];
      let rejectedType = false;
      let rejectedSize = false;
      chosen.forEach(file => {
        if (!file.type.startsWith('image/')) { rejectedType = true; return; }
        if (file.size > walMaxPhotoBytes) { rejectedSize = true; return; }
        if (pendingWalPhotos.length + accepted.length >= walMaxPhotos) return;
        accepted.push(file);
      });
      pendingWalPhotos = pendingWalPhotos.concat(accepted);
      renderWalPreviews();
      const messages = [];
      if (accepted.length) messages.push(accepted.length + (accepted.length === 1 ? ' foto adicionada à seleção.' : ' fotos adicionadas à seleção.'));
      if (rejectedType) messages.push('Alguns arquivos não eram imagens e foram ignorados.');
      if (rejectedSize) messages.push('Cada foto precisa ter no máximo 12 MB.');
      if (pendingWalPhotos.length >= walMaxPhotos && chosen.length > accepted.length) messages.push('Cada registro permite até 6 fotos.');
      setWalStatus(messages.join(' '));
      walPhotoInput.value = '';
    });

    walClearButton.addEventListener('click', () => {
      walForm.reset();
      pendingWalPhotos = [];
      renderWalPreviews();
      setWalStatus('');
    });

    walForm.addEventListener('submit', async event => {
      event.preventDefault();
      const title = walTitle.value.trim();
      const text = walText.value.trim();
      if (!text && pendingWalPhotos.length === 0) {
        setWalStatus('Escreva alguma coisa ou adicione pelo menos uma foto.');
        return;
      }
      const saveButton = walForm.querySelector('button[type="submit"]');
      saveButton.disabled = true;
      saveButton.style.opacity = '.7';
      setWalStatus('Guardando sua lembrança...');
      const entry = {
        id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9),
        title: title,
        text: text,
        createdAt: Date.now(),
        photos: pendingWalPhotos.map(file => ({ name: file.name, type: file.type, blob: file }))
      };
      try {
        await walWriteEntry(entry);
        walForm.reset();
        pendingWalPhotos = [];
        renderWalPreviews();
        await renderWalEntries();
        setWalStatus('Pronto! Sua lembrança ficou guardada neste navegador.');
      } catch (error) {
        setWalStatus('Não consegui guardar. O navegador pode estar sem espaço disponível; tente usar menos fotos.');
      } finally {
        saveButton.disabled = false;
        saveButton.style.opacity = '';
      }
    });

    renderWalEntries().catch(() => {
      setWalStatus('O armazenamento deste navegador não está disponível. Tente abrir o site em outro navegador atualizado.');
    });
  }

})();