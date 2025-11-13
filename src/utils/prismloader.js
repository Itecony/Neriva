// src/utils/prismLoader.js
// Vite-compatible dynamic language loader for Prism.js

import Prism from 'prismjs';

// Track which languages have been loaded
const loadedLanguages = new Set(['markup', 'css', 'clike', 'javascript']);

// Language aliases and dependencies
const LANGUAGE_CONFIG = {
  javascript: { deps: ['clike'], alias: ['js'] },
  typescript: { deps: ['javascript'], alias: ['ts'] },
  jsx: { deps: ['markup', 'javascript'], alias: ['react'] },
  tsx: { deps: ['jsx', 'typescript'], alias: [] },
  python: { deps: [], alias: ['py'] },
  java: { deps: ['clike'], alias: [] },
  cpp: { deps: ['c'], alias: ['c++'] },
  c: { deps: ['clike'], alias: [] },
  csharp: { deps: ['clike'], alias: ['cs', 'dotnet'] },
  go: { deps: ['clike'], alias: ['golang'] },
  rust: { deps: ['clike'], alias: ['rs'] },
  php: { deps: ['markup-templating', 'clike'], alias: [] },
  ruby: { deps: ['clike'], alias: ['rb'] },
  swift: { deps: ['clike'], alias: [] },
  kotlin: { deps: ['clike'], alias: ['kt'] },
  sql: { deps: [], alias: [] },
  bash: { deps: [], alias: ['shell', 'sh'] },
  html: { deps: ['markup'], alias: ['xml'] },
  css: { deps: [], alias: [] },
  json: { deps: ['javascript'], alias: [] },
  yaml: { deps: [], alias: ['yml'] },
  markdown: { deps: ['markup'], alias: ['md'] },
  docker: { deps: [], alias: ['dockerfile'] },
};

/**
 * Dynamically load a Prism language component (Vite-compatible)
 * @param {string} language - Language name (e.g., 'python', 'javascript')
 * @returns {Promise<boolean>} - True if loaded successfully
 */
export async function loadPrismLanguage(language) {
  // Normalize language name
  const normalizedLang = normalizeLanguageName(language);
  
  // Already loaded?
  if (loadedLanguages.has(normalizedLang)) {
    return true;
  }

  // Get language config
  const config = LANGUAGE_CONFIG[normalizedLang];
  if (!config) {
    console.warn(`Language '${normalizedLang}' not supported`);
    return false;
  }

  try {
    // Load dependencies first
    if (config.deps && config.deps.length > 0) {
      for (const dep of config.deps) {
        if (!loadedLanguages.has(dep)) {
          await loadLanguageComponent(dep);
        }
      }
    }

    // Load the language itself
    await loadLanguageComponent(normalizedLang);
    
    loadedLanguages.add(normalizedLang);
    console.log(`✅ Loaded Prism language: ${normalizedLang}`);
    return true;
    
  } catch (error) {
    console.error(`Failed to load language '${normalizedLang}':`, error);
    return false;
  }
}

/**
 * Load a single language component (Vite-compatible)
 * IMPORTANT: Vite requires explicit import paths
 */
