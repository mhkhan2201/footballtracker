// Minimal static file server for the built app.
// No API routes, no server-side logic — just serves the Vite build output.
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const port = process.env.PORT || 3000;

const app = express();

app.use(express.static(distDir, { maxAge: '1h' }));

// SPA fallback: any non-file route serves index.html (e.g. a hard refresh mid-match).
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Football time tracker serving on port ${port}`);
});
