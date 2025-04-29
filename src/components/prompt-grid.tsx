import type { Prompt } from '@/lib/prompts';
import { PromptCard } from './prompt-card';

interface PromptGridProps {
  prompts: Prompt[];
}

export function PromptGrid({ prompts }: PromptGridProps) {
  if (!prompts || prompts.length === 0) {
    return <p className="text-center text-muted-foreground mt-8 p-4">No prompts found matching your criteria.</p>;
  }

  return (
    <div
      className="p-4 sm:p-6 columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4" // Changed to max 4 columns
      style={{ columnFill: 'balance' }} // Improves masonry layout balance across browsers
    >
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}
