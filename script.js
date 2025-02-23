const GITHUB_REPO = "southeastparamotors/southeastparamotors";
const WORKFLOW_PATH = "update-stock.yml";  // GitHub Actions workflow file
const MY_TOKEN = "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"; // Replace with your GitHub token

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

         // Call updateStock to update the stock file via GitHub Actions
        try {
            await updateStock(productName);
            console.log("✅ Stock updated successfully.");
        } catch (error) {
            console.error("❌ Stock update failed:", error);
        }
        
        // ✅ Redirect to PayPal with correct product name and price
        console.log("✅ Redirecting to PayPal:", productName, price);
        window.location.href = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=jack3laynee@yahoo.com&item_name=${encodeURIComponent(productName)}&amount=${price.toFixed(2)}&currency_code=USD`;
    } else {
        alert("❌ Out of Stock, check back for availability.");
    }
}

// ✅ Triggers GitHub Actions to update stock.
async function updateStock(productName) {
    console.log(`🔥 Requesting stock update for ${productName}...`);

    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_PATH}/dispatches`, {
        method: "POST",
        headers: {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": `Bearer ${MY_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            ref: "main",
            inputs: { product: productName }
        }),
        keepalive: true
    });

    const responseData = await response.text();
    
    if (response.ok) {
        console.log(`✅ Stock update request sent for ${productName}`);
    } else {
        console.error("❌ Failed to trigger GitHub Actions:", responseData);
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

    // Expose functions to the global scope for inline event handlers.
    window.purchaseItem = purchaseItem;
    window.updateStock = updateStock;

    console.log("purchaseItem type:", typeof purchaseItem);
});
