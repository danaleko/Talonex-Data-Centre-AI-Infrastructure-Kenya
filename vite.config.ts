import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function cleanUrlsPlugin(): Plugin {
  const routes: Record<string, string> = {
    '/about': '/about.html',
    '/services': '/services.html',
    '/contact': '/contact.html',
  };

  return {
    name: 'clean-urls-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();
        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname.replace(/\/$/, '') || '/';

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

export default defineConfig(() => {
  return {
    appType: 'mpa' as const,
    plugins: [cleanUrlsPlugin()],
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(import.meta.dirname, 'index.html'),
          about: path.resolve(import.meta.dirname, 'about.html'),
          services: path.resolve(import.meta.dirname, 'services.html'),
          contact: path.resolve(import.meta.dirname, 'contact.html'),
          notFound: path.resolve(import.meta.dirname, '404.html'),
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
