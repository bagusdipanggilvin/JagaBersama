document.addEventListener('DOMContentLoaded', () => {
  // Mobile Hamburger Toggle
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('active');
      navMenu.classList.toggle('open');
    });
  }

  // Handle Tab Switch / Hash Routing
  const handleRoute = () => {
    // Collapse mobile hamburger on click
    if (hamburgerBtn && navMenu) {
      hamburgerBtn.classList.remove('active');
      navMenu.classList.remove('open');
    }

    let hash = window.location.hash || '#beranda';
    if (hash === '#/') hash = '#beranda';

    // Hide all page sections
    document.querySelectorAll('.page-section').forEach(sec => {
      sec.classList.add('hidden');
    });

    // Show correct section
    const targetId = `sec-${hash.replace('#', '')}`;
    const targetSec = document.getElementById(targetId);
    if (targetSec) {
      targetSec.classList.remove('hidden');
    } else {
      document.getElementById('sec-beranda').classList.remove('hidden');
    }

    // Update active nav menu links styling
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === hash) {
        a.classList.add('active');
      }
    });

    // Run tab-specific triggers
    if (hash === '#quiz') {
      Quiz.resetQuiz();
    }
  };

  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('load', handleRoute);

  // Stagger word animation in Hero
  const textEl = document.querySelector('.stagger-text');
  if (textEl) {
    const text = textEl.textContent.trim();
    const words = text.split(' ');
    textEl.innerHTML = '';
    words.forEach((word, idx) => {
      const span = document.createElement('span');
      span.className = 'stagger-word';
      span.style.animationDelay = `${idx * 0.15}s`;
      span.textContent = word + ' ';
      textEl.appendChild(span);
    });
  }

  // Pre-fill bullying type from education grid buttons
  document.querySelectorAll('.btn-lapor-bentuk').forEach(btn => {
    btn.addEventListener('click', () => {
      const bentuk = btn.getAttribute('data-bentuk');
      const selectTipe = document.getElementById('repTipe');
      if (selectTipe) {
        selectTipe.value = bentuk;
      }
      window.location.hash = '#lapor';
    });
  });

  // Global Toast function
  window.showToast = (message, type = 'info') => {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      toast.addEventListener('animationend', () => toast.remove());
    }, 4000);
  };
});
