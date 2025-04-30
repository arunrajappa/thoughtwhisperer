// src/components/about-dialog.tsx
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Github, Twitter, Feather, CreativeCommons } from 'lucide-react'; // Added CreativeCommons
import Link from 'next/link'; // Use Next.js Link for internal routing if needed, otherwise use <a> for external

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  const currentYear = new Date().getFullYear(); // Get current year dynamically

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground rounded-lg shadow-xl border border-border">
        <DialogHeader className="text-center border-b border-border pb-4">
          <div className="flex justify-center items-center gap-2 mb-2">
             <Feather className="h-6 w-6 text-accent" />
             <DialogTitle className="text-xl font-semibold">Thought Whisperer</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground text-center center items-center">
             Your companion for prompting.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 px-2 space-y-4 text-sm">
          <div className="flex items-center gap-2">
             <Twitter className="h-4 w-4 text-muted-foreground" />
             <p>
              Created by{' '}
              <a
                href="https://x.com/appa"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent hover:underline transition-colors"
              >
                @appa
              </a>
             </p>
           </div>

           <div className="flex items-center gap-2">
             <Github className="h-4 w-4 text-muted-foreground" />
             <a
               href="https://github.com/arunrajappa/thoughtwhisperer/"
               target="_blank"
               rel="noopener noreferrer"
               className="font-medium text-accent hover:underline transition-colors"
             >
               GitHub Repository
             </a>
           </div>

           <div className="flex items-center gap-2">
             {/* Using Lucide's CreativeCommons icon */}
             <CreativeCommons className="h-4 w-4 text-muted-foreground" />
             <p>License: Creative Commons</p>
           </div>

           <p className="text-xs text-muted-foreground pt-2">
             Built for my friends at StreamAlive in April {currentYear}. #UnmuteTheAudience {/* Updated year */}
           </p>
        </div>

        <DialogFooter className="pt-4 border-t border-border">
          <DialogClose asChild>
            <Button type="button" variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
