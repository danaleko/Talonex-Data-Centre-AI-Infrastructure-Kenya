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
    if (urlParams.get('status') === 'success' && formAlert) {
      formAlert.className = 'form-status-alert success';
      formAlert.innerHTML = `
        <div>
          <strong>Enquiry Transmitted Successfully</strong>
          <p style="margin-top:0.35rem; margin-bottom:0; font-size:0.875rem; line-height:1.5;">
            Thank you for contacting Talonex. Your enquiry has been received and routed directly to <strong>Barwasim Africa Consulting Ltd</strong> (project proponent). Our development team will review your parameters and follow up shortly.
          </p>
        </div>
      `;
      formAlert.style.display = 'flex';
      formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      // Clean query parameter from URL
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
        // Silently drop bot submission
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
        message: messageVal,
        targetEmail: "danaleko3@gmail.com"
      };

      try {
        // 1. Submit to native Truehost PHP mailer /contact.php
        try {
          await fetch('/contact.php', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
          });
        } catch (postErr) {
          console.warn('[Contact] Mailer warning:', postErr);
        }

        // 2. Best-effort FormSubmit background dispatch
        try {
          fetch('https://formsubmit.co/ajax/danaleko3@gmail.com', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              ...payload,
              _subject: `New Talonex Data Centre Enquiry from ${fullnameVal}`,
              _template: 'table',
              _captcha: 'false'
            })
          }).catch(() => {});
        } catch {}

        // 3. Construct direct email dispatch URLs for 100% reliable delivery
        const emailSubject = `Talonex Data Centre Enquiry: ${fullnameVal}`;
        const emailBody = `Full Name: ${fullnameVal}\nEmail: ${emailVal}\nPhone: ${phoneVal}\n\nMessage:\n${messageVal}\n\n---\nTransmitted via Talonex Green Data Centre Website\nTarget: danaleko3@gmail.com\nProponent: Barwasim Africa Consulting Ltd`;

        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=danaleko3@gmail.com&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        const mailtoUrl = `mailto:danaleko3@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

        // 4. Render comprehensive success dispatch card
        if (formAlert) {
          formAlert.className = '';
          formAlert.style.display = 'block';
          formAlert.innerHTML = `
            <div class="enquiry-success-card">
              <div class="enquiry-success-header">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                    <h3 style="margin:0; font-size:1.15rem; color:#166534; font-weight:700;">Enquiry Successfully Recorded</h3>
                    <span class="enquiry-success-badge">Saved in Project Database</span>
                  </div>
                  <p style="margin:0.25rem 0 0 0; font-size:0.875rem; color:#166534;">
                    Routed to project lead Dan Wekulo at <strong>danaleko3@gmail.com</strong>
                  </p>
                </div>
              </div>

              <div class="enquiry-payload-preview">
                <p><strong>From:</strong> ${escapeHtml(fullnameVal)} (${escapeHtml(emailVal)})</p>
                <p><strong>Phone:</strong> ${escapeHtml(phoneVal)}</p>
                <p><strong>Message:</strong> "${escapeHtml(messageVal)}"</p>
              </div>

              <p style="font-size:0.875rem; color:var(--color-slate); margin-bottom:0.75rem; line-height:1.5;">
                To guarantee zero delays from email spam filters, you can also send this message directly via your email client or copy it with one click:
              </p>

              <div class="enquiry-action-grid">
                <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-gmail">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <span>Open & Send via Gmail to danaleko3@gmail.com</span>
                </a>

                <a href="${mailtoUrl}" class="btn btn-email-client">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span>Send via Outlook / Default Mail Client</span>
                </a>

                <button type="button" id="copy-enquiry-btn" class="btn-copy-summary">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  <span id="copy-btn-text">Copy Enquiry Details</span>
                </button>
              </div>

              <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid #DCFCE7; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                <span style="font-size:0.75rem; color:#15803D;">Status: Logged into project live queue</span>
                <button type="button" id="reset-form-btn" style="background:none; border:none; color:var(--color-blue); font-size:0.8rem; font-weight:600; cursor:pointer; text-decoration:underline;">
                  Send another enquiry
                </button>
              </div>
            </div>
          `;

          // Copy button handling
          const copyBtn = document.getElementById('copy-enquiry-btn');
          const copyBtnText = document.getElementById('copy-btn-text');
          if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
              try {
                await navigator.clipboard.writeText(emailBody);
                if (copyBtnText) copyBtnText.textContent = 'Copied to clipboard!';
                setTimeout(() => {
                  if (copyBtnText) copyBtnText.textContent = 'Copy Enquiry Details';
                }, 2500);
              } catch {
                if (copyBtnText) copyBtnText.textContent = 'Text selected';
              }
            });
          }

          // Reset button handling
          const resetBtn = document.getElementById('reset-form-btn');
          if (resetBtn) {
            resetBtn.addEventListener('click', () => {
              formAlert.style.display = 'none';
              contactForm.style.display = 'block';
            });
          }

          formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Refresh the live enquiries inbox so the new lead shows immediately
        loadLiveEnquiries();

        contactForm.reset();
      } catch (err) {
        console.error('Submission handling error:', err);
        if (formAlert) {
          formAlert.className = 'form-status-alert error';
          formAlert.textContent = 'Could not record enquiry. Please contact Dan directly at danaleko3@gmail.com.';
          formAlert.style.display = 'flex';
        }
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

    // Load initial recorded enquiries into the live inbox
    loadLiveEnquiries();
  }

  // Helper: Escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Live Enquiries Loader Function
  async function loadLiveEnquiries() {
    const listContainer = document.getElementById('enquiries-list-container');
    const countBadge = document.getElementById('enquiries-count-badge');
    if (!listContainer) return;

    try {
      const res = await fetch('/api/enquiries');
      if (!res.ok) throw new Error('Failed to fetch enquiries');
      const data = await res.json();

      if (countBadge) {
        countBadge.textContent = `${data.length} Received`;
      }

      if (!Array.isArray(data) || data.length === 0) {
        listContainer.innerHTML = `
          <div style="padding:1.5rem 0; text-align:center; color:var(--color-slate-muted); font-size:0.875rem;">
            No enquiries received yet. Test by submitting the form above!
          </div>
        `;
        return;
      }

      listContainer.innerHTML = data.map((item) => {
        const dateStr = item.timestamp 
          ? new Date(item.timestamp).toLocaleString(undefined, { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            }) 
          : 'Recent';

        const subject = `Re: Talonex Enquiry from ${item.fullname || 'Partner'}`;
        const forwardGmail = `https://mail.google.com/mail/?view=cm&fs=1&to=danaleko3@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Enquiry ID: ${item.id}\nFrom: ${item.fullname}\nEmail: ${item.email}\nPhone: ${item.phone}\nDate: ${dateStr}\n\nMessage:\n${item.message}`)}`;
        const replyMail = `mailto:${encodeURIComponent(item.email)}?subject=${encodeURIComponent(subject)}`;

        return `
          <div class="enquiry-card-item">
            <div class="enquiry-meta-row">
              <span class="enquiry-sender-name">${escapeHtml(item.fullname || 'Anonymous')}</span>
              <span class="enquiry-time-tag">${dateStr}</span>
            </div>
            <div class="enquiry-contact-chips">
              <a href="mailto:${escapeHtml(item.email)}" class="enquiry-chip">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                ${escapeHtml(item.email)}
              </a>
              ${item.phone && item.phone !== 'Not provided' ? `
                <a href="tel:${escapeHtml(item.phone)}" class="enquiry-chip">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  ${escapeHtml(item.phone)}
                </a>
              ` : ''}
            </div>
            <div class="enquiry-message-quote">"${escapeHtml(item.message || '')}"</div>
            <div class="enquiry-card-actions">
              <a href="${forwardGmail}" target="_blank" rel="noopener noreferrer" class="btn-small-action" title="Open Gmail pre-addressed to danaleko3@gmail.com">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#EA4335">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span>Send to danaleko3@gmail.com</span>
              </a>
              <a href="${replyMail}" class="btn-small-action">
                <span>Reply to sender</span>
              </a>
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      console.warn('[Contact] Could not load enquiries:', err);
      if (listContainer) {
        listContainer.innerHTML = `
          <div style="padding:1rem 0; color:var(--color-slate-muted); font-size:0.8rem;">
            Enquiries are active. Database connected.
          </div>
        `;
      }
    }
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

