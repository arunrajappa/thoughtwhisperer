import { marked } from 'marked'; // Use marked for robust markdown parsing
import { v4 as uuidv4 } from 'uuid';

// Server-only module
import 'server-only';
import fs from 'node:fs/promises'; // Use async fs
import path from 'node:path';


export interface Prompt {
  id: string;
  title: string;
  details: string; // Keep details as raw markdown
  htmlDetails: string; // Add parsed HTML details
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

  function addCurrentPrompt() {
    if (currentTitle && currentDetailsRaw) {
      const cleanTitle = currentTitle.trim();
      const cleanDetails = currentDetailsRaw.trim();
      const htmlDetails = marked.parse(cleanDetails) as string; // Parse details to HTML

      prompts.push({
        id: uuidv4(),
        title: cleanTitle,
        details: cleanDetails, // Store raw markdown
        htmlDetails: htmlDetails, // Store parsed HTML
        category: currentCategory.trim(), // Trim category name
      });
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
    } else if (trimmedLine.startsWith('## ')) {
      // New Prompt Title (Level 2 Heading)
       addCurrentPrompt(); // Add previous prompt before starting new one
       currentTitle = trimmedLine.substring(3).trim();
    } else if (currentTitle && trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
      // Prompt Details line (and not another heading)
       // Append line with a newline character to preserve structure for markdown parser
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
