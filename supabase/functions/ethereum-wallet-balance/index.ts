// Deno edge function for fetching Ether balance from Etherscan

// Etherscan API Key
// @ts-ignore
const ETHERSCAN_API_KEY = Deno.env.get("ETHERSCAN_API_KEY");
const ETHERSCAN_API_URL = "https://api.etherscan.io/api";

const fetchPrice = async () => {
    try {
        const response = await fetch('https://api.kraken.com/0/public/Ticker?pair=XETHZUSD');
        const data = await response.json();
        return data.result.XETHZUSD.a[0];
    } catch (error) {
        console.error(error);
        return 0;
    }
}

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
    };

    // For 204 No Content, don't include Content-Type or body
    if (status === 204) {
        return new Response(null, { status, headers });
    }

    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...headers,
            'Content-Type': 'application/json',
        },
    });
}

// @ts-ignore
Deno.serve(async (req) => {
    console.log("Received request:", req.method, req.url);
    const url = new URL(req.url);
    const address = url.searchParams.get("address");
    console.log("Parsed address:", address);

    if (req.method === 'OPTIONS') {
        console.log("OPTIONS request, returning CORS headers");
        return corsResponse({}, 204);
    }

    if (req.method !== 'GET') {
        console.log("Invalid method:", req.method);
        return corsResponse({ error: 'Method not allowed' }, 405);
    }

    if (!ETHERSCAN_API_KEY) {
        console.error("ETHERSCAN_API_KEY is not set");
        return corsResponse({ error: "ETHERSCAN_API_KEY is not set" }, 500);
    }

    if (!address) {
        console.error("Address is required");
        return corsResponse({ error: "Address is required" }, 400);
    }

    try {
        // Fetch Ether balance
        const etherParams = new URLSearchParams({
            module: "account",
            action: "balance",
            address: address,
            tag: "latest",
            apikey: ETHERSCAN_API_KEY,
        });
        const etherUrl = `${ETHERSCAN_API_URL}?${etherParams.toString()}`;
        console.log("Fetching Ether balance from:", etherUrl);
        const etherResponse = await fetch(etherUrl);
        const etherData = await etherResponse.json();
        console.log("Ether API response:", JSON.stringify(etherData).slice(0, 500));

        if (etherData.status !== "1") {
            console.error("Failed to fetch Ether balance:", etherData.message);
            return corsResponse({ error: etherData.message || "Failed to fetch Ether balance" }, 400);
        }

        const price = await fetchPrice();
        const priceNum = Number(price);
        // Ether balance is returned in Wei (as a string)
        const balanceWei = etherData.result;
        // Convert Wei to Ether (1 Ether = 1e18 Wei)
        const balanceEther = Number(balanceWei) / 1e18;
        const balanceUsd = balanceEther * priceNum;
        const responseObj = {
            ether: {
                balanceWei: balanceWei,
                balanceEther: balanceEther,
                price: priceNum,
                balanceUsd: balanceUsd,
            }
        };
        console.log("Returning response:", JSON.stringify(responseObj).slice(0, 500));
        return corsResponse(responseObj);
    } catch (error) {
        console.error("Error fetching balances:", error);
        return corsResponse({ error: "Failed to fetch balances" }, 500);
    }
});