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
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const { toast } = useToast();
  const { addFavorite, removeFavorite, isFavorite, isLoading: favoritesLoading } = useFavorites(); // Get isLoading state
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
      handleCopy();
      toast({
        title: "Copied to clipboard",
        description: "Sharing not supported, prompt copied instead.",
      });
    }
  };

  const handleFavoriteToggle = () => {
    if (favoritesLoading) return; // Don't toggle if still loading

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
    <Card className="h-full flex flex-col break-inside-avoid mb-4 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{prompt.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-sm text-muted-foreground whitespace-pre-wrap">
        {prompt.details}
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4 border-t mt-auto">
        <Badge variant="secondary">{prompt.category}</Badge>
        <div className="flex space-x-1">
           {favoritesLoading ? (
              <Skeleton className="h-10 w-10 rounded-md" /> // Skeleton for favorite button
           ) : (
              <Button variant="ghost" size="icon" onClick={handleFavoriteToggle} aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'} disabled={favoritesLoading}>
               <Star className={cn("h-4 w-4", favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
              </Button>
           )}
           <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share prompt">
             <Share2 className="h-4 w-4 text-muted-foreground" />
           </Button>
           <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy prompt text">
             <Copy className="h-4 w-4 text-muted-foreground" />
           </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
