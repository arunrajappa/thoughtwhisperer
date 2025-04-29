// src/app/page.tsx
import { getPrompts, getCategories } from '@/lib/prompts';
import { HomeClient } from '@/components/home-client';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebarContent } from '@/components/sidebar-content';

// Revalidate data periodically if prompts.md might change
// Or use 'force-dynamic' if changes should be reflected immediately without rebuilds
export const revalidate = 3600; // Revalidate data every hour, for example

export default async function Page() {
  // Fetch data on the server using functions that utilize 'fs'
  const initialPrompts = await getPrompts();
  const initialCategories = await getCategories();

  // Pass data to the client component
  // Wrap with SidebarProvider here at the page level
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-full"> {/* Ensure the container takes full height */}
        <HomeClient
          initialPrompts={initialPrompts}
          initialCategories={initialCategories}
        />
      </div>
    </SidebarProvider>
  );
}
