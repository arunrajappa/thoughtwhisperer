// src/components/home-client.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Prompt } from '@/lib/prompts';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PromptGrid } from '@/components/prompt-grid';
import { AppSidebarContent } from '@/components/sidebar-content';
import { Sidebar, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { Search, Menu, Sun, Moon, Feather } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface HomeClientProps {
  initialPrompts: Prompt[];
  initialCategories: string[];
}

export function HomeClient({ initialPrompts, initialCategories }: HomeClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  const { favorites, isLoading: favoritesLoading } = useFavorites();
  const { toggleSidebar, open: sidebarOpen } = useSidebar();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);


   useEffect(() => {
     setMounted(true);
   }, []);

  const prompts = initialPrompts;
  const categories = initialCategories;

  const filteredPrompts = useMemo(() => {
    let result = prompts;

    // Filter by category or favorites
    if (currentFilter === 'favorites') {
       // Ensure favorites array is not empty and not loading before filtering
       if (!favoritesLoading && favorites.length > 0) {
         result = result.filter(prompt => favorites.includes(prompt.id));
       } else if (favoritesLoading || favorites.length === 0) {
         // If loading or no favorites, show no prompts under the 'favorites' filter
         result = [];
       }
    } else if (currentFilter) {
       result = result.filter(prompt => prompt.category === currentFilter);
    }

    // Apply search term filtering *after* category/favorites filtering
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      // Check if search term starts with # for hashtag specific search
      if (lowerCaseSearchTerm.startsWith('#')) {
        const searchTag = lowerCaseSearchTerm.substring(1); // Get tag without #
        result = result.filter(prompt => {
          // Extract hashtags from the prompt details (similar logic to PromptCard)
          const lines = prompt.details?.trim().split('\n') ?? [];
          const lastLine = lines[lines.length - 1]?.trim() ?? '';
          if (lastLine.startsWith('#')) {
            const promptHashtags = lastLine
              .split('#')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0 && !tag.includes(' '));
            return promptHashtags.some(tag => tag.toLowerCase() === searchTag);
          }
          return false; // No hashtags found in this prompt
        });
      } else {
        // Normal search (title, details, category)
        result = result.filter(prompt =>
          prompt.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          prompt.details.toLowerCase().includes(lowerCaseSearchTerm) ||
          prompt.category.toLowerCase().includes(lowerCaseSearchTerm)
        );
      }
    }

    return result;
  }, [prompts, searchTerm, currentFilter, favorites, favoritesLoading]); // Add favoritesLoading dependency


  const handleFilterChange = (filter: string | null) => {
    setCurrentFilter(filter);
    setSearchTerm(''); // Clear search term when changing category/favorites filter
    if (isMobile && sidebarOpen) {
       toggleSidebar();
    }
  };

  // New handler for clicking hashtag badges
  const handleHashtagClick = (hashtag: string) => {
    setCurrentFilter(null); // Clear category filter
    setSearchTerm(hashtag); // Set search term to the clicked hashtag
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };


  return (
    <>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <AppSidebarContent
          categories={categories}
          currentFilter={currentFilter}
          onFilterChange={handleFilterChange}
          favoritesLoading={favoritesLoading}
        />
      </Sidebar>
      <SidebarInset>
         <main className="flex flex-col flex-1 h-full overflow-x-hidden">
           {/* Header with Search & Theme Toggle */}
           <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6 flex-shrink-0 shadow-sm">
             <Button
               size="icon"
               variant="ghost"
               onClick={toggleSidebar}
               className="md:hidden rounded-full"
               aria-label="Toggle Menu"
             >
               <Menu className="h-5 w-5" />
             </Button>

             {/* Logo for Mobile */}
              <div className="flex items-center gap-2 md:hidden">
                <Feather className="h-6 w-6 text-accent" />
                <span className="font-semibold text-lg">Thought Whisperer</span>
              </div>


             <div className="relative flex-1 ml-auto flex items-center justify-end gap-2">
               <div className="relative flex-1 max-w-md">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                   type="search"
                   placeholder="Search or filter #hashtag..." // Updated placeholder
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full appearance-none bg-muted rounded-full pl-10 pr-4 py-2 shadow-inner focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 md:w-full"
                 />
               </div>
                {mounted && (
                 <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle Theme" className="rounded-full">
                   {theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                 </Button>
                )}
             </div>
           </header>

           {/* Prompt Grid - Show Skeleton or Grid */}
           <div className="flex-grow overflow-y-auto p-0 m-0">
             {/* Show skeleton ONLY when loading favorites AND the filter is set to favorites */}
             {favoritesLoading && currentFilter === 'favorites' ? (
               <div className="p-4 sm:p-6 columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                 {[...Array(6)].map((_, i) => ( // Reduced skeleton count
                   <Skeleton key={i} className="h-48 mb-4 rounded-lg break-inside-avoid" />
                 ))}
               </div>
             ) : (
                // Show the grid otherwise (either not loading, or not on favorites filter, or favorites loaded)
               <PromptGrid
                  prompts={filteredPrompts}
                  onHashtagClick={handleHashtagClick} // Pass the handler
                />
             )}
           </div>
         </main>
      </SidebarInset>
    </>
  );
}
