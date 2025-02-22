// ✅ Fetch Stock Data from GitHub
async function getStock() {
  const response = await fetch('https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPO/main/stock.json');
  const stock = await response.json();
  return stock;
}

// ✅ Reduce Stock & Update GitHub
async function updateStock(productId) {
  const stock = await getStock();
  
  if (stock[productId] > 0) {
    stock[productId]--; // Reduce stock count
    saveStock(stock); // Save updated stock
  }
}

// ✅ Save Stock to GitHub
async function saveStock(updatedStock) {
  await fetch('https://api.github.com/repos/YOUR_GITHUB_USERNAME/YOUR_REPO/contents/stock.json', {
    method: "PUT",
    headers: {
      "Authorization": "token YOUR_GITHUB_PERSONAL_ACCESS_TOKEN",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Update stock",
      content: btoa(JSON.stringify(updatedStock, null, 2)),
      sha: await getStockSHA()
    })
  });
}

// ✅ Get SHA for Updating Stock File
async function getStockSHA() {
  const response = await fetch('https://api.github.com/repos/YOUR_GITHUB_USERNAME/YOUR_REPO/contents/stock.json');
  const fileData = await response.json();
  return fileData.sha;
}

// ✅ Handle Purchase & Redirect to PayPal
async function purchaseItem(productId, price) {
  const stock = await getStock();

  if (stock[productId] > 0) {
    await updateStock(productId); // Reduce stock globally

    // 🔹 Redirect to PayPal
    window.location.href = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=jack3laynee@yahoo.com&item_name=${productId}&amount=${price}&currency_code=USD`;
  } else {
    alert("Sorry, this item is out of stock!");
  }
}

// ✅ Update Stock Display on Page Load
async function updateStockDisplay() {
  const stock = await getStock();
  
  const stockElements = {
    "paramotor_kit": document.getElementById("stock-paramotor"),
    "battery": document.getElementById("stock-battery"),
    "control_box": document.getElementById("stock-control"),
    "wiring_harness": document.getElementById("stock-wiring"),
    "led_tube": document.getElementById("stock-ledtube")
  };

  Object.keys(stockElements).forEach(productId => {
    if (stockElements[productId]) {
      stockElements[productId].innerHTML = stock[productId] > 0
        ? `<p style="color: green; font-weight: bold;">In Stock – Ready to Build</p>`
        : `<p style="color: red; font-weight: bold;">Out of Stock, check back for availability.</p>`;
    }
  });
}

document.addEventListener("DOMContentLoaded", updateStockDisplay);
