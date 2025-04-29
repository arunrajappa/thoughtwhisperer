// src/components/sidebar-content.tsx
'use client';

import React from 'react';
import { SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Tag, Star, Home, Settings, Feather } from 'lucide-react'; // Added Feather and Settings
import { cn } from '@/lib/utils';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from './ui/button'; // Import Button for potential settings link/modal later

interface SidebarContentProps {
  categories: string[];
  currentFilter: string | null;
  onFilterChange: (filter: string | null) => void;
  favoritesLoading: boolean;
}

export function AppSidebarContent({ categories, currentFilter, onFilterChange, favoritesLoading }: SidebarContentProps) {
  const isFavoritesActive = currentFilter === 'favorites';
  const isAllActive = currentFilter === null;

  return (
    <>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Feather className="h-6 w-6 text-accent" /> {/* Whisper icon */}
          <h2 className="text-xl font-semibold text-foreground">Thought Whisperer</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Your companion for prompting.</p>
      </SidebarHeader>
      <SidebarContent className="flex-grow p-2"> {/* Use flex-grow and padding */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onFilterChange(null)}
              isActive={isAllActive}
              className={cn(
                "w-full justify-start transition-colors duration-150 hover:bg-accent/10",
                isAllActive && "bg-accent text-accent-foreground hover:bg-accent/90"
              )}
              aria-current={isAllActive ? 'page' : undefined}
              tooltip="View all available prompts"
            >
              <Home className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">All Prompts</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {favoritesLoading ? (
            <SidebarMenuItem className="px-2">
              <Skeleton className="h-8 w-full rounded-md" /> {/* Skeleton for Favorites */}
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => onFilterChange('favorites')}
                isActive={isFavoritesActive}
                className={cn(
                  "w-full justify-start transition-colors duration-150 hover:bg-accent/10",
                  isFavoritesActive && "bg-accent text-accent-foreground hover:bg-accent/90"
                )}
                aria-current={isFavoritesActive ? 'page' : undefined}
                disabled={favoritesLoading}
                tooltip="View your favorited prompts"
              >
                <Star className="h-4 w-4 mr-2 flex-shrink-0" />
                 <span className="truncate">Favorites</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>

        <hr className="my-3 border-sidebar-border" />

        <SidebarMenu>
          <SidebarMenuItem className="px-2 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Categories
          </SidebarMenuItem>
          {categories.map((category) => {
            const isActive = currentFilter === category;
            const categoryLabel = category.replace(/-/g, ' '); // Replace hyphens for display
            return (
              <SidebarMenuItem key={category}>
                <SidebarMenuButton
                  onClick={() => onFilterChange(category)}
                  isActive={isActive}
                  className={cn(
                    "w-full justify-start transition-colors duration-150 hover:bg-accent/10 capitalize", // Added capitalize
                    isActive && "bg-accent text-accent-foreground hover:bg-accent/90"
                  )}
                   aria-current={isActive ? 'page' : undefined}
                   tooltip={`Filter by ${categoryLabel}`}
                >
                  <Tag className="h-4 w-4 mr-2 flex-shrink-0" />
                   <span className="truncate">{categoryLabel}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
       {/* Optional Footer - Could add settings or theme toggle here too */}
      {/* <SidebarFooter className="p-2 border-t border-sidebar-border mt-auto">
         <Button variant="ghost" className="w-full justify-start">
           <Settings className="h-4 w-4 mr-2" />
           Settings
         </Button>
       </SidebarFooter> */}
    </>
  );
}
