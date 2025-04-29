// src/components/home-client.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Prompt } from '@/lib/prompts';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PromptGrid } from '@/components/prompt-grid';
import { AppSidebarContent } from '@/components/sidebar-content';
import { Sidebar, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { Search, Menu, Sun, Moon, Feather } from 'lucide-react'; // Added Feather
import { useFavorites } from '@/hooks/use-favorites';
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile hook
import { cn } from "@/lib/utils";

interface HomeClientProps {
  initialPrompts: Prompt[];
  initialCategories: string[];
}

export function HomeClient({ initialPrompts, initialCategories }: HomeClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  const { favorites, isLoading: favoritesLoading } = useFavorites();
  const { toggleSidebar, open: sidebarOpen } = useSidebar(); // Get toggleSidebar and open state
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false); // For preventing hydration mismatch with theme


  // Ensure component is mounted before rendering theme-dependent UI
   useEffect(() => {
     setMounted(true);
   }, []);

  const prompts = initialPrompts;
  const categories = initialCategories;

  const filteredPrompts = useMemo(() => {
    // Get all prompts initially
    let result = prompts;

    // Filter by category or favorites
    if (currentFilter === 'favorites') {
       // If the favorites filter is active, filter based on the favorites list
       result = result.filter(prompt => favorites.includes(prompt.id));
    } else if (currentFilter) {
       // If a category filter is active
       result = result.filter(prompt => prompt.category === currentFilter);
    }
    // If no filter is active (currentFilter is null), result remains initialPrompts

    // Apply search term filtering *after* category/favorites filtering
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter(prompt =>
        prompt.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        prompt.details.toLowerCase().includes(lowerCaseSearchTerm) ||
        prompt.category.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    return result;
    // favoritesLoading is handled by the skeleton display logic, no need to include it here
  }, [prompts, searchTerm, currentFilter, favorites]);

  const handleFilterChange = (filter: string | null) => {
    setCurrentFilter(filter);
    // Close sidebar on mobile after selecting a filter
    if (isMobile && sidebarOpen) {
       toggleSidebar();
    }
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
         <main className="flex flex-col flex-1 h-full overflow-x-hidden"> {/* Use flex-1 and added overflow-x-hidden */}
           {/* Header with Search & Theme Toggle */}
           <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 flex-shrink-0 shadow-sm">
             <Button
               size="icon"
               variant="ghost"
               onClick={toggleSidebar}
               className="md:hidden rounded-full" // Only show on mobile, make round
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
               <div className="relative flex-1 max-w-md"> {/* Limit search bar width */}
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                   type="search"
                   placeholder="Search prompts..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full appearance-none bg-muted rounded-full pl-10 pr-4 py-2 shadow-inner focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 md:w-full"
                 />
               </div>
                {mounted && ( // Render theme toggle only when mounted
                 <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle Theme" className="rounded-full">
                   {theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                 </Button>
                )}
             </div>
           </header>

           {/* Prompt Grid - Show Skeleton or Grid */}
           <div className="flex-grow overflow-y-auto p-0 m-0"> {/* Allow vertical scroll */}
             {favoritesLoading && currentFilter === 'favorites' ? (
               <div className="p-4 sm:p-6 columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                 {[...Array(10)].map((_, i) => (
                   <Skeleton key={i} className="h-48 mb-4 rounded-lg break-inside-avoid" />
                 ))}
               </div>
             ) : (
               <PromptGrid prompts={filteredPrompts} />
             )}
           </div>
         </main>
      </SidebarInset>
    </>
  );
}
