// src/components/home-client.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Prompt } from '@/lib/prompts';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PromptGrid } from '@/components/prompt-grid';
import { AppSidebarContent } from '@/components/sidebar-content';
import { Sidebar, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { Search, Menu, Sun, Moon } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile hook

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
    if (favoritesLoading && currentFilter === 'favorites') {
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
  }, [prompts, searchTerm, currentFilter, favorites, favoritesLoading]);

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
        <main className="flex flex-col flex-1 h-full"> {/* Use flex-1 for main content */}
          {/* Header with Search & Theme Toggle */}
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 flex-shrink-0">
            <Button
              size="icon"
              variant="outline"
              onClick={toggleSidebar}
              className="md:hidden" // Only show on mobile
              aria-label="Toggle Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full appearance-none bg-background pl-8 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 md:w-2/3 lg:w-1/3" // Removed focus ring for cleaner look
              />
            </div>
            {mounted && ( // Render theme toggle only when mounted
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle Theme">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}
          </header>

          {/* Prompt Grid - Show Skeleton or Grid */}
          <div className="flex-grow overflow-y-auto"> {/* Allow vertical scroll */}
            {favoritesLoading && currentFilter === 'favorites' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 masonry">
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
