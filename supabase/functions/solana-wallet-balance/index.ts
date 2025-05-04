// Deno edge function for fetching wallet holdings from Helius

// Helius API Key
// @ts-ignore
const HELIUS_API_KEY = Deno.env.get("HELIUS_API_KEY");
// @ts-ignore
const HELIUS_RPC_URL = "https://mainnet.helius-rpc.com";

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        // @ts-ignore
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
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
    const url = new URL(req.url);
    const address = url.searchParams.get("address");

    if (req.method === 'OPTIONS') {
        console.log("OPTIONS request received, returning CORS headers");
        return corsResponse({}, 204);
    }

    if (req.method !== 'GET') {
        console.log("Invalid method:", req.method);
        return corsResponse({ error: 'Method not allowed' }, 405);
    }

    if (!HELIUS_API_KEY) {
        return corsResponse(JSON.stringify({ error: "HELIUS_API_KEY is not set" }), 500);
    }

    if (!address) {
        return corsResponse(JSON.stringify({ error: "Address is required" }), 400);
    }

    try {
        const response = await fetch(
            `${HELIUS_RPC_URL}/?api-key=${HELIUS_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: "wallet-holdings",
                    method: "getAssetsByOwner",
                    params: {
                        ownerAddress: address,
                        page: 1,
                        limit: 1000,
                        sortBy: {
                            sortBy: "created",
                            sortDirection: "asc",
                        },
                        options: {
                            showUnverifiedCollections: false,
                            showCollectionMetadata: false,
                            showGrandTotal: true,
                            showFungible: true,
                            showNativeBalance: true,
                            showInscription: false,
                            showZeroBalance: false,
                        },
                    },
                }),
            }
        );

        const data = await response.json();

        if (data.error) {
            return corsResponse(JSON.stringify({ error: data.error.message }), 400);
        }

        const usdcAccount = data.result.items.find((asset: any) => asset.id === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v").token_info;
        const usdcBalance = usdcAccount.balance / 10 ** usdcAccount.decimals;

        const nativeBalance = data.result.nativeBalance;
        const solUsdValue = nativeBalance.total_price;

        const balance = {
            usdcBalance: usdcBalance,
            solBalance: nativeBalance.lamports / 10 ** 9,
            solBalanceUsd: solUsdValue,
        }

        return corsResponse(balance);
    } catch (error) {
        console.error("Error fetching wallet holdings:", error);
        return corsResponse(JSON.stringify({ error: "Failed to fetch wallet holdings" }), 500);
    }
});