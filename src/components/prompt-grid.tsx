// src/components/prompt-grid.tsx
import type { Prompt } from '@/lib/prompts';
import { PromptCard } from './prompt-card';

interface PromptGridProps {
  prompts: Prompt[];
  onHashtagClick?: (hashtag: string) => void; // Add prop to accept handler
  // Add props for favorite state and handlers
  favorites: string[];
  addFavorite: (promptId: string) => void;
  removeFavorite: (promptId: string) => void;
  isFavorite: (promptId: string) => boolean;
  favoritesLoading: boolean;
}

export function PromptGrid({
  prompts,
  onHashtagClick,
  favorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  favoritesLoading
}: PromptGridProps) {
  if (!prompts || prompts.length === 0) {
    return <p className="text-center text-muted-foreground mt-8 p-4">No prompts found matching your criteria.</p>;
  }

  return (
    <div
      className="p-4 sm:p-6 columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4" // Changed to max 4 columns
      style={{ columnFill: 'balance' }} // Improves masonry layout balance across browsers
    >
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onHashtagClick={onHashtagClick} // Pass hashtag handler down
          // Pass favorite props down
          isFavorite={isFavorite(prompt.id)}
          onFavoriteToggle={() => {
             if (isFavorite(prompt.id)) {
               removeFavorite(prompt.id);
             } else {
               addFavorite(prompt.id);
             }
          }}
          favoritesLoading={favoritesLoading}
        />
      ))}
    </div>
  );
}
