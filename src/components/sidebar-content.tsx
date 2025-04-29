'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Tag, Star, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarContentProps {
  categories: string[];
  currentFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export function AppSidebarContent({ categories, currentFilter, onFilterChange }: SidebarContentProps) {
  const pathname = usePathname();
  const isFavoritesActive = currentFilter === 'favorites';
  const isAllActive = currentFilter === null;

  return (
    <>
      <SidebarHeader className="p-4">
        <h2 className="text-xl font-semibold text-foreground">Thought Whisperer</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onFilterChange(null)}
              isActive={isAllActive}
              className={cn("w-full justify-start", isAllActive && "bg-accent text-accent-foreground")}
              aria-current={isAllActive ? 'page' : undefined}
            >
              <Home className="h-4 w-4 mr-2" />
              All Prompts
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onFilterChange('favorites')}
              isActive={isFavoritesActive}
              className={cn("w-full justify-start", isFavoritesActive && "bg-accent text-accent-foreground")}
              aria-current={isFavoritesActive ? 'page' : undefined}
            >
              <Star className="h-4 w-4 mr-2" />
              Favorites
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <hr className="my-4 border-border" />

        <SidebarMenu>
          <SidebarMenuItem className="px-2 mb-1 text-sm font-medium text-muted-foreground">
            Categories
          </SidebarMenuItem>
          {categories.map((category) => {
            const isActive = currentFilter === category;
            return (
              <SidebarMenuItem key={category}>
                <SidebarMenuButton
                  onClick={() => onFilterChange(category)}
                  isActive={isActive}
                  className={cn("w-full justify-start", isActive && "bg-accent text-accent-foreground")}
                   aria-current={isActive ? 'page' : undefined}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  {category}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
