const { test, expect } = require('@playwright/test');

test('header element exists', async ({ page }) => {
    await page.goto('http://localhost:8081/list/mens_outerwear');
  
    const header = await page.$('header');
    expect(header).not.toBeNull();
  
    const h1 = await page.$('header > h1');
    expect(h1).not.toBeNull();
  
    //  text content of the h1 element is correct
    const h1Text = await h1.textContent();
    expect(h1Text).toBe('Men\'s Outerwear');
  
    //the span element exists within the header
    const span = await page.$('header > span');
    expect(span).not.toBeNull();
  
    //text content of the span element is correct
    const spanText = await span.textContent();
    expect(spanText).toBe('(16 items)');
  });

  
  test('first 5 elements exist', async ({ page }) => {
    await page.goto('http://localhost:8081/list/mens_outerwear');
  
    //the ul element exists
    const ul = await page.$('ul.grid');
    expect(ul).not.toBeNull();
  
    //the first 5 li elements exist
    const liElements = await page.$$('ul.grid > li');
    expect(liElements.length).toBeGreaterThan(5);
  
    // Check if the first 5 li elements contain a and shop-list-item elements
    expect(await liElements[0].$$('a > shop-list-item')).not.toBeNull();
    expect(await liElements[1].$$('a > shop-list-item')).not.toBeNull();
    expect(await liElements[2].$$('a > shop-list-item')).not.toBeNull();
    expect(await liElements[3].$$('a > shop-list-item')).not.toBeNull();
    expect(await liElements[4].$$('a > shop-list-item')).not.toBeNull();
  });


test('image exists', async ({ page }) => {
    await page.goto('http://localhost:8081/list/mens_outerwear');
  
    const image = page.getByRole('img', { name: 'Men\'s Outerwear' });

    // Assert that the image is visible on the page
    await expect(image).toBeVisible();
  });

  test('check header tabs exist', async ({ page }) => {
    await page.goto('http://localhost:8081/list/mens_outerwear');
  
    // #tabContainer exists
    const tabContainer = page.locator('#tabContainer');
    await expect(tabContainer).toBeVisible();
  
    // "Men's Outerwear" tab exists
    const mensOuterwearTab = tabContainer.locator('a[href="/list/mens_outerwear"]');
    await expect(mensOuterwearTab).toBeVisible();
  
    //  "Ladies Outerwear" tab exists
    const ladiesOuterwearTab = tabContainer.locator('a[href="/list/ladies_outerwear"]');
    await expect(ladiesOuterwearTab).toBeVisible();
  
    // "Men's T-Shirts" tab exists
    const mensTshirtsTab = tabContainer.locator('a[href="/list/mens_tshirts"]');
    await expect(mensTshirtsTab).toBeVisible();
  
    //  "Ladies T-Shirts" tab exists
    const ladiesTshirtsTab = tabContainer.locator('a[href="/list/ladies_tshirts"]');
    await expect(ladiesTshirtsTab).toBeVisible();
  });

    test('should check if the Ladies Outerwear image exists', async ({ page }) => {
      await page.goto('http://localhost:8081/list/ladies_outerwear'); 
  
      // Check if the image exists
      const image = await page.getByRole('img', { name: 'Ladies Outerwear' });
    
      //image is visible
      await expect(image).toBeVisible();
    
      await expect(image).toHaveAttribute('src', 'images/ladies_outerwear.jpg');
    });


test('should check if the header for Ladies Outerwear exists', async ({ page }) => {
  await page.goto('http://localhost:8081/list/ladies_outerwear'); 
  
  //  text "Ladies Outerwear"
  const headerTitle = await page.locator('header h1');
  await expect(headerTitle).toHaveText('Ladies Outerwear');

  //  "(6 items)"
  const headerItems = await page.locator('header span');
  await expect(headerItems).toHaveText('(6 items)');
});


test('should check if specific list items in the grid exist', async ({ page }) => {
  await page.goto('http://localhost:8081/list/ladies_outerwear'); 
  
  // Check if the <ul> with class 'grid' exists
  const ulGrid = await page.locator('ul.grid');
  await expect(ulGrid).toBeVisible();

  // Check each individual list item and its link
  const firstItem = await page.locator('ul.grid li a[href="/detail/ladies_outerwear/Ladies+Modern+Stretch+Full+Zip"]');
  await expect(firstItem).toBeVisible();

  const secondItem = await page.locator('ul.grid li a[href="/detail/ladies_outerwear/Ladies+Colorblock+Wind+Jacket"]');
  await expect(secondItem).toBeVisible();

  const thirdItem = await page.locator('ul.grid li a[href="/detail/ladies_outerwear/Ladies+Voyage+Fleece+Jacket"]');
  await expect(thirdItem).toBeVisible();

  const fourthItem = await page.locator('ul.grid li a[href="/detail/ladies_outerwear/Ladies+Pullover+L+S+Hood"]');
  await expect(fourthItem).toBeVisible();

  const fifthItem = await page.locator('ul.grid li a[href="/detail/ladies_outerwear/Ladies+Sonoma+Hybrid+Knit+Jacket"]');
  await expect(fifthItem).toBeVisible();

  const sixthItem = await page.locator('ul.grid li a[href="/detail/ladies_outerwear/Ladies+Yerba+Knit+Quarter+Zip"]');
  await expect(sixthItem).toBeVisible();
});


