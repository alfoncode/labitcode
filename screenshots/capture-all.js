const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:4321';
const SCREENSHOTS_DIR = path.join(__dirname);
const VIEWPORT = { width: 375, height: 812 };

// Lista de páginas a capturar (rutas relativas)
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
  console.log('🚀 Iniciando captura con Playwright...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2, // Retina para mejor calidad
  });
  
  const page = await context.newPage();

  for (const { route, file } of pages) {
    const url = BASE_URL + route;
    const filePath = path.join(SCREENSHOTS_DIR, file);
    
    try {
      console.log(`📸 Capturando ${route} → ${file}...`);
      
      // Navegar y esperar a que la página cargue completamente
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Esperar a que el body esté visible
      await page.waitForSelector('body', { state: 'visible', timeout: 10000 });
      
      // Esperar un poco más para que JS termine de renderizar
      await page.waitForTimeout(3000);
      
      // Capturar screenshot
      await page.screenshot({ 
        path: filePath,
        fullPage: false, // Solo viewport, no toda la página
        animations: 'disabled'
      });
      
      // Verificar que el archivo se creó y tiene tamaño > 0
      const stats = fs.statSync(filePath);
      if (stats.size > 10000) { // > 10KB asume contenido real
        console.log(`  ✅ ${file} guardado (${(stats.size/1024).toFixed(1)} KB)`);
      } else {
        console.log(`  ⚠️ ${file} sospechosamente pequeño (${(stats.size/1024).toFixed(1)} KB)`);
      }
      
    } catch (error) {
      console.error(`  ❌ Error capturando ${route}:`, error.message);
    }
  }

  await browser.close();
  console.log('✅ Captura de todas las páginas completada.');
})();