async function loadLanguageComponent(lang) {
  try {
    // Vite-specific: Use explicit dynamic imports with template literals
    // Vite will bundle these at build time
    switch(lang) {
      case 'javascript':
        await import('prismjs/components/prism-javascript.min.js');
        break;
      case 'typescript':
        await import('prismjs/components/prism-typescript.min.js');
        break;
      case 'jsx':
        await import('prismjs/components/prism-jsx.min.js');
        break;
      case 'tsx':
        await import('prismjs/components/prism-tsx.min.js');
        break;
      case 'python':
        await import('prismjs/components/prism-python.min.js');
        break;
      case 'java':
        await import('prismjs/components/prism-java.min.js');
        break;
      case 'c':
        await import('prismjs/components/prism-c.min.js');
        break;
      case 'cpp':
        await import('prismjs/components/prism-cpp.min.js');
        break;
      case 'csharp':
        await import('prismjs/components/prism-csharp.min.js');
        break;
      case 'go':
        await import('prismjs/components/prism-go.min.js');
        break;
      case 'rust':
        await import('prismjs/components/prism-rust.min.js');
        break;
      case 'php':
        await import('prismjs/components/prism-php.min.js');
        break;
      case 'ruby':
        await import('prismjs/components/prism-ruby.min.js');
        break;
      case 'swift':
        await import('prismjs/components/prism-swift.min.js');
        break;
      case 'kotlin':
        await import('prismjs/components/prism-kotlin.min.js');
        break;
      case 'sql':
        await import('prismjs/components/prism-sql.min.js');
        break;
      case 'bash':
        await import('prismjs/components/prism-bash.min.js');
        break;
      case 'markup':
        await import('prismjs/components/prism-markup.min.js');
        break;
      case 'css':
        await import('prismjs/components/prism-css.min.js');
        break;
      case 'json':
        await import('prismjs/components/prism-json.min.js');
        break;
      case 'yaml':
        await import('prismjs/components/prism-yaml.min.js');
        break;
      case 'markdown':
        await import('prismjs/components/prism-markdown.min.js');
        break;
      case 'docker':
        await import('prismjs/components/prism-docker.min.js');
        break;
      case 'clike':
        await import('prismjs/components/prism-clike.min.js');
        break;
      case 'markup-templating':
        await import('prismjs/components/prism-markup-templating.min.js');
        break;
      default:
        console.warn(`No explicit import for language: ${lang}`);
        // Fallback: try dynamic import (may not work in production)
        await import(`prismjs/components/prism-${lang}.min.js`);
    }
  } catch (error) {
    console.error(`Could not load prism-${lang}:`, error);
    throw error;
  }
}

/**
 * Normalize language name (handle aliases)
 */
function normalizeLanguageName(language) {
  const lower = language.toLowerCase();
  
  // Check if it's an alias
  for (const [key, config] of Object.entries(LANGUAGE_CONFIG)) {
    if (config.alias && config.alias.includes(lower)) {
      return key;
    }
  }
  
  return lower;
}

/**
 * Get all supported languages
 */
export function getSupportedLanguages() {
  return Object.keys(LANGUAGE_CONFIG);
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(language) {
  const normalized = normalizeLanguageName(language);
  return LANGUAGE_CONFIG.hasOwnProperty(normalized);
}

/**
 * Highlight code with automatic language loading
 * @param {string} code - Code to highlight
 * @param {string} language - Programming language
 * @returns {Promise<string>} - Highlighted HTML
 */
export async function highlightCode(code, language) {
  // Load language if needed
  await loadPrismLanguage(language);
  
  const normalizedLang = normalizeLanguageName(language);
  
  // Highlight the code
  try {
    const grammar = Prism.languages[normalizedLang];
    if (!grammar) {
      console.warn(`Grammar not found for ${normalizedLang}, using plain text`);
      return Prism.util.encode(code);
    }
    
    return Prism.highlight(code, grammar, normalizedLang);
  } catch (error) {
    console.error('Error highlighting code:', error);
    return Prism.util.encode(code); // Return escaped plain text
  }
}

/**
 * Preload commonly used languages for better performance
 */
export async function preloadCommonLanguages() {
  const commonLanguages = ['javascript', 'python', 'java', 'typescript', 'jsx'];
  
  const promises = commonLanguages.map(lang => 
    loadPrismLanguage(lang).catch(err => 
      console.warn(`Failed to preload ${lang}:`, err)
    )
  );
  
  await Promise.all(promises);
  console.log('✅ Common languages preloaded');
}

export default {
  loadPrismLanguage,
  getSupportedLanguages,
  isLanguageSupported,
  highlightCode,
  preloadCommonLanguages
};