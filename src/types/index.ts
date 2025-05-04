export interface RuggerAccount {
  id: string;
  handle: string;
  walletAddress: string;
  description: string;
  createdAt: number;
  upvotes: number;
  downvotes: number;
}

export interface CreatedCoin {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  created_timestamp: number;
  market_cap: number;
  usd_market_cap: number;
  nsfw: boolean;
}

export type SortOption = 'newest' | 'mostLiked' | 'leastLiked';