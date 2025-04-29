// src/components/home-client.tsx
'use client';

import React, { useState, useMemo } from 'react';
import type { Prompt } from '@/lib/prompts';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PromptGrid } from '@/components/prompt-grid';
import { AppSidebarContent } from '@/components/sidebar-content';
import { SidebarProvider, Sidebar, SidebarInset, useSidebar } from "@/components/ui/sidebar"; // Import useSidebar
import { Search, Menu } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

interface HomeClientProps {
  initialPrompts: Prompt[];
  initialCategories: string[];
}

function HomeClientContent({ initialPrompts, initialCategories }: HomeClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  const { favorites, isLoading: favoritesLoading } = useFavorites(); // Get isLoading state
  const { toggleSidebar } = useSidebar(); // Get toggleSidebar function

  const prompts = initialPrompts;
  const categories = initialCategories;

  const filteredPrompts = useMemo(() => {
    if (favoritesLoading && currentFilter === 'favorites') {
      // If favorites are loading and the filter is 'favorites', return empty array temporarily
      return [];
    }

    let result = prompts;

    if (currentFilter === 'favorites') {
      result = result.filter(prompt => favorites.includes(prompt.id));
    } else if (currentFilter) {
      result = result.filter(prompt => prompt.category === currentFilter);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter(prompt =>
        prompt.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        prompt.details.toLowerCase().includes(lowerCaseSearchTerm) ||
        prompt.category.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    return result;
  }, [prompts, searchTerm, currentFilter, favorites, favoritesLoading]); // Add favoritesLoading dependency

  const handleFilterChange = (filter: string | null) => {
    setCurrentFilter(filter);
  };

  return (
    <>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
         <AppSidebarContent
           categories={categories}
           currentFilter={currentFilter}
           onFilterChange={handleFilterChange}
           favoritesLoading={favoritesLoading} // Pass loading state to sidebar
         />
      </Sidebar>
      <SidebarInset>
        <main className="flex flex-col h-full">
          {/* Header with Search */}
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
             <div className="md:hidden">
               {/* Use a standard Button and call toggleSidebar directly */}
               <Button size="icon" variant="outline" onClick={toggleSidebar}>
                 <Menu className="h-5 w-5" />
                 <span className="sr-only">Toggle Menu</span>
               </Button>
             </div>

            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
              />
            </div>
          </header>

          {/* Prompt Grid - Show Skeleton or Grid */}
           <div className="flex-grow overflow-auto">
             {favoritesLoading && currentFilter === 'favorites' ? (
               // Show skeleton loading state for grid when filtering by favorites and loading
               <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 p-4">
                 {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-48 mb-4 rounded-lg" />
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

export function HomeClient(props: HomeClientProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <HomeClientContent {...props} />
    </SidebarProvider>
  );
}
