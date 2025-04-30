// src/components/prompt-card.tsx
'use client';

import type { Prompt } from '@/lib/prompts';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Share2, Copy, Hash } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
// Removed useFavorites import
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useMemo } from 'react';

interface PromptCardProps {
  prompt: Prompt;
  onHashtagClick?: (hashtag: string) => void; // Add new prop for handling hashtag clicks
  // Props passed down from parent (PromptGrid)
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  favoritesLoading: boolean;
}

export function PromptCard({
  prompt,
  onHashtagClick,
  isFavorite,
  onFavoriteToggle,
  favoritesLoading
}: PromptCardProps) {
  const { toast } = useToast();
  // isFavorite and favoritesLoading are now props

  // Memoize the hashtag extraction logic
  const { promptText, hashtags } = useMemo(() => {
    console.log(`[PromptCard ${prompt.id}] Parsing details for hashtags...`);
    const lines = prompt.details?.trim().split('\n') ?? [];
    let hashtagsLine = lines[lines.length - 1] ?? ''; // Get the last line safely
    let extractedHashtags: string[] = [];
    let textContent = prompt.details?.trim() ?? ''; // Default to full details

    console.log(`[PromptCard ${prompt.id}] Last line: "${hashtagsLine}"`);

    // Improved check: trim and ensure it starts with # and contains space or is just #tag
    const trimmedLastLine = hashtagsLine.trim();
    if (trimmedLastLine.startsWith('#') && (trimmedLastLine.includes(' ') || !trimmedLastLine.substring(1).includes('#'))) {
        // It looks like a hashtag line
        extractedHashtags = trimmedLastLine
            .split('#') // Split by #
            .map(tag => tag.trim()) // Trim whitespace around each potential tag
            .filter(tag => tag.length > 0 && !tag.includes(' ')); // Filter out empty strings and tags with spaces

        // If we found valid hashtags, remove the last line from the content
        if (extractedHashtags.length > 0) {
            textContent = lines.slice(0, -1).join('\n').trim();
            console.log(`[PromptCard ${prompt.id}] Extracted hashtags:`, extractedHashtags);
        } else {
            // Reset if split resulted in nothing valid (e.g., line was just "#")
            extractedHashtags = [];
             console.log(`[PromptCard ${prompt.id}] Last line started with # but parsing yielded no valid hashtags.`);
        }

    } else {
      console.log(`[PromptCard ${prompt.id}] Last line does not appear to be a hashtag line.`);
    }

    console.log(`[PromptCard ${prompt.id}] Final prompt text length: ${textContent.length}`);
    console.log(`[PromptCard ${prompt.id}] Final hashtags:`, extractedHashtags);

    return { promptText: textContent, hashtags: extractedHashtags };
  }, [prompt.details, prompt.id]); // Depend on prompt.details and prompt.id


  const handleCopy = async () => {
    try {
      // Copy only the prompt text without hashtags
      await navigator.clipboard.writeText(promptText);
      toast({
        title: "Copied!",
        description: "Prompt text copied to clipboard.",
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Error",
        description: "Failed to copy prompt text.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
     // Share only the prompt text without hashtags
    const shareData = {
        title: prompt.title,
        text: promptText,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // IgnoreAbortError: AbortError: Share canceled
        if (err instanceof Error && err.name !== 'AbortError') {
            console.error('Error sharing:', err);
            toast({
                title: "Sharing failed",
                description: "Could not share the prompt at this moment.",
                variant: "destructive",
            });
        }
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      handleCopy(); // Copy text instead
      toast({
        title: "Copied to clipboard",
        description: "Web Share API not supported, prompt text copied instead.",
      });
    }
  };

  // Simplified favorite toggle using the passed prop
  const handleFavoriteToggle = () => {
    if (favoritesLoading) return;
    onFavoriteToggle(); // Call the function passed from the parent
    // Optional: Keep the toast messages if desired
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
    });
  };

  const handleBadgeClick = (tag: string) => {
    if (onHashtagClick) {
      onHashtagClick(`#${tag}`); // Pass the hashtag with '#' prefix
    }
  };


  return (
    <Card className="h-full flex flex-col break-inside-avoid mb-4 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out bg-card border border-border rounded-lg overflow-hidden group">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold group-hover:text-accent transition-colors">{prompt.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-sm text-muted-foreground whitespace-pre-wrap pb-4">
         {/* Display prompt text excluding hashtags */}
         {promptText}
      </CardContent>
      <CardFooter className="flex flex-wrap justify-between items-center pt-3 border-t mt-auto bg-muted/30 dark:bg-card/50 px-4 py-2">
        <div className="flex items-center space-x-1 flex-wrap gap-y-1"> {/* Added flex-wrap and gap-y */}
            {hashtags.map((tag, index) => (
                <Badge
                    key={index}
                    variant="secondary"
                    className={cn(
                        "text-xs capitalize flex items-center",
                         onHashtagClick && "cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                    )}
                    onClick={() => handleBadgeClick(tag)}
                    title={`Filter by #${tag}`} // Add tooltip for clarity
                    role={onHashtagClick ? "button" : undefined} // Add role if clickable
                    tabIndex={onHashtagClick ? 0 : undefined} // Make it focusable if clickable
                    onKeyDown={onHashtagClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleBadgeClick(tag); } : undefined}
                >
                  <Hash className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
            ))}
          </div>
        <div className="flex space-x-0.5">
           {favoritesLoading ? (
              <Skeleton className="h-8 w-8 rounded-full" /> // Skeleton for favorite button
           ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteToggle} // Use the updated handler
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                disabled={favoritesLoading}
                className="h-8 w-8 rounded-full hover:bg-accent/10"
                aria-pressed={isFavorite} // Use the prop
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'} // Use the prop
              >
               <Star className={cn("h-4 w-4 transition-colors duration-200", isFavorite ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground group-hover:text-accent")} />
              </Button>
           )}
           <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              aria-label="Share prompt text"
              className="h-8 w-8 rounded-full hover:bg-accent/10"
              title="Share prompt text"
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
