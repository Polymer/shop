const { test, expect } = require('@playwright/test');


test('Check header elements exist', async ({ page }) => {
    await page.goto('http://localhost:8081/cart');
  
    const header = page.locator('app-header#header');
    await expect(header).toBeVisible();
  
    // Check if the logo exists
    const logo = header.locator('.logo a[aria-label="SHOP Home"]');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveText('SHOP');
  
    // Check if the shopping cart button exists
    const cartButton = header.locator('.cart-btn-container paper-icon-button[icon="shopping-cart"]');
    await expect(cartButton).toBeVisible();
  });


test('Check if product details exist on the page', async ({ page }) => {
  await page.goto('http://localhost:8081/detail/mens_outerwear/Tri-blend+Full-Zip+Hoodie');

  // Check if the <h1> title with the product name exists
  const productName = page.locator('h1:has-text("Tri-blend Full-Zip Hoodie")');
  await expect(productName).toBeVisible();

  // Check if the price element exists and has the correct value
  const price = page.locator('.price');
  await expect(price).toHaveText('$52.20');

  // Check if the size select element exists
  const sizeSelect = page.locator('#sizeSelect');
  await expect(sizeSelect).toBeVisible();

  // Check if the quantity select element exists
  const quantitySelect = page.locator('#quantitySelect');
  await expect(quantitySelect).toBeVisible();

  // Check if the description exists and contains the correct text
  const description = page.locator('#desc');
  await expect(description).toHaveText(/Comfy cool/); // Partial match for the description text

  // Check if the "Add to Cart" button exists
  const addToCartButton = page.locator('button[aria-label="Add this item to cart"]');
  await expect(addToCartButton).toBeVisible();
});




test('Check existence of cart elements', async ({ page }) => {

  await page.goto('http://localhost:8081/cart');
 
  const linkLocator = page.locator('a[href="/detail/mens_outerwear/Tri-blend+Full-Zip+Hoodie"][title="Tri-blend Full-Zip Hoodie"]');
  
  // Verify that the anchor tag is visible
  await expect(linkLocator).toBeVisible();
  
  // Verify that the <shop-image> child element exists within the <a> tag
  const shopImageLocator = linkLocator.locator('shop-image');
  await expect(shopImageLocator).toBeVisible();
});
