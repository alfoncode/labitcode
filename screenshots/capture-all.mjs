import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4321';
const SCREENSHOTS_DIR = path.join(process.cwd());
const VIEWPORT = { width: 375, height: 812 };

const pages = [
  { route: '/', file: 'home.png' },
  { route: '/blog/', file: 'blog-index.png' },
  { route: '/blog/ai-driven-development', file: 'blog-ai-driven.png' },
  { route: '/blog/building-labitcode', file: 'blog-building.png' },
  { route: '/blog/markdown-style-guide', file: 'blog-markdown.png' },
  { route: '/projects/', file: 'projects-index.png' },
  { route: '/projects/labitcode-platform', file: 'projects-labitcode.png' },
  { route: '/projects/secureflow-scanner', file: 'projects-secureflow.png' },
  { route: '/team', file: 'team.png' },
];

(async () => {
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
})();
