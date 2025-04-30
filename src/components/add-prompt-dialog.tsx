// src/components/add-prompt-dialog.tsx
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import type { Prompt } from '@/lib/prompts';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Import DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/utils';

// Schema for form validation
const promptFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  details: z.string().min(1, 'Prompt text is required'),
  hashtags: z.string().optional().refine(val => {
    if (!val) return true; // Optional is fine
    // Ensure hashtags start with # and don't contain spaces within them
    return val.split(/\s+/).every(tag => tag.startsWith('#') && !tag.substring(1).includes('#') && !tag.includes(' '));
  }, { message: 'Hashtags must start with # and be separated by spaces (e.g., #tag1 #tag2)' }),
  category: z.string().min(1, 'Please select a category or "No Category"'), // Requires selection
});

type PromptFormData = z.infer<typeof promptFormSchema>;

interface AddPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  onAddPrompt: (newPrompt: Prompt) => void;
}

const NO_CATEGORY_VALUE = 'no-category'; // Special value for no category

export function AddPromptDialog({ open, onOpenChange, categories, onAddPrompt }: AddPromptDialogProps) {
  const { toast } = useToast();
  const form = useForm<PromptFormData>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      title: '',
      details: '',
      hashtags: '',
      category: '', // Initialize category as empty or set a default
    },
  });

  const onSubmit = (data: PromptFormData) => {
    const newPromptId = `user-${slugify(data.title)}-${uuidv4().substring(0, 8)}`; // Create unique ID
    const detailsWithHashtags = data.hashtags
      ? `${data.details.trim()}\n\n${data.hashtags.trim()}` // Add hashtags on a new line if provided
      : data.details.trim();

    const newPrompt: Prompt = {
      id: newPromptId,
      title: data.title.trim(),
      details: detailsWithHashtags,
      category: data.category === NO_CATEGORY_VALUE ? 'Uncategorized' : data.category, // Handle 'No Category'
    };

    onAddPrompt(newPrompt);
    toast({ title: 'Prompt Added', description: `"${newPrompt.title}" has been saved.` });
    form.reset(); // Reset form fields
    onOpenChange(false); // Close the dialog
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Prompt</DialogTitle>
          <DialogDescription>
            Create your own custom prompt. It will be saved locally in your browser.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter prompt title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Text</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the main text of your prompt" rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hashtags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hashtags (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="#optional #hashtags separated by space" {...field} />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_CATEGORY_VALUE}>No Category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

             <DialogFooter className="mt-4">
              {/* Add DialogClose to the Cancel button */}
               <DialogClose asChild>
                 <Button type="button" variant="outline">Cancel</Button>
               </DialogClose>
               <Button type="submit">Save Prompt</Button>
             </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
