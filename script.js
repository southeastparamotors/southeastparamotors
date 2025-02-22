console.log("✅ script.js is loaded and running!");

// ✅ Fetch stock.json directly from your website (no GitHub API needed)
async function getStock() {
    const response = await fetch("https://southeastparamotors.com/stock.json");  

    if (response.ok) {
        const stockData = await response.json();
        return { stock: stockData };
    } else {
        console.error("❌ Failed to fetch stock data:", response);
        return { stock: {} };
    }
}

// ✅ Handles product purchase
async function purchaseItem(productName, price) {
    console.log("🔥 Click detected for:", productName, "with price:", price);

    if (!price || isNaN(price)) {
        console.error("❌ Error: Price is missing or invalid for", productName);
        return;
    }

    const { stock } = await getStock();

    if (stock[productName] > 0) {
        stock[productName] -= 1;  // Reduce stock locally (this does not save it yet)

        // ✅ Redirect to PayPal with correct product name and price
        console.log("✅ Redirecting to PayPal:", productName, price);
        window.location.href = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=jack3laynee@yahoo.com&item_name=${encodeURIComponent(productName)}&amount=${price.toFixed(2)}&currency_code=USD`;
    } else {
        alert("❌ Out of Stock, check back for availability.");
    }
}

// ✅ Updates stock display on page load
document.addEventListener("DOMContentLoaded", async () => {
    const { stock } = await getStock();

    document.querySelectorAll(".product-card").forEach(card => {
        const productName = card.getAttribute("data-product-name");
        const stockStatusDiv = card.querySelector(".stock-status");

        if (stock[productName] > 0) {
            stockStatusDiv.innerHTML = `<p style="color: green; font-weight: bold;">In Stock – Ready to Build</p>`;
        } else {
            stockStatusDiv.innerHTML = `<p style="color: red; font-weight: bold;">Out of Stock, check back for availability.</p>`;
        }
    });
});
