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
    const closeMobileMenu = () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.classList.remove('open');
      navMenu.classList.remove('mobile-open');
      document.body.classList.remove('mobile-menu-active');
    };

    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isExpanded));
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('mobile-open');
      document.body.classList.toggle('mobile-menu-active', !isExpanded);
    });

    // Close menu on link click
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close menu on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('mobile-open')) {
        closeMobileMenu();
        navToggle.focus();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target) && navMenu.classList.contains('mobile-open')) {
        closeMobileMenu();
      }
    });

    // Close menu on screen resize beyond mobile/tablet breakpoint
    window.addEventListener('resize', () => {
      if (window.innerWidth > 991 && navMenu.classList.contains('mobile-open')) {
        closeMobileMenu();
      }
    }, { passive: true });
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
    const nextUrlInput = document.getElementById('form-next-url');

    // Populate fallback return URL for native submission
    if (nextUrlInput) {
      nextUrlInput.value = window.location.origin + window.location.pathname + '?status=success';
    }

    // Check if redirected back after fallback submission
    const urlParams = new URLSearchParams(window.location.search);
    if ((urlParams.get('status') === 'success' || urlParams.get('submitted') === 'true') && formAlert) {
      formAlert.className = 'form-status-alert success';
      formAlert.innerHTML = `
        <div>
          <strong>Enquiry Transmitted Successfully</strong>
          <p style="margin-top:0.35rem; margin-bottom:0; font-size:0.875rem; line-height:1.5;">
            Thank you for contacting Talonex. Your enquiry has been received and our project team will review your parameters and follow up shortly.
          </p>
        </div>
      `;
      formAlert.style.display = 'flex';
      formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    contactForm.addEventListener('submit', async (e) => {
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

      // Check honeypot field (anti-spam drop)
      const honeyField = contactForm.querySelector('input[name="_honey"]');
      if (honeyField && honeyField.value.trim() !== '') {
        contactForm.reset();
        return;
      }

      // UI state during submission
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '<span>Send Message</span>';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span>Sending enquiry...</span>
          <svg class="spinner-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke-width="3" stroke="currentColor" stroke-dasharray="32" stroke-linecap="round" fill="none" opacity="0.3"></circle>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 2a10 10 0 0 1 10 10"></path>
          </svg>
        `;
      }

      const fullnameVal = (contactForm.querySelector('#fullname')?.value || '').trim();
      const emailVal = (contactForm.querySelector('#email')?.value || '').trim();
      const phoneVal = (contactForm.querySelector('#phone')?.value || '').trim();
      const messageVal = (contactForm.querySelector('#message')?.value || '').trim();

      const payload = {
        fullname: fullnameVal,
        email: emailVal,
        phone: phoneVal,
        message: messageVal
      };

      try {
        const response = await fetch('/contact.php', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok && (result.success === 'true' || result.success === true || response.status === 200)) {
          if (formAlert) {
            formAlert.className = 'form-status-alert success';
            formAlert.style.display = 'flex';
            formAlert.innerHTML = `
              <div>
                <strong>Enquiry Transmitted Successfully</strong>
                <p style="margin-top:0.35rem; margin-bottom:0; font-size:0.875rem; line-height:1.5;">
                  Thank you for contacting Talonex. Your enquiry has been received and our project team will review your parameters and follow up shortly.
                </p>
              </div>
            `;
            formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          contactForm.reset();
        } else {
          // If AJAX response is not 200, submit form normally to /contact.php
          contactForm.submit();
          return;
        }
      } catch (err) {
        console.warn('Network issue on fetch, submitting form natively:', err);
        contactForm.submit();
        return;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
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

  // 6. Operational Excellence Accordion / Toggle
  const opAccordions = document.querySelectorAll('.op-accordion');
  opAccordions.forEach((accordion) => {
    const items = accordion.querySelectorAll('.op-accordion-item');
    items.forEach((item) => {
      const header = item.querySelector('.op-accordion-header');
      if (!header) return;

      header.addEventListener('click', () => {
        const isCurrentActive = item.classList.contains('active');

        // Close other items in this accordion
        items.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherHeader = otherItem.querySelector('.op-accordion-header');
            if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle clicked item
        if (isCurrentActive) {
          item.classList.remove('active');
          header.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          header.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });

  // 7. Scroll-Triggered Fade & Soft Lift
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealSelectors = [
      '.section-header',
      '.split-feature > div',
      '.cards-grid-2 > .card',
      '.cards-grid-3 > .card',
      '.cards-grid-4 > .card',
      '.arch-grid > *',
      '.stage-grid > .stage-card',
      '.structure-trio-card',
      '.metrics-strip',
      '.dev-table-wrapper',
      '.experience-card',
      '.contact-form-wrapper',
      '.op-excellence-grid > div'
    ];

    const elementsToReveal = document.querySelectorAll(revealSelectors.join(', '));

    // Apply subtle rhythmic stagger delays (60ms) to adjacent siblings within multi-item grids
    const gridContainers = document.querySelectorAll(
      '.cards-grid-2, .cards-grid-3, .cards-grid-4, .arch-grid, .stage-grid, .structure-trio-row, .split-feature, .op-excellence-grid'
    );
    gridContainers.forEach((container) => {
      Array.from(container.children).forEach((child, index) => {
        child.style.transitionDelay = `${index * 60}ms`;
      });
    });

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
          entry.target.addEventListener('transitionend', () => {
            entry.target.style.willChange = 'auto';
            entry.target.style.transitionDelay = '';
          }, { once: true });
        }
      });
    }, observerOptions);

    elementsToReveal.forEach((el) => {
      el.classList.add('reveal-on-scroll');
      const rect = el.getBoundingClientRect();
      // If already within the initial viewport upon load, reveal immediately without delay
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        requestAnimationFrame(() => {
          el.classList.add('is-revealed');
          el.style.willChange = 'auto';
        });
      } else {
        revealObserver.observe(el);
      }
    });
  }
});

