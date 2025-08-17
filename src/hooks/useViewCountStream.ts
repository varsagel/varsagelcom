import { useState, useEffect } from 'react';

export function useViewCountStream(listingId: string) {
  const [realTimeViewCount, setRealTimeViewCount] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!listingId || listingId === '') {
      console.log('useViewCountStream: listingId is empty or undefined:', listingId);
      return;
    }

    console.log('useViewCountStream: Starting with listingId:', listingId);
    let intervalId: NodeJS.Timeout | null = null;
    let isActive = true;

    const fetchViewCount = async () => {
      try {
        console.log('Fetching view count for listing:', listingId);
        const response = await fetch(`/api/listings/${listingId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (isActive && data.listing?.viewCount !== undefined) {
          setRealTimeViewCount(data.listing.viewCount);
          setIsConnected(true);
          console.log('Updated view count:', data.listing.viewCount);
        }
      } catch (error) {
        console.error('Error fetching view count:', error);
        setIsConnected(false);
      }
    };

    const startPolling = () => {
      // Initial fetch
      fetchViewCount();
      
      // Set up polling every 5 seconds
      intervalId = setInterval(fetchViewCount, 5000);
    };

    startPolling();

    // Cleanup function
    return () => {
      isActive = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
      setIsConnected(false);
    };
  }, [listingId]);

  return { viewCount: realTimeViewCount, isConnected };
}