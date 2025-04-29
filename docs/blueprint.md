# **App Name**: Thought Whisperer

## Core Features:

- Prompt Card Display: Display prompts as interactive cards with title, details, and hashtags derived from markdown categories.
- Prompt Interaction: Enable users to favourite prompts (stored in cookies), share the prompt text, or copy the prompt text to the clipboard.
- Prompt Search and Filter: Implement search and filtering of prompts at the top, along with a left pane for categories and favourites. Markdown file (prompts.md) will be read.

## Style Guidelines:

- Material Design-inspired card-based layout, similar to Google Keep.
- Dark theme support with customizable color palettes.
- Accent: Teal (#009688) for interactive elements and highlights.
- Use Material Design icons for actions (favourite, share, copy).
- Mobile-optimized responsive design.

## Original User Request:
Assume you are a top-end web developer. You are going to build me a modern looking website with nextjs and tailwind. The design will be material design inspired, and card based (like Google Keep).

The website is called the Thought Whisperer - a companion for prompting. The website will be mobile optimized, and will have a dark theme support.

Here is how the site works: it has a list of cards. Each card has a title or prompt name, it has a prompt detail, and it has hashtags. At the top of the website, there is a way to search and filter prompts. In the left pane are all the categories of prompts. The left pane also has a favourites.

Each prompt can be favourited by the user (star icon), or the user can click the share icon to share out the prompt text with their favourite app, or there is a copy icon for the prompt text to be copied (and pasted elsewhere). 

The footer of the website should say "Built for StreamAlive by @appa using Firebase Studio". Please build this out now. 

All of the prompts I want added as cards will be put into a markdown file, please create this markdown file (prompts.md) which you can read from later. Use each category in the markdown file as a hashtag.

There is no authenticated experience for the app. All favourites etc. should be stored in cookies.
  