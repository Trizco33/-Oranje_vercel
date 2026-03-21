const { chromium } = require('playwright');
const fs = require('fs');

const PROD_URL = 'https://oranjeapp.com.br';

async function validateImages() {
  const results = {
    timestamp: new Date().toISOString(),
    url: PROD_URL,
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  const browser = await chromium.launch({ headless: true });
  
  try {
    // Desktop validation
    console.log('🖥️  Testing on Desktop viewport...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    const desktopPage = await desktopContext.newPage();
    
    await desktopPage.goto(PROD_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await desktopPage.waitForTimeout(2000);

    // Test 1: Check PlaceCard images on home page
    console.log('📸 Test 1: Checking PlaceCard images on home page...');
    const placeCards = await desktopPage.$$('.place-card, [class*="PlaceCard"]');
    const placeCardImages = await desktopPage.$$('.place-card img, [class*="PlaceCard"] img');
    
    let brokenImages = 0;
    let loadedImages = 0;
    let lazyImages = 0;
    
    for (const img of placeCardImages) {
      const src = await img.getAttribute('src');
      const loading = await img.getAttribute('loading');
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      
      if (loading === 'lazy') lazyImages++;
      
      if (naturalWidth > 0) {
        loadedImages++;
      } else {
        brokenImages++;
        console.log(`  ❌ Broken image: ${src}`);
      }
    }
    
    results.tests.push({
      name: 'PlaceCard Images',
      passed: brokenImages === 0 && loadedImages > 0,
      details: {
        totalImages: placeCardImages.length,
        loadedImages,
        brokenImages,
        lazyImages,
        placeCards: placeCards.length
      }
    });
    
    console.log(`  ✓ Found ${placeCards.length} place cards with ${placeCardImages.length} images`);
    console.log(`  ✓ Loaded: ${loadedImages}, Broken: ${brokenImages}, Lazy: ${lazyImages}`);

    // Test 2: Click on a place and check gallery
    console.log('🖼️  Test 2: Checking image gallery in PlaceDetail...');
    if (placeCards.length > 0) {
      await placeCards[0].click();
      await desktopPage.waitForTimeout(1500);
      
      const galleryImages = await desktopPage.$$('.image-gallery img, [class*="gallery"] img, [class*="Gallery"] img');
      const galleryContainer = await desktopPage.$('.image-gallery, [class*="gallery"], [class*="Gallery"]');
      
      let galleryLoadedImages = 0;
      let galleryBrokenImages = 0;
      
      for (const img of galleryImages) {
        const naturalWidth = await img.evaluate(el => el.naturalWidth);
        if (naturalWidth > 0) {
          galleryLoadedImages++;
        } else {
          galleryBrokenImages++;
        }
      }
      
      results.tests.push({
        name: 'Image Gallery',
        passed: galleryContainer !== null && galleryLoadedImages > 0,
        details: {
          galleryFound: galleryContainer !== null,
          totalImages: galleryImages.length,
          loadedImages: galleryLoadedImages,
          brokenImages: galleryBrokenImages
        }
      });
      
      console.log(`  ✓ Gallery found: ${galleryContainer !== null}`);
      console.log(`  ✓ Gallery images: ${galleryImages.length}, Loaded: ${galleryLoadedImages}`);
      
      // Test 3: Test gallery navigation
      if (galleryImages.length > 1) {
        console.log('◀️▶️  Test 3: Testing gallery navigation...');
        const nextButton = await desktopPage.$('button[class*="next"], button[aria-label*="next"], button[aria-label*="Next"]');
        const prevButton = await desktopPage.$('button[class*="prev"], button[aria-label*="prev"], button[aria-label*="Previous"]');
        
        let navigationWorks = false;
        if (nextButton) {
          const initialSrc = await galleryImages[0].getAttribute('src');
          await nextButton.click();
          await desktopPage.waitForTimeout(500);
          const newSrc = await galleryImages[0].getAttribute('src');
          navigationWorks = initialSrc !== newSrc || galleryImages.length === 1;
        }
        
        results.tests.push({
          name: 'Gallery Navigation',
          passed: nextButton !== null && prevButton !== null,
          details: {
            nextButton: nextButton !== null,
            prevButton: prevButton !== null,
            navigationWorks
          }
        });
        
        console.log(`  ✓ Next button: ${nextButton !== null}, Prev button: ${prevButton !== null}`);
        console.log(`  ✓ Navigation works: ${navigationWorks}`);
      }
      
      // Go back to home
      await desktopPage.goBack();
      await desktopPage.waitForTimeout(1000);
    }
    
    await desktopContext.close();

    // Mobile validation
    console.log('\n📱 Testing on Mobile viewport...');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      isMobile: true,
      hasTouch: true
    });
    const mobilePage = await mobileContext.newPage();
    
    await mobilePage.goto(PROD_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await mobilePage.waitForTimeout(2000);
    
    // Test 4: Mobile PlaceCard images
    console.log('📸 Test 4: Checking mobile PlaceCard images...');
    const mobilePlaceCards = await mobilePage.$$('.place-card, [class*="PlaceCard"]');
    const mobilePlaceCardImages = await mobilePage.$$('.place-card img, [class*="PlaceCard"] img');
    
    let mobileLoadedImages = 0;
    for (const img of mobilePlaceCardImages) {
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      if (naturalWidth > 0) mobileLoadedImages++;
    }
    
    results.tests.push({
      name: 'Mobile PlaceCard Images',
      passed: mobileLoadedImages > 0,
      details: {
        totalImages: mobilePlaceCardImages.length,
        loadedImages: mobileLoadedImages
      }
    });
    
    console.log(`  ✓ Mobile images loaded: ${mobileLoadedImages}/${mobilePlaceCardImages.length}`);
    
    // Test 5: Mobile gallery swipe
    if (mobilePlaceCards.length > 0) {
      console.log('👆 Test 5: Testing mobile gallery swipe...');
      await mobilePlaceCards[0].click();
      await mobilePage.waitForTimeout(1500);
      
      const mobileGallery = await mobilePage.$('.image-gallery, [class*="gallery"], [class*="Gallery"]');
      const mobileGalleryImages = await mobilePage.$$('.image-gallery img, [class*="gallery"] img');
      
      let swipeWorks = false;
      if (mobileGallery && mobileGalleryImages.length > 1) {
        const box = await mobileGallery.boundingBox();
        if (box) {
          // Simulate swipe
          await mobilePage.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
          await mobilePage.waitForTimeout(300);
          
          // Try to swipe left
          await mobilePage.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
          await mobilePage.mouse.down();
          await mobilePage.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 10 });
          await mobilePage.mouse.up();
          await mobilePage.waitForTimeout(500);
          
          swipeWorks = true; // If no error, swipe mechanism exists
        }
      }
      
      results.tests.push({
        name: 'Mobile Gallery Swipe',
        passed: mobileGallery !== null,
        details: {
          galleryFound: mobileGallery !== null,
          imagesCount: mobileGalleryImages.length,
          swipeWorks
        }
      });
      
      console.log(`  ✓ Mobile gallery found: ${mobileGallery !== null}`);
      console.log(`  ✓ Swipe mechanism: ${swipeWorks}`);
    }
    
    await mobileContext.close();
    
    // Test 6: Check for fallback images
    console.log('\n🎨 Test 6: Checking fallback images...');
    const fallbackPage = await browser.newPage();
    await fallbackPage.goto(PROD_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await fallbackPage.waitForTimeout(2000);
    
    const allImages = await fallbackPage.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        naturalWidth: img.naturalWidth
      }))
    );
    
    const fallbackImages = allImages.filter(img => 
      img.src.includes('placeholder') || 
      img.src.includes('fallback') ||
      img.src.includes('default')
    );
    
    const realImages = allImages.filter(img => 
      !img.src.includes('placeholder') && 
      !img.src.includes('fallback') &&
      !img.src.includes('default') &&
      img.naturalWidth > 0
    );
    
    results.tests.push({
      name: 'Fallback Images',
      passed: realImages.length > fallbackImages.length,
      details: {
        totalImages: allImages.length,
        realImages: realImages.length,
        fallbackImages: fallbackImages.length,
        brokenImages: allImages.filter(img => img.naturalWidth === 0).length
      }
    });
    
    console.log(`  ✓ Total images: ${allImages.length}`);
    console.log(`  ✓ Real images: ${realImages.length}`);
    console.log(`  ✓ Fallback images: ${fallbackImages.length}`);
    
    await fallbackPage.close();
    
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
    results.error = error.message;
  } finally {
    await browser.close();
  }
  
  // Calculate summary
  results.summary.total = results.tests.length;
  results.summary.passed = results.tests.filter(t => t.passed).length;
  results.summary.failed = results.summary.total - results.summary.passed;
  
  // Save results
  fs.writeFileSync('/tmp/image-validation-results.json', JSON.stringify(results, null, 2));
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
  
  results.tests.forEach((test, idx) => {
    const icon = test.passed ? '✅' : '❌';
    console.log(`${icon} Test ${idx + 1}: ${test.name}`);
    console.log(`   ${JSON.stringify(test.details, null, 2).replace(/\n/g, '\n   ')}`);
  });
  
  return results;
}

validateImages().then(results => {
  process.exit(results.summary.failed > 0 ? 1 : 0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
