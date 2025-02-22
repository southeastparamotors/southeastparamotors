const GITHUB_REPO = "southeastparamotors/southeastparamotors";  // Your GitHub repo
const FILE_PATH = "stock.json";  // GitHub stock data file
const TOKEN = process.env.MY_TOKEN;  // Use GitHub Secrets to securely store the token

/**
 * Fetches current stock from GitHub.
 */
async function getStock() {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        headers: { Authorization: `token ${TOKEN}` }
    });

    if (response.ok) {
        const data = await response.json();
        const stockData = JSON.parse(atob(data.content)); // Decode base64 file
        return { stock: stockData, sha: data.sha };
    } else {
        console.error("❌ Failed to fetch stock data:", response);
        return { stock: {}, sha: null };  // Return empty object if file doesn't exist
    }
}

/**
 * Updates stock count on GitHub after purchase.
 */
async function updateStock(productName, sha) {
    const { stock } = await getStock();

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
    }
}

/**
 * Handles product purchase.
 */
async function purchaseItem(productName, price) {
    console.log(`🔍 Debug: Purchasing ${productName} for $${price}`); // 🔹 Check if correct values are being passed

    const { stock, sha } = await getStock();

    if (stock[productName] > 0) {
        await updateStock(productName, sha); // Reduce stock for this product

        // ✅ Redirect to PayPal with the correct product name and price
        window.location.href = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=jack3laynee@yahoo.com&item_name=${encodeURIComponent(productName)}&amount=${price.toFixed(2)}&currency_code=USD`;
    } else {
        alert("❌ Out of Stock, check back for availability.");
    }
}


/**
 * Updates stock display on page load.
 */
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
