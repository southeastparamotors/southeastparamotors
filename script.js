const GITHUB_REPO = "southeastparamotors/southeastparamotors";  // Your GitHub repo
const WORKFLOW_PATH = "update-stock.yml";  // GitHub Actions workflow file

/**
 * Handles product purchase by triggering GitHub Actions.
 */
async function purchaseItem(productName, price) {
    const { stock, sha } = await getStock();

    if (stock[productName] > 0) {
        await updateStock(productName, sha); // Reduce stock for this product

        // ✅ Redirect to PayPal with dynamic product name and price
        window.location.href = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=jack3laynee@yahoo.com&item_name=${encodeURIComponent(productName)}&amount=${price.toFixed(2)}&currency_code=USD`;
    } else {
        alert("❌ Out of Stock, check back for availability.");
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
    const { stock, sha } = await getStock();

    if (stock[productName] > 0) {
        await updateStock(productName, sha); // Reduce stock for this product

        // Redirect to PayPal with correct product name and price
        window.location.href = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=jack3laynee@yahoo.com&item_name=${encodeURIComponent(productName)}&amount=${price}&currency_code=USD`;
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
