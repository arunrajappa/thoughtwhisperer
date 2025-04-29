import type { Prompt } from '@/lib/prompts';
import { PromptCard } from './prompt-card';

interface PromptGridProps {
  prompts: Prompt[];
}

export function PromptGrid({ prompts }: PromptGridProps) {
  if (!prompts || prompts.length === 0) {
    return <p className="text-center text-muted-foreground mt-8">No prompts found.</p>;
  }

  return (
    <div
      className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 p-4"
      style={{ columnFill: 'balance' }} // Improves masonry layout balance
    >
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}
