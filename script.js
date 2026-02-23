// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  if (themeToggle) themeToggle.textContent = dark ? '☀️' : '🌙';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme === 'dark' || (!savedTheme && prefersDark));
if (themeToggle) themeToggle.addEventListener('click', () => applyTheme(!document.body.classList.contains('dark')));

// Mobile nav
const hamburger = document.querySelector('.nav-hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
}

// Active nav link
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });
})();

// Course search & filter (only on pages with .courses-grid)
const grid = document.querySelector('.courses-grid');
if (grid) {
  const searchInput = document.getElementById('search-input');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const noResults = document.querySelector('.no-results');
  let activeCategory = 'all';

  function filterCourses() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const cards = grid.querySelectorAll('.course-card');
    let visible = 0;
    cards.forEach(card => {
      const title = card.dataset.title || '';
      const category = card.dataset.category || '';
      const matchesSearch = !query || title.toLowerCase().includes(query);
      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      const show = matchesSearch && matchesCategory;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (noResults) noResults.classList.toggle('show', visible === 0);
  }

  if (searchInput) searchInput.addEventListener('input', filterCourses);
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      filterCourses();
    });
  });
}
