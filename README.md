# Talonex – Data Centre & AI Infrastructure in Kenya

A professional, SEO-first, 4-page static corporate website for **Talonex**, a proposed enterprise data centre and AI infrastructure development project in Kenya.

Built with **plain semantic HTML5, modern CSS3, and lightweight vanilla JavaScript** (zero external frameworks or runtime overhead), achieving near-perfect Core Web Vitals, full accessibility (WCAG AA), and comprehensive search engine optimization.

---

## 1. Project Overview & Pages

- **Home (`/`)**: Broad overview of the proposed data centre campus, AI & HPC compute zones, green energy alignment with Kenya's renewable grid, and East African digital connectivity.
- **About (`/about`)**: Project background, strategic alignment with Kenya's digital ecosystem, phased development methodology, core design principles, and transparent status disclosures.
- **Services (`/services`)**: Detailed technical overview of proposed solutions—enterprise colocation, AI/HPC high-density halls, renewable power strategy, closed-loop thermal cooling, carrier neutrality, and build-to-suit partnerships.
- **Contact Us (`/contact`)**: Accessible stakeholder contact form, project development office details, inquiry focus areas, and documented integration guides.
- **404 Not Found (`/404`)**: Branded recovery page directing users back to primary navigation targets.

---

## 2. Technology & Brand Standards

- **Typography**: Google Fonts **Montserrat** (weights 300, 400, 500, 600, 700, 800) with `font-display: swap`.
- **Palette**:
  - **Navy** (`#071A4A`): Headings, titles, primary brand anchors.
  - **Blue** (`#006CB7`): Interactive elements, buttons, links, accents.
  - **Slate** (`#35465B`): Descriptions, body text, readable prose.
  - **Mint** (`#60DCA3`): Accents and highlights on navy surfaces.
  - **Light Neutrals** (`#F8FAFC`, `#EEF2F6`, `#FFFFFF`): Clean contrast backgrounds.
- **Responsive Layout**: Fluid breakpoints tailored for Mobile (<768px), Tablet (768px–1024px), Laptop/Desktop (>1024px).
- **Accessibility**: Skip-to-content links, visible `:focus-visible` rings, semantic heading hierarchy, single H1 per page, ARIA controls on interactive elements, and `prefers-reduced-motion` compliance.

---

## 3. Directory Structure

```text
├── index.html                   # Home page (Data Centre & AI Infrastructure in Kenya)
├── about.html                   # About page (Project Background & Governance)
├── services.html                # Services page (Proposed Infrastructure Solutions)
├── contact.html                 # Contact Us page (Accessible Inquiry Form)
├── 404.html                     # Branded 404 error page
├── sitemap.xml                  # XML sitemap for search engine crawlers
├── robots.txt                   # Search crawler directives
├── css/
│   └── styles.css               # Shared CSS3 design system with CSS custom properties
├── js/
│   └── main.js                  # Vanilla JavaScript (nav drawer, validation, scroll effects)
├── assets/
│   ├── icons/
│   │   └── favicon.svg          # High-resolution SVG favicon
│   └── images/
│       ├── talonex-logo.svg     # Brand vector logo (light backgrounds)
│       ├── talonex-logo-white.svg # Brand vector logo (dark backgrounds)
│       ├── kenya-data-centre-campus.jpg # Campus architectural rendering
│       ├── ai-hpc-infrastructure-kenya.jpg # High-density AI server hall
│       ├── sustainable-energy-cooling.jpg  # Renewable solar & cooling array
│       ├── kenya-digital-connectivity.jpg  # Subsea cable & fiber routing
│       └── talonex-og-social.jpg           # OpenGraph & Twitter social card
├── package.json                 # Project configuration & build runner
├── tsconfig.json                # TypeScript configuration
└── vite.config.ts               # Multi-page build configuration
```

---

## 4. Search Engine Optimization (SEO) Architecture

### Primary Keyword Targeting
- `Data centre in Kenya`
- `Data centre infrastructure Kenya`
- `Data centre development Kenya`
- `AI infrastructure Kenya`
- `Data centre solutions Kenya`
- `Digital infrastructure Kenya`
- `Sustainable data centres`
- `Renewable energy for data centres`
- `High-performance computing infrastructure`
- `East Africa digital infrastructure`

### Technical SEO Implementations
1. **Unique Titles & Meta Descriptions**: Custom-written for every page matching search intent without keyword stuffing.
2. **Canonical Links**: Declared on every page pointing to `https://talon-ex.com/`.
3. **OpenGraph & Twitter Card Tags**: Configured with 1200x630 branded sharing previews.
4. **Structured Data (JSON-LD)**:
   - `WebSite` & `Organization` schema on the homepage.
   - `AboutPage` and `BreadcrumbList` on the about page.
   - `WebPage` and `BreadcrumbList` on services and contact pages.
5. **Image Optimization**:
   - Meaningful, non-stuffed alt text on all informative visuals.
   - Explicit `width` and `height` dimensions to prevent Cumulative Layout Shift (CLS).
   - `fetchpriority="high"` on hero visuals and `loading="lazy"` on below-the-fold media.

---

## 5. Contact Form Integration Guide

The contact form in `contact.html` is built with semantic form controls, client-side HTML5 validation, and custom JavaScript validation that handles required fields, email formatting, and simulated network states.

### Connecting to a Production Form Backend

To connect the form to an active email processing service, you can use any static form endpoint:

#### Option A: Formspree
1. Create a form at [formspree.io](https://formspree.io)
2. In `contact.html`, set:
   ```html
   <form action="https://formspree.io/f/{your-id}" method="POST" id="talonex-contact-form">
   ```
3. Update `js/main.js` to let the native `POST` handle the redirect, or use `fetch()` to post JSON directly.

#### Option B: Enterprise API / Serverless Function
If routing to an AWS Lambda / Cloud Run / Express backend:
1. In `js/main.js`, replace the `setTimeout()` simulation block with:
   ```javascript
   const formData = new FormData(contactForm);
   const response = await fetch('/api/contact', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(Object.fromEntries(formData))
   });
   ```

---

## 6. Search Console Submission Workflow

Once the live domain (`talon-ex.com`) has been DNS-configured and deployed:

1. **Google Search Console**:
   - Log into [Google Search Console](https://search.google.com/search-console).
   - Add property via Domain verification (DNS TXT record).
   - Under **Sitemaps**, enter `sitemap.xml` and click **Submit**.
2. **Bing Webmaster Tools**:
   - Log into [Bing Webmaster Tools](https://www.bing.com/webmasters).
   - Import verification from Google Search Console or use DNS verification.
   - Submit `https://talon-ex.com/sitemap.xml`.
3. **Verify Indexation**:
   - Use URL Inspection tool to confirm mobile-friendly render and valid JSON-LD detection.
