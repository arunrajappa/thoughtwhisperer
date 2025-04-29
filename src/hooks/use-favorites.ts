import { useState, useEffect, useCallback } from 'react';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';

const FAVORITES_COOKIE_NAME = 'favoritePrompts';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state

  useEffect(() => {
    setIsLoading(true); // Start loading
    const cookieValue = getCookie(FAVORITES_COOKIE_NAME);
    let initialFavorites: string[] = [];
    if (typeof cookieValue === 'string') {
        try {
            const parsedFavorites = JSON.parse(cookieValue);
            if (Array.isArray(parsedFavorites) && parsedFavorites.every(item => typeof item === 'string')) {
              initialFavorites = parsedFavorites;
            } else {
               console.warn("Invalid data format in favorites cookie. Resetting.");
               deleteCookie(FAVORITES_COOKIE_NAME); // Delete invalid cookie
            }
        } catch (e) {
            console.error("Error parsing favorites cookie:", e);
            // Clear invalid cookie if parsing fails
            deleteCookie(FAVORITES_COOKIE_NAME);
        }
    }
    setFavorites(initialFavorites);
    setIsLoading(false); // Finish loading after setting state
    // Intentionally run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateCookie = (updatedFavorites: string[]) => {
     setCookie(FAVORITES_COOKIE_NAME, JSON.stringify(updatedFavorites), {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
        sameSite: 'lax', // Add SameSite attribute for security
      });
  };

  const addFavorite = useCallback((promptId: string) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(promptId)) {
        return prevFavorites;
      }
      const updatedFavorites = [...prevFavorites, promptId];
      updateCookie(updatedFavorites);
      return updatedFavorites;
    });
  }, []);

  const removeFavorite = useCallback((promptId: string) => {
    setFavorites((prevFavorites) => {
      if (!prevFavorites.includes(promptId)) {
        return prevFavorites;
      }
      const updatedFavorites = prevFavorites.filter((id) => id !== promptId);
      updateCookie(updatedFavorites);
      return updatedFavorites;
    });
  }, []);

  const isFavorite = useCallback((promptId: string) => {
    return favorites.includes(promptId);
  }, [favorites]);

  return { favorites, addFavorite, removeFavorite, isFavorite, isLoading }; // Return loading state
}
