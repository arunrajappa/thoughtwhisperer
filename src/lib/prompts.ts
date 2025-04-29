
import { marked } from 'marked'; // Use marked for robust markdown parsing
// Server-only module
import 'server-only';
import fs from 'node:fs/promises'; // Use async fs
import path from 'node:path';
import { slugify } from './utils'; // Import slugify utility

export interface Prompt {
  id: string; // ID will now be a stable slug
  title: string;
  details: string; // Keep full details including hashtags as raw markdown string
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
  let currentDetailsRaw = ''; // This will store the full details, including potential hashtag line
  let categoryIndex = 0; // Keep track of category order for potential ID conflicts
  let promptIndexInCategory = 0; // Keep track of prompt order within category

  function addCurrentPrompt() {
    if (currentTitle && currentDetailsRaw.trim()) { // Check if details are not just whitespace
      const cleanTitle = currentTitle.trim();
      const rawDetails = currentDetailsRaw.trim(); // Keep the raw details

      // Generate stable ID: slugify title and append indices for uniqueness
      // This handles cases where multiple prompts might have the same title after slugification
      let stableId = slugify(cleanTitle);
      const potentialDuplicate = prompts.find(p => p.id === stableId);
      if (potentialDuplicate) {
          // Append category and prompt index to ensure uniqueness if slug conflicts
          stableId = `${stableId}-${categoryIndex}-${promptIndexInCategory}`;
      }

      // Log the parsed prompt including raw details
      console.log(`[Prompts Parser] Adding prompt: ID=${stableId}, Title=${cleanTitle}, Category=${currentCategory.trim()}`);
      // console.log(`[Prompts Parser] Raw Details:\n${rawDetails}`); // Optional: log details for debugging

      prompts.push({
        id: stableId, // Use stable, unique ID
        title: cleanTitle,
        details: rawDetails, // Store raw markdown including hashtags
        category: currentCategory.trim(), // Trim category name
      });
      promptIndexInCategory++; // Increment prompt index for the current category
    }
    // Reset for the next prompt
    currentTitle = '';
    currentDetailsRaw = '';
  }


  for (const line of lines) {
    const trimmedLine = line.trim(); // Trim whitespace for checks, but preserve original line for details

    if (trimmedLine.startsWith('# ') && !trimmedLine.startsWith('## ')) {
      // New Category (Level 1 Heading)
      addCurrentPrompt(); // Add previous prompt before starting new category
      currentCategory = trimmedLine.substring(2).trim();
      categoryIndex++; // Increment category index
      promptIndexInCategory = 0; // Reset prompt index for new category
      console.log(`[Prompts Parser] Found Category: ${currentCategory}`);
    } else if (trimmedLine.startsWith('## ')) {
      // New Prompt Title (Level 2 Heading)
       addCurrentPrompt(); // Add previous prompt before starting new one
       currentTitle = trimmedLine.substring(3).trim();
       console.log(`[Prompts Parser] Found Title: ${currentTitle}`);
    } else if (currentTitle) { // Only add lines if we are currently inside a prompt (have a title)
        // Append the raw line (preserving indentation and original content)
        // Add a newline character if detailsRaw is not empty to maintain structure
        currentDetailsRaw += (currentDetailsRaw ? '\n' : '') + line;
    } else if (trimmedLine === '---' || !trimmedLine) {
        // Separator or empty line - ensure previous prompt is added if any
        // Don't reset category here, wait for a new # line
         addCurrentPrompt();
    }
  }

  // Add the very last prompt if it exists
  addCurrentPrompt();

  console.log(`[Prompts Parser] Finished parsing. Total prompts: ${prompts.length}`);
  return prompts;
}

export async function getPrompts(): Promise<Prompt[]> {
  // This function now runs ONLY on the server.
  const filePath = path.join(process.cwd(), 'prompts.md');
  console.log(`[Prompts Getter] Reading prompts from: ${filePath}`);
  try {
    const markdownContent = await fs.readFile(filePath, 'utf8');
    const parsedPrompts = await parsePromptsMarkdown(markdownContent);
    console.log(`[Prompts Getter] Successfully parsed ${parsedPrompts.length} prompts.`);
    return parsedPrompts;
  } catch (error) {
    console.error("[Prompts Getter] Error reading or parsing prompts.md:", error);
    // In a real app, you might want to throw the error or handle it differently
    return []; // Return empty array on error
  }
}

export async function getCategories(): Promise<string[]> {
  // This function now runs ONLY on the server.
  console.log("[Categories Getter] Fetching categories...");
  const prompts = await getPrompts();
   // Use Set for uniqueness, trim whitespace, filter out empty, and sort
   const categories = Array.from(new Set(prompts.map(p => p.category.trim())))
                         .filter(Boolean) // Remove potential empty categories
                         .sort((a, b) => a.localeCompare(b)); // Alphabetical sort
  console.log(`[Categories Getter] Found categories: ${categories.join(', ')}`);
  return categories;
}
