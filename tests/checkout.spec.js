const { test, expect } = require('@playwright/test');

test('should check if elements exist in checkout page', async ({ page }) => {
    await page.goto('http://localhost:8081/checkout');
  
    //  frame existence
    const mainFrame = page.locator('.main-frame');
    await expect(mainFrame).toBeVisible();
  
    // id "pages"
    const ironPages = page.locator('#pages');
    await expect(ironPages).toBeVisible();
  
    // Checkout header
    const checkoutHeader = page.locator('header.subsection h1');
    await expect(checkoutHeader).toHaveText('Checkout');
  
    //  Account Information header
    const accountInfoHeading = page.locator('#accountInfoHeading');
    await expect(accountInfoHeading).toHaveText('Account Information');
  
    const emailInput = page.locator('input#accountEmail');
    const count = await emailInput.count();
    console.log(`Element count: ${count}`); // Should be 1 if the element exists
    
    //  phone number input
    const phoneInput = page.locator('input#accountPhone');
    const PhoneCount = await phoneInput.count();
    console.log(`Phone input count: ${PhoneCount}`); // Should be 1 if the element exists
    
  
    const shipAddressInput = page.locator('input#shipAddress');
    const shipAddressCount = await shipAddressInput.count();
    console.log(`Shipping address input count: ${shipAddressCount}`);
    
    // city input
    const shipCityInput = page.locator('input#shipCity');
    const shipCityCount = await shipCityInput.count();
    console.log(`City input count: ${shipCityCount}`);
    
    //state input
    const shipStateInput = page.locator('input#shipState');
    const shipStateCount = await shipStateInput.count();
    console.log(`State input count: ${shipStateCount}`);
    
    //zip code input
    const shipZipInput = page.locator('input#shipZip');
    const shipZipCount = await shipZipInput.count();
    console.log(`Zip code input count: ${shipZipCount}`);
    
    // country dropdown
    const countryDropdown = page.locator('select#shipCountry');
    const countryDropdownCount = await countryDropdown.count();
    console.log(`Country dropdown count: ${countryDropdownCount}`);
    
    //  billing address checkbox
    const billingCheckbox = page.locator('input#setBilling');
    const billingCheckboxCount = await billingCheckbox.count();
    console.log(`Billing address checkbox count: ${billingCheckboxCount}`);
    
    //cardholder name input
    const ccNameInput = page.locator('input#ccName');
    const ccNameCount = await ccNameInput.count();
    console.log(`Cardholder name input count: ${ccNameCount}`);
    
    // card number input
    const ccNumberInput = page.locator('input#ccNumber');
    const ccNumberCount = await ccNumberInput.count();
    console.log(`Card number input count: ${ccNumberCount}`);
  
    //  expiry month dropdown
    const ccExpMonthDropdown = page.locator('select#ccExpMonth');
    const ccExpMonthDropdownCount = await ccExpMonthDropdown.count();
    console.log(`ccNumberCount: ${ccExpMonthDropdownCount}`);
  
    // CVV
    const ccCVVInput = page.locator('input#ccCVV');
    const ccCVVInputCount = await ccCVVInput.count();
    console.log(`ccCVVInput: ${ccCVVInputCount}`);
    // await expect(ccCVVInput).toBeVisible();
  
    const totalAmount = page.locator('.row.total-row .flex');
    const totalAmountCount = await totalAmount.count();
    console.log(`Total amount element count: ${totalAmountCount}`);

    // place order button
    const placeOrderButton = page.locator('shop-button#submitBox input[type="button"]');
    const placeOrderButtonCount = await placeOrderButton.count();
    console.log(`Place Order button count: ${placeOrderButtonCount}`);
  });