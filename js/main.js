/**
 * Talonex Data Centre & AI Infrastructure Kenya
 * Vanilla JavaScript Functionality
 * - Accessible mobile navigation drawer
 * - Header scroll state observer
 * - Form validation and documented submission handler
 * - Active page link highlighting
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Toggle
  const navToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-zone');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isExpanded));
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('mobile-open');
    });

    // Close menu on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('mobile-open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('open');
        navMenu.classList.remove('mobile-open');
        navToggle.focus();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target) && navMenu.classList.contains('mobile-open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('open');
        navMenu.classList.remove('mobile-open');
      }
    });
  }

  // 2. Header elevation on scroll
  const header = document.querySelector('.site-header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // 3. Contact Form Validation and Mock Handler
  const contactForm = document.getElementById('talonex-contact-form');
  if (contactForm) {
    const formAlert = document.getElementById('form-status-alert');
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Clear previous states
      let hasErrors = false;
      const requiredInputs = contactForm.querySelectorAll('[required]');
      
      requiredInputs.forEach((input) => {
        const errorElement = document.getElementById(`${input.id}-error`);
        if (!input.value.trim()) {
          input.setAttribute('aria-invalid', 'true');
          if (errorElement) errorElement.classList.add('visible');
          hasErrors = true;
        } else {
          input.setAttribute('aria-invalid', 'false');
          if (errorElement) errorElement.classList.remove('visible');
        }
      });

      // Email format validation
      const emailInput = document.getElementById('email');
      const emailError = document.getElementById('email-error');
      if (emailInput && emailInput.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
          emailInput.setAttribute('aria-invalid', 'true');
          if (emailError) {
            emailError.textContent = 'Please enter a valid email address.';
            emailError.classList.add('visible');
          }
          hasErrors = true;
        }
      }

      if (hasErrors) {
        if (formAlert) {
          formAlert.className = 'form-status-alert error';
          formAlert.textContent = 'Please correct the highlighted fields before submitting.';
          formAlert.style.display = 'flex';
          formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        return;
      }

      // Simulated Submission State
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      // Simulate network latency (700ms)
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send';
        }

        if (formAlert) {
          formAlert.className = 'form-status-alert success';
          formAlert.innerHTML = `
            <div>
              <strong>Enquiry Received.</strong>
              <p style="margin-top:0.25rem; margin-bottom:0; font-size:0.875rem;">
                Thank you for your interest in Talonex. Your enquiry has been received and routed to Barwasim Africa Consulting Ltd (project proponent). Our project development team will review your requirements and respond shortly.
              </p>
            </div>
          `;
          formAlert.style.display = 'flex';
          formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        contactForm.reset();
      }, 700);
    });

    // Real-time error dismissal on input
    contactForm.querySelectorAll('input, select, textarea').forEach((field) => {
      field.addEventListener('input', () => {
        field.setAttribute('aria-invalid', 'false');
        const errorElement = document.getElementById(`${field.id}-error`);
        if (errorElement) errorElement.classList.remove('visible');
      });
    });
  }

  // 4. Ensure clean URL in address bar if .html extension is present
  const rawPath = window.location.pathname;
  if (rawPath.endsWith('.html')) {
    let cleanPath = rawPath.replace(/\.html$/, '');
    if (cleanPath === '/index') cleanPath = '/';
    const newUrl = cleanPath + window.location.search + window.location.hash;
    window.history.replaceState(null, '', newUrl);
  }

  // 5. Highlight active nav link based on clean location pathname
  const normalizedPath = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach((link) => {
    let href = link.getAttribute('href') || '';
    // Strip hash/query and trailing slashes for matching
    href = href.split('#')[0].split('?')[0].replace(/\.html$/, '').replace(/\/$/, '') || '/';
    if (href === normalizedPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