test('Check link existence, click, and redirection', async ({ page }) => {
  await page.goto('http://localhost:8081/list/mens_outerwear');

  // Locate the link 
  const link = page.locator('a[href="/detail/mens_outerwear/Men+s+Tech+Shell+Full-Zip"]');
  
  // link is visible
  await expect(link).toBeVisible();

  await link.click();

  // Wait for navigation after the click
  await page.waitForURL('http://localhost:8081/detail/mens_outerwear/Men+s+Tech+Shell+Full-Zip');

  // Verify that the current URL is correct after redirection
  await expect(page).toHaveURL('http://localhost:8081/detail/mens_outerwear/Men+s+Tech+Shell+Full-Zip');
});


test('Check image existence and visibility', async ({ page }) => {
  await page.goto('http://localhost:8081/detail/mens_outerwear/Men+s+Tech+Shell+Full-Zip');

  //  image element by its id
  const image = page.getByRole('img', { name: 'Men\'s Tech Shell Full-Zip' });

  //  image is visible on the page
  await expect(image).toBeVisible();

  await expect(image).toHaveAttribute('src', 'data/images/10-15068A.jpg');
});


test('Check product detail elements exist', async ({ page }) => {
  await page.goto('http://localhost:8081/detail/mens_outerwear/Men+s+Tech+Shell+Full-Zip');
  
  // product title exists
  const productTitle = page.locator('div.detail h1');
  await expect(productTitle).toBeVisible();
  await expect(productTitle).toHaveText("Men's Tech Shell Full-Zip");

  //  price exists
  const price = page.locator('div.detail .price');
  await expect(price).toBeVisible();
  await expect(price).toHaveText('$50.20');

  // the size select dropdown exists
  const sizeSelect = page.locator('select#sizeSelect');
  await expect(sizeSelect).toBeVisible();
  await expect(sizeSelect).toHaveValue('M'); //'M' is selected

  //quantity select dropdown exists
  const quantitySelect = page.locator('select#quantitySelect');
  await expect(quantitySelect).toBeVisible();
  await expect(quantitySelect).toHaveValue('1');

  //  description exists
  const description = page.locator('div.detail .description p#desc');
  await expect(description).toBeVisible();
  await expect(description).toContainText('A versatile full-zip that you can wear all day long');

  // "Add to Cart" button exists
  const addToCartButton = page.locator('shop-button button[aria-label="Add this item to cart"]');
  await expect(addToCartButton).toBeVisible();
});


test('check first three shop list items exist', async ({ page }) => {
  // Navigate to the page containing the list
  await page.goto('http://localhost:8081/list/ladies_tshirts'); 

  const firstItem = page.locator('ul.grid > li:nth-of-type(1) > a');
  const secondItem = page.locator('ul.grid > li:nth-of-type(2) > a');
  const thirdItem = page.locator('ul.grid > li:nth-of-type(3) > a');

  // Define locators for titles and prices within each item
  const firstItemTitle = firstItem.locator('shop-list-item >> .title'); 
  const firstItemPrice = firstItem.locator('shop-list-item >> .price'); 

  const secondItemTitle = secondItem.locator('shop-list-item >> .title'); 
  const secondItemPrice = secondItem.locator('shop-list-item >> .price');

  const thirdItemTitle = thirdItem.locator('shop-list-item >> .title'); 
  const thirdItemPrice = thirdItem.locator('shop-list-item >> .price'); 

  // Check that each of the first three items is visible
  await expect(firstItem).toBeVisible();
  await expect(secondItem).toBeVisible();
  await expect(thirdItem).toBeVisible();

  // Verify the title and price for the first item
  await expect(firstItemTitle).toHaveText('Ladies Chrome T-Shirt'); 
  await expect(firstItemPrice).toHaveText('$13.30'); 

  // Verify the title and price for the second item
  await expect(secondItemTitle).toHaveText('Ladies Google New York T-Shirt');
  await expect(secondItemPrice).toHaveText('$18.35'); 

  // Verify the title and price for the third item
  await expect(thirdItemTitle).toHaveText('Ladies Gmail T-Shirt'); 
  await expect(thirdItemPrice).toHaveText('$16.40'); 
});