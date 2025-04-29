// src/components/prompt-card.tsx
'use client';

import type { Prompt } from '@/lib/prompts';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Share2, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from '@/hooks/use-favorites';
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const { toast } = useToast();
  const { addFavorite, removeFavorite, isFavorite, isLoading: favoritesLoading } = useFavorites();
  const favorite = isFavorite(prompt.id);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.details);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard.",
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Error",
        description: "Failed to copy prompt.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: prompt.title,
          text: prompt.details,
        });
      } catch (err) {
        console.error('Error sharing:', err);
         toast({
            title: "Sharing failed",
            description: "Could not share the prompt at this moment.",
            variant: "destructive",
         });
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      handleCopy();
      toast({
        title: "Copied to clipboard",
        description: "Web Share API not supported, prompt copied instead.",
      });
    }
  };

  const handleFavoriteToggle = () => {
    if (favoritesLoading) return;

    if (favorite) {
      removeFavorite(prompt.id);
      toast({
        title: "Removed from favorites",
      });
    } else {
      addFavorite(prompt.id);
       toast({
        title: "Added to favorites",
      });
    }
  };

  return (
    <Card className="h-full flex flex-col break-inside-avoid mb-4 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out bg-card border border-border rounded-lg overflow-hidden group">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold group-hover:text-accent transition-colors">{prompt.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-sm text-muted-foreground whitespace-pre-wrap pb-4">
        {/* Render markdown as HTML for basic formatting like line breaks */}
        <div dangerouslySetInnerHTML={{ __html: prompt.details.replace(/\n/g, '<br />') }} />
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-3 border-t mt-auto bg-muted/30 dark:bg-muted/10 px-4 py-2">
        <Badge variant="secondary" className="text-xs capitalize">{prompt.category.replace(/-/g, ' ')}</Badge>
        <div className="flex space-x-0.5">
           {favoritesLoading ? (
              <Skeleton className="h-8 w-8 rounded-full" /> // Skeleton for favorite button
           ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteToggle}
                aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                disabled={favoritesLoading}
                className="h-8 w-8 rounded-full hover:bg-accent/10"
                aria-pressed={favorite}
                title={favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
               <Star className={cn("h-4 w-4 transition-colors duration-200", favorite ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground group-hover:text-accent")} />
              </Button>
           )}
           <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              aria-label="Share prompt"
              className="h-8 w-8 rounded-full hover:bg-accent/10"
              title="Share prompt"
           >
             <Share2 className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors duration-200" />
           </Button>
           <Button
             variant="ghost"
             size="icon"
             onClick={handleCopy}
             aria-label="Copy prompt text"
             className="h-8 w-8 rounded-full hover:bg-accent/10"
             title="Copy prompt text"
           >
             <Copy className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors duration-200" />
           </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
