// src/components/home-client.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Prompt } from '@/lib/prompts';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PromptGrid } from '@/components/prompt-grid';
import { AppSidebarContent } from '@/components/sidebar-content';
import { Sidebar, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { Search, Menu, Sun, Moon, Feather, PlusCircle } from 'lucide-react'; // Added PlusCircle
import { useFavorites } from '@/hooks/use-favorites';
import { useUserPrompts } from '@/hooks/use-user-prompts'; // Import useUserPrompts
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { AddPromptDialog } from './add-prompt-dialog'; // Import AddPromptDialog
import { AboutDialog } from './about-dialog'; // Import AboutDialog

interface HomeClientProps {
  initialPrompts: Prompt[];
  initialCategories: string[];
}

export function HomeClient({ initialPrompts, initialCategories }: HomeClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState<string | null>(null); // Filter can be category, 'favorites', or 'my-prompts'
  const [isAddPromptDialogOpen, setIsAddPromptDialogOpen] = useState(false);
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false); // State for About dialog
  const {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    isLoading: favoritesLoading,
  } = useFavorites();
  const {
      userPrompts,
      addUserPrompt,
      isLoading: userPromptsLoading
  } = useUserPrompts();

  const { toggleSidebar, open: sidebarOpen } = useSidebar();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

   useEffect(() => {
     setMounted(true);
   }, []);

  // Combine initial prompts and user prompts
  const allPrompts = useMemo(() => {
     const combined = [...userPrompts, ...initialPrompts];
     return combined;
  }, [initialPrompts, userPrompts]);

  const filteredPrompts = useMemo(() => {
    let result = [...allPrompts]; // Start with combined prompts

    // Filter by category, favorites, or my prompts
    if (currentFilter === 'favorites') {
       result = result.filter(prompt => isFavorite(prompt.id));
       // Handle loading state separately in the grid
    } else if (currentFilter === 'my-prompts') {
       if (!userPromptsLoading) {
         result = userPrompts; // Show only user prompts
       } else {
          result = []; // Show nothing if loading
       }
    } else if (currentFilter) {
       // Filter by specific category
       result = result.filter(prompt => prompt.category === currentFilter);
    }
    // If currentFilter is null, result remains allPrompts (before search)

    // Apply search term filtering *after* primary filtering
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      if (lowerCaseSearchTerm.startsWith('#')) {
        const searchTag = lowerCaseSearchTerm.substring(1);
        result = result.filter(prompt => {
          const lines = prompt.details?.trim().split('\n') ?? [];
          const lastLine = lines[lines.length - 1]?.trim() ?? '';
          if (lastLine.startsWith('#')) {
            const promptHashtags = lastLine
              .split('#')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0 && !tag.includes(' '));
            return promptHashtags.some(tag => tag.toLowerCase() === searchTag);
          }
          return false;
        });
      } else {
        result = result.filter(prompt =>
          prompt.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          prompt.details.toLowerCase().includes(lowerCaseSearchTerm) ||
          prompt.category.toLowerCase().includes(lowerCaseSearchTerm)
        );
      }
    }
    return result;
  }, [allPrompts, searchTerm, currentFilter, isFavorite, favoritesLoading, userPrompts, userPromptsLoading]);


  const handleFilterChange = (filter: string | null) => {
    setCurrentFilter(filter);
    setSearchTerm('');
    if (isMobile && sidebarOpen) {
       toggleSidebar();
    }
  };

  const handleHashtagClick = (hashtag: string) => {
    setCurrentFilter(null); // Clear primary filter when clicking hashtag
    setSearchTerm(hashtag);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Loading state specifically for when filtering by favorites or user prompts
  const isGridLoading = (favoritesLoading && currentFilter === 'favorites') || (userPromptsLoading && currentFilter === 'my-prompts');

  // Get unique categories from both initial and user prompts
  const allCategories = useMemo(() => {
     const combinedCategories = new Set([
       ...initialCategories,
       ...userPrompts.map(p => p.category).filter(c => c && c !== 'Uncategorized') // Get user categories, filter out empty/uncategorized
     ]);
     return Array.from(combinedCategories).sort((a, b) => a.localeCompare(b));
   }, [initialCategories, userPrompts]);

  return (
    <>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <AppSidebarContent
          categories={allCategories} // Use combined categories
          currentFilter={currentFilter}
          onFilterChange={handleFilterChange}
          favoritesLoading={favoritesLoading}
          userPromptsLoading={userPromptsLoading} // Pass user prompts loading state
          onAboutClick={() => setIsAboutDialogOpen(true)} // Pass handler to open About dialog
        />
      </Sidebar>
      <SidebarInset>
         <main className="flex flex-col flex-1 h-full overflow-x-hidden">
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

             <div className="flex items-center gap-2 md:hidden">
                <Feather className="h-6 w-6 text-accent" />
                <span className="font-semibold text-lg">Thought Whisperer</span>
              </div>


             <div className="relative flex-1 ml-auto flex items-center justify-end gap-2">
                {/* Add New Prompt Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddPromptDialogOpen(true)}
                    className="rounded-full hidden sm:inline-flex" // Hide on very small screens if needed
                    aria-label="Add New Prompt"
                 >
                   <PlusCircle className="h-4 w-4 mr-1" />
                   Add Prompt
                 </Button>
                  {/* Icon only button for smaller screens */}
                 <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsAddPromptDialogOpen(true)}
                    className="rounded-full sm:hidden"
                    aria-label="Add New Prompt"
                 >
                   <PlusCircle className="h-5 w-5" />
                 </Button>

               <div className="relative flex-1 max-w-md">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                   type="search"
                   placeholder="Search or filter #hashtag..."
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

           <div className="flex-grow overflow-y-auto p-0 m-0">
             {isGridLoading ? (
               <div className="p-4 sm:p-6 columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                 {[...Array(6)].map((_, i) => (
                   <Skeleton key={i} className="h-48 mb-4 rounded-lg break-inside-avoid" />
                 ))}
               </div>
             ) : (
               <PromptGrid
                  prompts={filteredPrompts}
                  onHashtagClick={handleHashtagClick}
                  favorites={favorites}
                  addFavorite={addFavorite}
                  removeFavorite={removeFavorite}
                  isFavorite={isFavorite}
                  favoritesLoading={favoritesLoading} // Pass the specific loading state for favorites
                />
             )}
           </div>
         </main>
      </SidebarInset>

      {/* Add Prompt Dialog */}
       <AddPromptDialog
         open={isAddPromptDialogOpen}
         onOpenChange={setIsAddPromptDialogOpen}
         categories={allCategories} // Pass combined categories
         onAddPrompt={addUserPrompt} // Pass the handler from the hook
       />

      {/* About Dialog */}
       <AboutDialog
         open={isAboutDialogOpen}
         onOpenChange={setIsAboutDialogOpen}
       />
    </>
  );
}
