import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';


/**
 * Serve the Vercel serverless functions in `api/` during `npm run dev`.
 *
 * Without this the API routes only exist under `vercel dev` (which needs a
 * Vercel login), so the Instagram Studio could not verify post ownership and
 * the AI stylist silently fell back to its rule engine while developing.
 * Handlers are loaded through Vite's SSR pipeline, so edits hot-reload.
 */
/** Make .env.local values visible to the dev-only API handlers. */
function loadLocalEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      const raw = fs.readFileSync(path.resolve(__dirname, file), 'utf8');
      for (const line of raw.split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    } catch {
      /* absent is fine */
    }
  }
}

function apiRoutesPlugin(): Plugin {
  return {
    name: 'vite-plugin-local-api',
    configureServer(server) {
      loadLocalEnv();
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next();

        const url = new URL(req.url, 'http://localhost');
        // Nested routes matter: the auth endpoints live at api/auth/*.ts.
        const route = url.pathname.replace(/^\/api\//, '').replace(/\/+$/, '');
        if (!/^[a-zA-Z0-9._-]+(?:\/[a-zA-Z0-9._-]+)*$/.test(route) || route.includes('..')) {
          return next();
        }

        const file = path.resolve(__dirname, 'api', `${route}.ts`);
        if (!file.startsWith(path.resolve(__dirname, 'api') + path.sep)) return next();
        if (!fs.existsSync(file)) return next();

        try {
          const mod = await server.ssrLoadModule(file);
          const handler = mod.default;
          if (typeof handler !== 'function') return next();

          const query: Record<string, string> = {};
          url.searchParams.forEach((v, k) => (query[k] = v));

          let body: unknown = undefined;
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            const chunks: Buffer[] = [];
            for await (const c of req) chunks.push(c as Buffer);
            const raw = Buffer.concat(chunks).toString('utf8');
            try {
              body = raw ? JSON.parse(raw) : undefined;
            } catch {
              body = raw;
            }
          }

          const shim = {
            status(code: number) {
              res.statusCode = code;
              return shim;
            },
            setHeader(k: string, v: string) {
              res.setHeader(k, v);
              return shim;
            },
            json(payload: unknown) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(payload));
              return shim;
            },
            end(payload?: string) {
              res.end(payload);
              return shim;
            },
          };

          await handler({ ...req, query, body }, shim);
        } catch (err) {
          server.config.logger.error(`[api/${route}] ${err}`);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: 'local api handler failed' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiRoutesPlugin()],
    server: {
      // Honour PORT so a harness can assign one; 3000 otherwise.
      port: Number(process.env.PORT) || 3000,
      // File watching is disabled when DISABLE_HMR is set, to stop the page
      // flickering while an agent edits files underneath it.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
