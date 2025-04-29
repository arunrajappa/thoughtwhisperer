import { getPrompts, getCategories } from '@/lib/prompts';
import { HomeClient } from '@/components/home-client'; // Import the renamed client component

// Revalidate data periodically if prompts.md might change
// Or use 'force-dynamic' if changes should be reflected immediately without rebuilds
export const revalidate = 3600; // Revalidate data every hour, for example

export default async function Page() {
  // Fetch data on the server using functions that utilize 'fs'
  const initialPrompts = await getPrompts();
  const initialCategories = await getCategories();

  // Render the client component, passing the server-fetched data as props
  return (
    <HomeClient
      initialPrompts={initialPrompts}
      initialCategories={initialCategories}
    />
  );
}
