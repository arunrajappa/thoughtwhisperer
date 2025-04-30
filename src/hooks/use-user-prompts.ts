// src/hooks/use-user-prompts.ts
import { useState, useEffect, useCallback } from 'react';
import type { Prompt } from '@/lib/prompts';

const USER_PROMPTS_STORAGE_KEY = 'thoughtWhispererUserPrompts';

export function useUserPrompts() {
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedValue = localStorage.getItem(USER_PROMPTS_STORAGE_KEY);
      if (storedValue) {
        const parsedPrompts = JSON.parse(storedValue);
        // Basic validation
        if (Array.isArray(parsedPrompts) && parsedPrompts.every(p => p.id && p.title && p.details && typeof p.category === 'string')) {
          setUserPrompts(parsedPrompts);
        } else {
          console.warn("Invalid data format in user prompts localStorage. Resetting.");
          localStorage.removeItem(USER_PROMPTS_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Error reading user prompts from localStorage:", error);
      localStorage.removeItem(USER_PROMPTS_STORAGE_KEY); // Clear invalid data
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserStorage = useCallback((updatedPrompts: Prompt[]) => {
    try {
      localStorage.setItem(USER_PROMPTS_STORAGE_KEY, JSON.stringify(updatedPrompts));
    } catch (error) {
      console.error("Error saving user prompts to localStorage:", error);
      // Consider notifying the user or implementing a fallback
    }
  }, []);

  const addUserPrompt = useCallback((newPrompt: Prompt) => {
    setUserPrompts((prevPrompts) => {
      // Prepend the new prompt
      const updatedPrompts = [newPrompt, ...prevPrompts];
      updateUserStorage(updatedPrompts);
      return updatedPrompts;
    });
  }, [updateUserStorage]);

  // Optional: Add functions to remove or update prompts if needed later

  return { userPrompts, addUserPrompt, isLoading };
}
