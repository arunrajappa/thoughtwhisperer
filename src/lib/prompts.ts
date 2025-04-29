import { marked } from 'marked'; // Use marked for robust markdown parsing
// Removed uuid import as it's replaced by stable IDs

// Server-only module
import 'server-only';
import fs from 'node:fs/promises'; // Use async fs
import path from 'node:path';
import { slugify } from './utils'; // Import slugify utility

export interface Prompt {
  id: string; // ID will now be a stable slug
  title: string;
  details: string; // Keep details as raw markdown string
  category: string;
}

// Configure marked (optional, but good practice)
marked.setOptions({
  gfm: true, // Enable GitHub Flavored Markdown
  breaks: true, // Convert single line breaks to <br>
  mangle: false, // Don't obscure email addresses
  headerIds: false, // Don't add IDs to headers
});


export async function parsePromptsMarkdown(markdownContent: string): Promise<Prompt[]> {
  const prompts: Prompt[] = [];
  const lines = markdownContent.split('\n');

  let currentCategory = 'Uncategorized';
  let currentTitle = '';
  let currentDetailsRaw = '';
  let categoryIndex = 0; // Keep track of category order for potential ID conflicts
  let promptIndexInCategory = 0; // Keep track of prompt order within category

  function addCurrentPrompt() {
    if (currentTitle && currentDetailsRaw) {
      const cleanTitle = currentTitle.trim();
      const cleanDetails = currentDetailsRaw.trim();

      // Generate stable ID: slugify title and append indices for uniqueness
      // This handles cases where multiple prompts might have the same title after slugification
      let stableId = slugify(cleanTitle);
      const potentialDuplicate = prompts.find(p => p.id === stableId);
      if (potentialDuplicate) {
          // Append category and prompt index to ensure uniqueness if slug conflicts
          stableId = `${stableId}-${categoryIndex}-${promptIndexInCategory}`;
      }

      prompts.push({
        id: stableId, // Use stable, unique ID
        title: cleanTitle,
        details: cleanDetails, // Store raw markdown
        category: currentCategory.trim(), // Trim category name
      });
      promptIndexInCategory++; // Increment prompt index for the current category
    }
    currentTitle = '';
    currentDetailsRaw = '';
  }


  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('# ') && !trimmedLine.startsWith('## ')) {
      // New Category (Level 1 Heading)
      addCurrentPrompt(); // Add previous prompt before starting new category
      currentCategory = trimmedLine.substring(2).trim();
      categoryIndex++; // Increment category index
      promptIndexInCategory = 0; // Reset prompt index for new category
    } else if (trimmedLine.startsWith('## ')) {
      // New Prompt Title (Level 2 Heading)
       addCurrentPrompt(); // Add previous prompt before starting new one
       currentTitle = trimmedLine.substring(3).trim();
    } else if (currentTitle && trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
      // Prompt Details line (and not another heading)
       // Append line with a newline character to preserve structure
       currentDetailsRaw += (currentDetailsRaw ? '\n' : '') + line;
    } else if (trimmedLine === '---') {
        // Separator can indicate end of a block, add prompt if any
        addCurrentPrompt();
        // Keep the current category unless a new # line is found
    }
  }

  // Add the very last prompt if it exists
  addCurrentPrompt();

  return prompts;
}

export async function getPrompts(): Promise<Prompt[]> {
  // This function now runs ONLY on the server.
  const filePath = path.join(process.cwd(), 'prompts.md');
  try {
    const markdownContent = await fs.readFile(filePath, 'utf8');
    return await parsePromptsMarkdown(markdownContent);
  } catch (error) {
    console.error("Error reading or parsing prompts.md:", error);
    // In a real app, you might want to throw the error or handle it differently
    return []; // Return empty array on error
  }
}

export async function getCategories(): Promise<string[]> {
  // This function now runs ONLY on the server.
  const prompts = await getPrompts();
   // Use Set for uniqueness, trim whitespace, filter out empty, and sort
   const categories = Array.from(new Set(prompts.map(p => p.category.trim())))
                         .filter(Boolean) // Remove potential empty categories
                         .sort((a, b) => a.localeCompare(b)); // Alphabetical sort
  return categories;
}
