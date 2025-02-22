const GITHUB_REPO = "YOUR_GITHUB_USERNAME/YOUR_REPO_NAME";  // Replace with your repo
const FILE_PATH = "stock.json";  // Stock data file
const TOKEN = "YOUR_NEW_PERSONAL_ACCESS_TOKEN";  // Secure new token

async function getStock() {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        headers: { Authorization: `token ${TOKEN}` }
    });

    if (response.ok) {
        const data = await response.json();
        const stockData = JSON.parse(atob(data.content)); // Decode base64 file
        return { stock: stockData, sha: data.sha };
    } else {
        return { stock: {}, sha: null };  // Default empty object if file doesn’t exist
    }
}

async function updateStock(productName, sha) {
    const { stock } = await getStock();
    
    if (stock[productName] > 0) {
        stock[productName] -= 1;  // Reduce stock for the specific product

        await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
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
    }
}

async function purchaseItem(productName, price) {
    const { stock, sha } = await getStock();

    if (stock[productName] > 0) {
        await updateStock(productName, sha); // Reduce stock for this product

        // Redirect to PayPal with correct product name and price
        window.location.href = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=jack3laynee@yahoo.com&item_name=${encodeURIComponent(productName)}&amount=${price}&currency_code=USD`;
    } else {
        alert("Out of Stock, check back for availability.");
    }
}

// Show "In Stock" or "Out of Stock" for each product
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
