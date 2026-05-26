# Markdown Document Viewer

## Overview

MD Reader is a lightweight, client-side web application that allows users to view and interact with Markdown (.md) files. The application runs entirely in the browser without any server, database, or external dependencies beyond the initial CDN libraries. It provides a clean reading interface with automatic table of contents generation, dark mode support, and HTML export functionality.

## Features 

- Local Markdown file upload via click, drag-and-drop, or file browser
- Real-time Markdown rendering with GitHub-flavored Markdown support
- Automatic table of contents generation from document headings
- Dark mode toggle with persistent user preference
- HTML export of rendered documents as standalone files
- Responsive design with mobile-friendly sidebar navigation
- No data persistence - all processing occurs locally in the browser

## Technology Stack

- HTML5, CSS3, JavaScript (ES6+)
- TailwindCSS for styling
- Marked.js for Markdown parsing
- Font Awesome 6 for icons

## Installation

No installation is required. The application is a single HTML file that can be:

1. Opened directly in any modern web browser
2. Hosted on any static web server
3. Used offline after initial loading of CDN resources

## Usage Guide

### Loading a Document

1. Click the upload zone in the sidebar
2. Select a .md or .markdown file from your device
3. Alternatively, drag and drop a file onto the upload zone

### Reading Navigation

- Use the table of contents in the sidebar to jump to any heading
- On mobile devices, click the menu icon to access the sidebar
- Scroll normally through the document content

### Exporting

Click the Export button in the top bar to save the current document as an HTML file. The exported file is self-contained and can be viewed offline.

### Theme Toggle

Use the theme button in the top bar to switch between light and dark modes. Your preference is saved locally.

## File Structure

The application is contained within a single HTML file with embedded CSS and JavaScript. The logical structure follows a modular pattern:

- HTML markup defines the sidebar and main content areas
- CSS provides typography styling, animations, and responsive behavior
- JavaScript is organized as an IIFE (Immediately Invoked Function Expression) with:
  - State management variables
  - DOM element references
  - Core rendering functions
  - Event handlers for user interactions
  - Theme persistence logic

## Browser Compatibility

The application works on all modern browsers that support ES6, including:

- Chrome / Edge (version 90 and above)
- Firefox (version 88 and above)
- Safari (version 14 and above)
- Opera (version 76 and above)

## Development Principles

The code follows these practices:

- Separation of concerns: UI structure, styling, and behavior are distinct
- Event-driven architecture with centralized event binding
- Asynchronous file handling using FileReader API
- Graceful error handling for invalid files or parsing errors
- No external dependencies beyond CDN-hosted libraries
- Responsive design with mobile-first approach

## Limitations

- Files are processed locally; no upload to any server occurs
- Maximum file size is limited by browser memory (typically 50-100MB for practical use)
- Images in Markdown are rendered but reference external URLs if not embedded
- Custom Markdown extensions are not supported beyond GFM

## API Reference

The application exposes no external API. All functionality is self-contained.

## Troubleshooting

Issue: File does not render
Solution: Ensure the file has a .md or .markdown extension. Check browser console for parsing errors.

Issue: Table of contents does not appear
Solution: The document must contain at least one heading (h1, h2, h3, or h4 tag equivalent).

Issue: Export button does nothing
Solution: Load a Markdown file before attempting to export. The application prevents export of empty content.

## License

This application is free to use, modify, and distribute for both personal and commercial purposes.

## Acknowledgments

- Marked.js library for Markdown parsing
- TailwindCSS for utility-first styling
- Font Awesome for iconography
