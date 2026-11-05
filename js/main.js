/**
 * Talonex Data Centre & AI Infrastructure Kenya
 * Vanilla JavaScript Functionality
 * - Accessible mobile navigation drawer
 * - Header scroll state observer
 * - Active page link highlighting
 * - Scroll-triggered reveal animations
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
      '.contact-cards-container > div',
      '.op-excellence-grid > div'
    ];

    const elementsToReveal = document.querySelectorAll(revealSelectors.join(', '));

    // Apply subtle rhythmic stagger delays (60ms) to adjacent siblings within multi-item grids
    const gridContainers = document.querySelectorAll(
      '.cards-grid-2, .cards-grid-3, .cards-grid-4, .arch-grid, .stage-grid, .structure-trio-row, .split-feature, .op-excellence-grid, .contact-cards-container'
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

