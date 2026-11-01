'use strict';
// Storage can be denied (private windows, quotas, user settings). The UI still works.
function readPreference(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function writePreference(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}
const themeButton = document.querySelector('#theme-toggle');
const initialTheme = readPreference('mof-theme', 'light');
function setTheme(dark) {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.textContent = dark ? 'Light mode' : 'Dark mode';
}
setTheme(initialTheme === 'dark');
themeButton.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  setTheme(dark);
  writePreference('mof-theme', dark ? 'dark' : 'light');
});

const cards = [...document.querySelectorAll('.photo-card')];
if (cards.length) {
  const stored = readPreference('mof-saved', []);
  const saved = new Set(Array.isArray(stored) ? stored.filter(id => typeof id === 'string') : []);
  const search = document.querySelector('#photo-search');
  const filters = [...document.querySelectorAll('[data-filter]')];
  const status = document.querySelector('#result-count');
  const announce = document.querySelector('#announcement');
  const dialog = document.querySelector('#lightbox');
  const image = document.querySelector('#lightbox-image');
  const title = document.querySelector('#lightbox-title');
  const caption = document.querySelector('#lightbox-caption');
  const position = document.querySelector('#lightbox-position');
  let activeFilter = 'all';
  let activeIndex = 0;
  let opener = null;
  const parameter = new URLSearchParams(location.search).get('collection');
  if (['neighborhood', 'parks', 'saved'].includes(parameter)) activeFilter = parameter;

  function visibleCards() { return cards.filter(card => !card.hidden); }
  function updateGallery() {
    const query = search.value.trim().toLocaleLowerCase();
    for (const card of cards) {
      const isSaved = saved.has(card.dataset.photo);
      const match = activeFilter === 'all' ||
        (activeFilter === 'saved' ? isSaved : card.dataset.category === activeFilter);
      card.hidden = !match || !card.dataset.search.toLocaleLowerCase().includes(query);
      const save = card.querySelector('[data-save]');
      const cardTitle = card.querySelector('h3').textContent;
      save.setAttribute('aria-pressed', String(isSaved));
      save.setAttribute('aria-label', `${isSaved ? 'Unsave' : 'Save'} ${cardTitle}`);
      save.textContent = isSaved ? 'Saved ✓' : 'Save photograph';
    }
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter)));
    const count = visibleCards().length;
    status.textContent = `${count} ${count === 1 ? 'photograph' : 'photographs'}${query ? ' matching your search' : ''}`;
    document.querySelector('#empty-state').hidden = count !== 0;
    document.querySelector('#saved-count').textContent = cards.filter(card => saved.has(card.dataset.photo)).length;
  }
  document.querySelector('.gallery-tools').addEventListener('submit', event => event.preventDefault());
  search.addEventListener('input', updateGallery);
  filters.forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    updateGallery();
  }));
  document.querySelector('#reset-filters').addEventListener('click', () => {
    activeFilter = 'all'; search.value = ''; updateGallery(); search.focus();
  });
  cards.forEach(card => {
    card.querySelector('[data-save]').addEventListener('click', event => {
      const id = card.dataset.photo;
      const remove = saved.has(id);
      if (remove) saved.delete(id); else saved.add(id);
      const persisted = writePreference('mof-saved', [...saved]);
      announce.textContent = `${card.querySelector('h3').textContent} ${remove ? 'removed from' : 'added to'} saved photographs.${persisted ? '' : ' Storage is unavailable; this change lasts for this page only.'}`;
      updateGallery();
      if (card.hidden) document.querySelector('[data-filter="saved"]').focus();
    });
    card.querySelector('[data-open]').addEventListener('click', event => {
      opener = event.currentTarget;
      activeIndex = visibleCards().indexOf(card);
      showPhoto();
      dialog.showModal();
      document.body.classList.add('modal-open');
      document.querySelector('#close-lightbox').focus();
    });
  });
  function showPhoto() {
    const visible = visibleCards();
    if (!visible.length) return;
    activeIndex = (activeIndex + visible.length) % visible.length;
    const card = visible[activeIndex];
    const thumbnail = card.querySelector('img');
    image.src = thumbnail.src;
    image.alt = thumbnail.alt;
    title.textContent = card.querySelector('h3').textContent;
    caption.textContent = thumbnail.alt;
    position.textContent = `${activeIndex + 1} of ${visible.length}`;
  }
  function movePhoto(step) { activeIndex += step; showPhoto(); }
  document.querySelector('#previous-photo').addEventListener('click', () => movePhoto(-1));
  document.querySelector('#next-photo').addEventListener('click', () => movePhoto(1));
  document.querySelector('#close-lightbox').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); movePhoto(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    if (opener && !opener.closest('.photo-card').hidden) opener.focus();
  });
  updateGallery();
}
