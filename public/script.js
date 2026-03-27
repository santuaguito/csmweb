/* ============================================
   CSM Web — JavaScript
   Navbar scroll, mobile menu, scroll reveal, form
   ============================================ */


document.addEventListener('DOMContentLoaded', () => {

  // --- Navbar scroll effect ---
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // --- Active nav link ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // --- Mobile menu ---
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      mobileToggle.innerHTML = isOpen
        ? '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
        : '<svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    });
  }

  // --- Scroll reveal (Intersection Observer) ---
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '-60px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // --- Application form ---
  const form = document.getElementById('application-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formCard = form.closest('.form-card');
      if (formCard) {
        formCard.outerHTML = `
          <div class="form-success glass-card">
            <div class="success-icon">
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3>Solicitud recibida</h3>
            <p>Revisaremos tu aplicación y te contactaremos en las próximas 48 horas si tu proyecto es un buen fit.</p>
          </div>
        `;
      }
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu if open
        if (mobileMenu) mobileMenu.classList.remove('open');
      }
    });
  });

});


// --- Enviar data al back para el envio de correos --- //

document.getElementById("application-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await res.json(); // 👈 CLAVE

    if (!res.ok) {
      alert(result.error || "Error al enviar");
      return;
    }

    alert("Solicitud enviada correctamente 🚀");
    e.target.reset();

  } catch (error) {
    console.error(error);
    alert("Error de conexión");
  }
});





const rateLimit = require("express-rate-limit");

app.use("/api/contact", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
}));


const validator = require("validator");
const safeName = validator.escape(name);
const safeMessage = validator.escape(challenge);
