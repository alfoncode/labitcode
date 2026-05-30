import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import net from 'net';
import { spawn } from 'child_process';

const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots');
const VIEWPORT = { width: 375, height: 812 };

const pages = [
  { route: '/', file: 'home.png' },
  { route: '/blog/', file: 'blog-index.png' },
  { route: '/blog/ai-driven-development', file: 'blog-ai-driven.png' },
  { route: '/blog/building-labitcode', file: 'blog-building.png' },
  { route: '/blog/markdown-style-guide', file: 'blog-markdown.png' },
  { route: '/projects/', file: 'projects-index.png' },
  { route: '/projects/labitcode-platform', file: 'projects-labitcode.png' },
  { route: '/projects/terreno-rustico', file: 'projects-terreno-rustico.png' },
  { route: '/team', file: 'team.png' },
];

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    socket.setTimeout(1000);
    socket.once('error', onError);
    socket.once('timeout', onError);
    socket.connect(port, 'localhost', () => {
      socket.end();
      resolve(true);
    });
  });
}

async function waitForPort(port, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isPortOpen(port)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return false;
}

(async () => {
  let serverProcess = null;
  
  try {
    const isServerRunning = await isPortOpen(PORT);
    if (!isServerRunning) {
      console.log(`📡 El servidor en el puerto ${PORT} no está corriendo. Iniciando servidor de desarrollo...`);
      serverProcess = spawn('node', ['node_modules/astro/astro.js', 'dev', '--port', PORT.toString()], {
        stdio: 'ignore', // No inundar la consola con logs del servidor
      });
      
      const ready = await waitForPort(PORT);
      if (!ready) {
        throw new Error(`❌ El servidor de desarrollo no arrancó en el puerto ${PORT} en el tiempo esperado.`);
      }
      console.log(`🚀 Servidor de desarrollo iniciado en ${BASE_URL}`);
    } else {
      console.log(`📡 Usando el servidor existente en ${BASE_URL}`);
    }

    console.log('🚀 Iniciando captura con Playwright (ESM)...');
    
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 2
    });
    
    const page = await context.newPage();

    for (const { route, file } of pages) {
      const url = BASE_URL + route;
      const filePath = path.join(SCREENSHOTS_DIR, file);
      
      try {
        console.log(`📸 Capturando ${route} → ${file}...`);
          
        await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        await page.waitForSelector('body', { state: 'visible', timeout: 10000 });
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: filePath,
          fullPage: false,
          animations: 'disabled'
        });
        
        const stats = fs.statSync(filePath);
        if (stats.size > 10000) {
          console.log(`  ✅ ${file} guardado (${(stats.size/1024).toFixed(1)} KB)`);
        } else {
          console.log(`  ⚠️ ${file} sospechosamente pequeño (${(stats.size/1024).toFixed(1)} KB)`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error capturando ${route}:`, error.message);
      }
    }

    await browser.close();
    console.log('✅ Captura de TODAS las páginas completada.');
    
  } catch (error) {
    console.error('❌ Ocurrió un error general:', error.message);
  } finally {
    if (serverProcess) {
      console.log('🛑 Deteniendo el servidor de desarrollo...');
      serverProcess.kill('SIGTERM');
    }
  }
})();
