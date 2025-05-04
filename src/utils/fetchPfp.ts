export const fetchPfp = async (handle: string) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-twitter-pfp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ twitterHandle: handle }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching PFP:', error);
        return null;
    }
};