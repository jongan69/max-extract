import { useState, useEffect } from 'react';
import { fetchPfp } from '../utils/fetchPfp';

export function usePfp(twitterHandle: string) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPfpData = async () => {
      try {
        const profileImage = await fetchPfp(twitterHandle);
        setProfileImage(profileImage);
        setIsLoading(false);
      } catch (error) {
        setError(error as Error);
        setIsLoading(false);
      }
    };
    if (twitterHandle) {
      console.log('fetching pfp');
      fetchPfpData();
    }
  }, [twitterHandle]);

  return {
    profileImage,
    isLoading,
    error
  };
}