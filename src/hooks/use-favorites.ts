import { useState, useEffect, useCallback } from 'react';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';

const FAVORITES_COOKIE_NAME = 'favoritePrompts';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const cookieValue = getCookie(FAVORITES_COOKIE_NAME);
    if (typeof cookieValue === 'string') {
        try {
            const parsedFavorites = JSON.parse(cookieValue);
            if (Array.isArray(parsedFavorites)) {
              setFavorites(parsedFavorites);
            }
        } catch (e) {
            console.error("Error parsing favorites cookie:", e);
            // Clear invalid cookie
            deleteCookie(FAVORITES_COOKIE_NAME);
        }
    }
  }, []);

  const updateCookie = (updatedFavorites: string[]) => {
     setCookie(FAVORITES_COOKIE_NAME, JSON.stringify(updatedFavorites), {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
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

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
