import fs from 'fs';
import http from 'http';
import path from 'path';
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// /api/contact proxy endpoint
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { fullname, email, phone, message } = req.body;

    if (!fullname || !email || !message) {
      if (req.headers['accept']?.includes('text/html')) {
        return res.redirect('/contact?error=missing_fields');
      }
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    }

    const targetEmail = process.env.CONTACT_EMAIL || 'danaleko3@gmail.com';
    const timestamp = new Date().toISOString();
    const enquiryRecord = {
      id: 'enq_' + Date.now(),
      timestamp,
      targetEmail,
      fullname,
      email,
      phone: phone || 'Not provided',
      message
    };

    // 1. Persist enquiry locally so messages are safely stored
    try {
      const dataDir = path.resolve(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const dataFile = path.join(dataDir, 'enquiries.json');
      let enquiries = [];
      if (fs.existsSync(dataFile)) {
        try {
          enquiries = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
        } catch {
          enquiries = [];
        }
      }
      enquiries.unshift(enquiryRecord);
      fs.writeFileSync(dataFile, JSON.stringify(enquiries.slice(0, 100), null, 2), 'utf-8');
      console.log(`[Contact] Enquiry saved from ${fullname} (${email})`);
    } catch (saveErr) {
      console.error('[Contact] Failed to persist enquiry locally:', saveErr);
    }

    // 2. Respond immediately
    if (req.headers['accept']?.includes('text/html')) {
      return res.redirect('/contact?submitted=true');
    }

    return res.json({ success: true, message: 'Enquiry recorded successfully' });
  } catch (err) {
    console.error('Contact handler error:', err);
    if (req.headers['accept']?.includes('text/html')) {
      return res.redirect('/contact?error=server_error');
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// View recorded enquiries
app.get('/api/enquiries', (_req: Request, res: Response) => {
  try {
    const dataFile = path.resolve(process.cwd(), 'data', 'enquiries.json');
    if (fs.existsSync(dataFile)) {
      const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
      return res.json(data);
    }
  } catch {}
});

async function main() {
  if (isProd) {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));

    const routes: Record<string, string> = {
      '/about': 'about.html',
      '/campus': 'campus.html',
      '/the-campus': 'campus.html',
      '/services': 'campus.html',
      '/contact': 'contact.html',
    };

    app.use((req, res, next) => {
      const cleanPath = req.path.replace(/\/$/, '') || '/';
      if (routes[cleanPath]) {
        return res.sendFile(path.join(distPath, routes[cleanPath]));
      }
      if (cleanPath === '/') {
        return res.sendFile(path.join(distPath, 'index.html'));
      }
      next();
    });

    app.use((_req, res) => {
      const custom404 = path.join(distPath, '404.html');
      if (fs.existsSync(custom404)) {
        res.status(404).sendFile(custom404);
      } else {
        res.status(404).send('Not Found');
      }
    });

    const prodServer = http.createServer(app);
    prodServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Talonex production server running at http://0.0.0.0:${PORT}`);
    });
  } else {
    // Development mode with Vite middleware (HMR disabled to prevent WebSocket connection failures in iframe)
    const devServer = http.createServer(app);

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'mpa',
    });
    app.use(vite.middlewares);

    devServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Talonex dev server running at http://0.0.0.0:${PORT}`);
    });
  }
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
