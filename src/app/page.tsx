'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { getPrompts, getCategories, type Prompt } from '@/lib/prompts';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PromptGrid } from '@/components/prompt-grid';
import { AppSidebarContent } from '@/components/sidebar-content';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Menu } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';

// Fetch data on the server initially, but manage state client-side
interface HomeProps {
  initialPrompts: Prompt[];
  initialCategories: string[];
}

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState<string | null>(null); // Can be category name, 'favorites', or null
  const { favorites } = useFavorites();
  const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [loadedPrompts, loadedCategories] = await Promise.all([
          getPrompts(),
          getCategories()
        ]);
        setPrompts(loadedPrompts);
        setCategories(loadedCategories);
      } catch (error) {
        console.error("Failed to load prompts or categories:", error);
        // Optionally show an error message to the user
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);


  const filteredPrompts = useMemo(() => {
     if (isLoading) return []; // Don't filter until loaded

    let result = prompts;

    // Filter by category or favorites
    if (currentFilter === 'favorites') {
      result = result.filter(prompt => favorites.includes(prompt.id));
    } else if (currentFilter) {
      result = result.filter(prompt => prompt.category === currentFilter);
    }

    // Filter by search term (case-insensitive)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter(prompt =>
        prompt.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        prompt.details.toLowerCase().includes(lowerCaseSearchTerm) ||
        prompt.category.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    return result;
  }, [prompts, searchTerm, currentFilter, favorites, isLoading]);

  const handleFilterChange = (filter: string | null) => {
    setCurrentFilter(filter);
     // Optionally close mobile sidebar on selection
     // You might need access to setOpenMobile from useSidebar context if you pass it down
  };


  return (
    <SidebarProvider defaultOpen={true} >
      <Sidebar side="left" variant="sidebar" collapsible="icon">
         {isLoading ? (
             <div className="p-4">Loading sidebar...</div> // Or a skeleton loader
            ) : (
             <AppSidebarContent
               categories={categories}
               currentFilter={currentFilter}
               onFilterChange={handleFilterChange}
             />
            )}
      </Sidebar>
      <SidebarInset>
        <main className="flex flex-col h-full">
          {/* Header with Search */}
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
             {/* Mobile Sidebar Trigger */}
             <div className="md:hidden">
               <SidebarTrigger asChild>
                  <Button size="icon" variant="outline">
                   <Menu className="h-5 w-5" />
                   <span className="sr-only">Toggle Menu</span>
                  </Button>
               </SidebarTrigger>
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

          {/* Prompt Grid */}
           {isLoading ? (
             <div className="flex-grow flex items-center justify-center">
               <p>Loading prompts...</p> {/* Or a more sophisticated loader */}
             </div>
            ) : (
           <div className="flex-grow overflow-auto">
             <PromptGrid prompts={filteredPrompts} />
           </div>
           )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
