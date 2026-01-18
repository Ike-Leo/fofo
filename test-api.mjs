// Test script to check organization and API
// NOTE: HTTP routes use .convex.site, not .convex.cloud!
const CONVEX_SITE_URL = "https://acoustic-seahorse-440.convex.site";
const CONVEX_CLOUD_URL = "https://acoustic-seahorse-440.convex.cloud";

async function testAPI() {
    console.log("Testing Storefront API...\n");

    // Test 1: Check if the base deployment is running (.convex.cloud)
    console.log("1. Testing base URL (.convex.cloud)...");
    const baseRes = await fetch(CONVEX_CLOUD_URL);
    console.log(`   Status: ${baseRes.status}`);
    console.log(`   Body: ${await baseRes.text()}\n`);

    // Test 2: Check .convex.site base URL
    console.log("2. Testing base URL (.convex.site)...");
    const siteRes = await fetch(CONVEX_SITE_URL);
    console.log(`   Status: ${siteRes.status}`);
    console.log(`   Body: ${(await siteRes.text()).substring(0, 100)}...\n`);

    // Test 3: Try the products endpoint on .convex.site
    console.log("3. Testing /api/store/hair-palace/products on .convex.site...");
    const productsRes = await fetch(`${CONVEX_SITE_URL}/api/store/hair-palace/products`);
    console.log(`   Status: ${productsRes.status}`);
    const productsText = await productsRes.text();
    console.log(`   Body: ${productsText.substring(0, 500) || "(empty)"}\n`);

    // Test 4: Check if auth routes work on .convex.site
    console.log("4. Testing /.well-known/jwks.json on .convex.site...");
    const jwksRes = await fetch(`${CONVEX_SITE_URL}/.well-known/jwks.json`);
    console.log(`   Status: ${jwksRes.status}`);
    const jwksText = await jwksRes.text();
    console.log(`   Body: ${jwksText.substring(0, 200)}...\n`);

    // Test 5: Try categories on .convex.site
    console.log("5. Testing /api/store/hair-palace/categories on .convex.site...");
    const catRes = await fetch(`${CONVEX_SITE_URL}/api/store/hair-palace/categories`);
    console.log(`   Status: ${catRes.status}`);
    const catText = await catRes.text();
    console.log(`   Body: ${catText.substring(0, 500) || "(empty)"}\n`);

    console.log("Done!");
}

testAPI().catch(console.error);
