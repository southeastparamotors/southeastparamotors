console.log("✅ script.js is loaded and running!");

// ✅ Fetch stock.json directly from your website (no GitHub API needed)
async function getStock() {
    try {
        const response = await fetch("https://southeastparamotors.com/stock.json");  

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const stockData = await response.json();
        console.log("✅ Stock loaded:", stockData);
        return { stock: stockData };
    } catch (error) {
        console.error("❌ Failed to fetch stock data:", error);
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
        console.log(`✅ Stock available for ${productName}: ${stock[productName]}`);

        // ✅ Redirect to PayPal with correct product name and price
        console.log("✅ Redirecting to PayPal:", productName, price);
        window.location.href = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=jack3laynee@yahoo.com&item_name=${encodeURIComponent(productName)}&amount=${price.toFixed(2)}&currency_code=USD`;
    } else {
        alert("❌ Out of Stock, check back for availability.");
    }
}

/**
 * Updates stock count on GitHub after purchase.
 */
async function updateStock(productName) {
    console.log(`🔥 Updating stock for ${productName}...`);

    const { stock, sha } = await getStock();

    if (stock[productName] > 0) {
        stock[productName] -= 1;  // Reduce stock for the selected product

        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            method: "PUT",
            headers: {
                Authorization: `token ${TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: `Updated stock for ${productName}`,
                content: btoa(JSON.stringify(stock)),  // Encode updated JSON to base64
                sha: sha
            })
        });

        if (response.ok) {
            console.log(`✅ Stock updated for ${productName}`);
        } else {
            console.error("❌ Failed to update stock:", response);
        }
    } else {
        console.warn(`⚠️ Stock for ${productName} is already at 0.`);
    }
}

// ✅ Make `updateStock` globally available for testing
window.updateStock = updateStock;


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

window.updateStock = updateStock;  // Add this at the bottom of script.js
