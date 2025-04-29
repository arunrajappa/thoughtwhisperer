import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // Use UUID for unique IDs

export interface Prompt {
  id: string;
  title: string;
  details: string;
  category: string;
}

export function parsePromptsMarkdown(markdownContent: string): Prompt[] {
  const prompts: Prompt[] = [];
  const lines = markdownContent.split('\n');

  let currentCategory = 'Uncategorized';
  let currentTitle = '';
  let currentDetails = '';

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('# ') && !trimmedLine.startsWith('##')) {
      // New Category
      if (currentTitle && currentDetails) {
        prompts.push({
          id: uuidv4(),
          title: currentTitle.trim(),
          details: currentDetails.trim(),
          category: currentCategory,
        });
      }
      currentCategory = trimmedLine.substring(2).trim();
      currentTitle = '';
      currentDetails = '';
    } else if (trimmedLine.startsWith('## ')) {
      // New Prompt Title
      if (currentTitle && currentDetails) {
         prompts.push({
          id: uuidv4(),
          title: currentTitle.trim(),
          details: currentDetails.trim(),
          category: currentCategory,
        });
      }
      currentTitle = trimmedLine.substring(3).trim();
      currentDetails = ''; // Reset details for the new prompt
    } else if (trimmedLine === '---') {
        // Separator, potentially indicates end of a category block
        if (currentTitle && currentDetails) {
             prompts.push({
              id: uuidv4(),
              title: currentTitle.trim(),
              details: currentDetails.trim(),
              category: currentCategory,
            });
        }
        currentTitle = '';
        currentDetails = '';
        // Keep the current category unless a new # line is found
    }
    else if (currentTitle && trimmedLine.length > 0) {
      // Prompt Details line
      currentDetails += (currentDetails ? '\n' : '') + trimmedLine;
    }
  }

  // Add the last prompt if it exists
  if (currentTitle && currentDetails) {
    prompts.push({
      id: uuidv4(),
      title: currentTitle.trim(),
      details: currentDetails.trim(),
      category: currentCategory,
    });
  }

  return prompts;
}

export async function getPrompts(): Promise<Prompt[]> {
  const filePath = path.join(process.cwd(), 'prompts.md');
  try {
    const markdownContent = fs.readFileSync(filePath, 'utf8');
    return parsePromptsMarkdown(markdownContent);
  } catch (error) {
    console.error("Error reading or parsing prompts.md:", error);
    return []; // Return empty array on error
  }
}

export async function getCategories(): Promise<string[]> {
  const prompts = await getPrompts();
  const categories = new Set(prompts.map(p => p.category));
  return Array.from(categories).sort();
}
