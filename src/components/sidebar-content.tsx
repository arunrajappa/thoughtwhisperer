// src/components/sidebar-content.tsx
'use client';

import React from 'react';
import { SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Tag, Star, Home, Settings, Feather, UserCircle } from 'lucide-react'; // Added UserCircle
import { cn } from '@/lib/utils';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from './ui/button';

interface SidebarContentProps {
  categories: string[];
  currentFilter: string | null; // Can be category, 'favorites', 'my-prompts'
  onFilterChange: (filter: string | null) => void;
  favoritesLoading: boolean;
  userPromptsLoading: boolean; // Add loading state for user prompts
}

export function AppSidebarContent({
  categories,
  currentFilter,
  onFilterChange,
  favoritesLoading,
  userPromptsLoading // Receive loading state
}: SidebarContentProps) {
  const isFavoritesActive = currentFilter === 'favorites';
  const isMyPromptsActive = currentFilter === 'my-prompts'; // Check if My Prompts is active
  const isAllActive = currentFilter === null;

  return (
    <>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Feather className="h-6 w-6 text-accent" />
          <h2 className="text-xl font-semibold text-foreground">Thought Whisperer</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Your companion for prompting.</p>
      </SidebarHeader>
      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {/* All Prompts */}
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

          {/* Favorites */}
          {favoritesLoading ? (
            <SidebarMenuItem className="px-2">
              <Skeleton className="h-8 w-full rounded-md" />
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

           {/* My Prompts */}
          {userPromptsLoading ? (
             <SidebarMenuItem className="px-2">
               <Skeleton className="h-8 w-full rounded-md" />
             </SidebarMenuItem>
           ) : (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => onFilterChange('my-prompts')}
                isActive={isMyPromptsActive}
                className={cn(
                  "w-full justify-start transition-colors duration-150 hover:bg-accent/10",
                  isMyPromptsActive && "bg-accent text-accent-foreground hover:bg-accent/90"
                )}
                aria-current={isMyPromptsActive ? 'page' : undefined}
                disabled={userPromptsLoading} // Disable while loading user prompts
                tooltip="View prompts you created"
              >
                <UserCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">My Prompts</span>
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
            // Skip rendering 'Uncategorized' if you prefer not to show it explicitly
            // if (category === 'Uncategorized') return null;

            const isActive = currentFilter === category;
            const categoryLabel = category.replace(/-/g, ' ');
            return (
              <SidebarMenuItem key={category}>
                <SidebarMenuButton
                  onClick={() => onFilterChange(category)}
                  isActive={isActive}
                  className={cn(
                    "w-full justify-start transition-colors duration-150 hover:bg-accent/10 capitalize",
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
    </>
  );
}
