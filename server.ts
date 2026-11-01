import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import net from 'net';
import { fileURLToPath } from 'url';
import { app } from './app.js';
import { isMailConfigured } from './mailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// ==========================================
// 5. Server Mount: Vite Middleware in Dev, Static in Prod
// ==========================================
function isPortInUse(port: number, host: string = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(400);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function findAvailablePort(startPort: number, host: string = '127.0.0.1'): Promise<number> {
  let port = startPort;
  while (await isPortInUse(port, host)) {
    console.warn(`[MuQore Server] Port ${port} is currently in use by another application. Trying port ${port + 1}...`);
    port++;
    if (port > startPort + 20) {
      throw new Error(`Unable to find an open port between ${startPort} and ${port}`);
    }
  }
  return port;
}

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback handler for all non-API GET requests in dev mode to serve index.html with Vite transforms
    app.use('*', async (req: Request, res: Response, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const HOST = process.env.HOST || '0.0.0.0';
  const targetPort = await findAvailablePort(PORT, '127.0.0.1');

  const server = app.listen(targetPort, HOST, () => {
    if (!isMailConfigured()) {
      console.warn('  [MuQore Server] Email is NOT configured: contact and quote forms will show an error until SMTP_USER and SMTP_PASS are set in .env');
    }
    console.log(`\n  [MuQore Server] Running successfully:`);
    console.log(`  ➜  Local:   http://localhost:${targetPort}/`);
    console.log(`  ➜  Network: http://127.0.0.1:${targetPort}/\n`);
  });

  server.on('error', (err: any) => {
    console.error('[MuQore Server Error]:', err);
  });
}

process.on('uncaughtException', (err) => {
  console.error('[MuQore Uncaught Exception]:', err);
});

startServer().catch((err) => {
  console.error('[MuQore Startup Failure]:', err);
  process.exit(1);
});
