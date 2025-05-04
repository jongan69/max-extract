export const fetchBalance = async (walletAddress: string) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wallet-balance?address=${walletAddress}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}
