import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function cleanUrlsPlugin(): Plugin {
  const routes: Record<string, string> = {
    '/about': '/about.html',
    '/campus': '/campus.html',
    '/the-campus': '/campus.html',
    '/services': '/campus.html',
    '/contact': '/contact.html',
  };

  return {
    name: 'clean-urls-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();
        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname.replace(/\/$/, '') || '/';

        // Handle /api/contact and /contact.php in dev
        if ((pathname === '/api/contact' || pathname === '/contact.php') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              let parsed: Record<string, string> = {};
              try { parsed = JSON.parse(body); } catch {}
              const { fullname, email, phone, message } = parsed;
              const dataDir = path.resolve(server.config.root, 'data');
              if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
              const dataFile = path.join(dataDir, 'enquiries.json');
              let enquiries: unknown[] = [];
              if (fs.existsSync(dataFile)) {
                try { enquiries = JSON.parse(fs.readFileSync(dataFile, 'utf-8')); } catch {}
              }
              enquiries.unshift({
                id: 'enq_' + Date.now(),
                timestamp: new Date().toISOString(),
                targetEmail: 'danaleko3@gmail.com',
                fullname,
                email,
                phone: phone || 'Not provided',
                message
              });
              fs.writeFileSync(dataFile, JSON.stringify(enquiries.slice(0, 100), null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Enquiry recorded successfully' }));
            } catch {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
            }
          });
          return;
        }

        // Handle /api/enquiries in dev
        if (pathname === '/api/enquiries' && req.method === 'GET') {
          const dataFile = path.resolve(server.config.root, 'data', 'enquiries.json');
          res.setHeader('Content-Type', 'application/json');
          if (fs.existsSync(dataFile)) {
            res.end(fs.readFileSync(dataFile, 'utf-8'));
          } else {
            res.end('[]');
          }
          return;
        }

        // 301 redirect legacy /index.html to /
        if (pathname === '/index.html') {
          res.writeHead(301, { Location: '/' + (url.search || '') });
          return res.end();
        }

        // 301 redirect legacy .html URLs to clean URLs
        if (pathname.endsWith('.html')) {
          const clean = pathname.replace(/\.html$/, '');
          if (routes[clean]) {
            res.writeHead(301, { Location: clean + (url.search || '') });
            return res.end();
          }
          if (clean === '/404') {
            res.writeHead(301, { Location: '/404' + (url.search || '') });
            return res.end();
          }
        }

        // Internal rewrite for clean URLs to serve the corresponding HTML file
        if (routes[pathname]) {
          req.url = routes[pathname] + (url.search || '');
          return next();
        }

        // Allow root homepage
        if (pathname === '/') {
          return next();
        }

        // Explicit /404 route
        if (pathname === '/404') {
          try {
            const htmlPath = path.resolve(server.config.root, '404.html');
            let html = fs.readFileSync(htmlPath, 'utf-8');
            html = await server.transformIndexHtml(req.url, html);
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.end(html);
          } catch (e) {
            return next(e);
          }
        }

        // Allow Vite internal requests, client scripts and node_modules
        if (
          pathname.startsWith('/@') ||
          pathname.startsWith('/node_modules') ||
          pathname.startsWith('/__vite')
        ) {
          return next();
        }

        // Check if file exists physically on disk in root or public folder
        const rootPath = path.join(server.config.root, pathname);
        const publicDir = server.config.publicDir || path.join(server.config.root, 'public');
        const publicPath = path.join(publicDir, pathname);

        let existsOnDisk = false;
        try {
          if (fs.existsSync(rootPath) && fs.statSync(rootPath).isFile()) {
            existsOnDisk = true;
          } else if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
            existsOnDisk = true;
          }
        } catch {
          existsOnDisk = false;
        }

        if (existsOnDisk) {
          return next();
        }

        // If it's a static file request with an extension (e.g. .png, .css, .js) that was not found
        const ext = path.extname(pathname).toLowerCase();
        if (ext && ext !== '.html' && ext !== '.htm') {
          res.statusCode = 404;
          return res.end('Not found');
        }

        // For any unknown route or unmatched page navigation, serve the custom 404 error page with HTTP status 404
        try {
          const htmlPath = path.resolve(server.config.root, '404.html');
          let html = fs.readFileSync(htmlPath, 'utf-8');
          html = await server.transformIndexHtml(req.url, html);
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.end(html);
        } catch (e) {
          return next(e);
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname.replace(/\/$/, '') || '/';

        if (pathname === '/index.html') {
          res.writeHead(301, { Location: '/' + (url.search || '') });
          return res.end();
        }

        if (pathname.endsWith('.html')) {
          const clean = pathname.replace(/\.html$/, '');
          if (routes[clean]) {
            res.writeHead(301, { Location: clean + (url.search || '') });
            return res.end();
          }
          if (clean === '/404') {
            res.writeHead(301, { Location: '/404' + (url.search || '') });
            return res.end();
          }
        }

        if (routes[pathname]) {
          req.url = routes[pathname] + (url.search || '');
          return next();
        }

        if (pathname === '/') {
          return next();
        }

        const distDir = path.resolve(server.config.root, 'dist');
        const distFile = path.join(distDir, pathname);
        if (fs.existsSync(distFile) && fs.statSync(distFile).isFile()) {
          return next();
        }

        const dist404 = path.resolve(distDir, '404.html');
        if (fs.existsSync(dist404)) {
          const html = fs.readFileSync(dist404, 'utf-8');
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.end(html);
        }

        res.statusCode = 404;
        res.end('Not found');
      });
    },
  };
}

function suppressHmrWsPlugin(): Plugin {
  return {
    name: 'suppress-hmr-ws-plugin',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const mockScript = `<script>
(function() {
  var OriginalWS = window.WebSocket;
  if (!OriginalWS) return;
  function MockWebSocket(url, protocols) {
    if (protocols === 'vite-hmr' || (typeof url === 'string' && (url.indexOf('token=') !== -1 || url.indexOf('vite') !== -1))) {
      return {
        OPEN: 1,
        CLOSED: 3,
        readyState: 1,
        addEventListener: function() {},
        removeEventListener: function() {},
        send: function() {},
        close: function() {},
        onopen: null,
        onmessage: null,
        onerror: null,
        onclose: null
      };
    }
    return new OriginalWS(url, protocols);
  }
  MockWebSocket.prototype = OriginalWS.prototype;
  MockWebSocket.OPEN = 1;
  MockWebSocket.CLOSED = 3;
  window.WebSocket = MockWebSocket;
})();
</script>`;
        return html.replace(/<head>/i, '<head>\n    ' + mockScript);
      },
    },
  };
}

export default defineConfig(() => {
  return {
    appType: 'mpa' as const,
    plugins: [cleanUrlsPlugin(), suppressHmrWsPlugin()],
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(import.meta.dirname, 'index.html'),
          about: path.resolve(import.meta.dirname, 'about.html'),
          campus: path.resolve(import.meta.dirname, 'campus.html'),
          contact: path.resolve(import.meta.dirname, 'contact.html'),
          notFound: path.resolve(import.meta.dirname, '404.html'),
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: false,
      watch: null,
    },
  };
});
