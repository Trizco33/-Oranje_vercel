const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Loading production site...');
  await page.goto('https://oranjeapp.com.br', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/prod-homepage.png', fullPage: false });
  console.log('✓ Screenshot saved to /tmp/prod-homepage.png');
  
  // Check page structure
  const title = await page.title();
  console.log('✓ Page title:', title);
  
  // Look for any images
  const images = await page.$$('img');
  console.log('✓ Total images found:', images.length);
  
  // Get all image sources
  const imageSrcs = await page.$$eval('img', imgs => imgs.map(img => ({ 
    src: img.src, 
    alt: img.alt, 
    class: img.className,
    width: img.naturalWidth 
  })));
  console.log('✓ First 5 images:', JSON.stringify(imageSrcs.slice(0, 5), null, 2));
  
  // Check for place-related elements
  const placeSelectors = [
    '[class*="place"]',
    '[class*="Place"]',
    '[data-testid*="place"]',
    'article',
    '.card',
    '[class*="card"]',
    '[class*="Card"]'
  ];
  
  for (const selector of placeSelectors) {
    const elements = await page.$$(selector);
    if (elements.length > 0) {
      console.log(`✓ Found ${elements.length} elements with selector: ${selector}`);
    }
  }
  
  // Get all class names on page
  const allClasses = await page.$$eval('*', els => {
    const classes = new Set();
    els.forEach(el => {
      if (el.className && typeof el.className === 'string') {
        el.className.split(' ').forEach(c => c && classes.add(c));
      }
    });
    return Array.from(classes).slice(0, 50);
  });
  console.log('✓ Sample classes on page:', allClasses.join(', '));
  
  await browser.close();
})();
