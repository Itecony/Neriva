// src/utils/sanitization.js - Complete sanitization utilities
import DOMPurify from 'dompurify';
import { marked } from 'marked';

marked.setOptions({ breaks: true, gfm: true, headerIds: false, mangle: false });

export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [], KEEP_CONTENT: true }).trim();
};

export const sanitizeMarkdown = (markdown) => {
  if (!markdown || typeof markdown !== 'string') return '';
  const html = marked.parse(markdown);
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p','br','strong','em','u','code','pre','h1','h2','h3','h4','h5','h6','ul','ol','li','a','blockquote','hr','table','thead','tbody','tr','th','td','del','ins','sup','sub'],
    ALLOWED_ATTR: ['href','class','id','target','rel'],
    ALLOWED_URI_REGEXP: /^https?:\/\//i,
    FORBID_ATTR: ['style','onclick','onerror','onload']
  });
};

export const sanitizeCode = (code) => {
  if (!code || typeof code !== 'string') return '';
  return DOMPurify.sanitize(code, { ALLOWED_TAGS: [], KEEP_CONTENT: true, FORBID_TAGS: ['script','style','iframe','object','embed'] });
};

export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed.match(/^https?:\/\//i)) return '';
  try {
    const parsed = new URL(trimmed);
    if (!['http:','https:'].includes(parsed.protocol)) return '';
    return parsed.href;
  } catch { return ''; }
};

export const isValidImageUrl = (url) => {
  const sanitized = sanitizeUrl(url);
  return sanitized && /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i.test(sanitized);
};

export const isValidVideoUrl = (url) => {
  const sanitized = sanitizeUrl(url);
  return sanitized && /\.(mp4|webm|mov|avi|mkv|flv)(\?.*)?$/i.test(sanitized);
};

export const extractUrls = (text) => {
  if (!text || typeof text !== 'string') return [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return (text.match(urlRegex) || []).map(url => sanitizeUrl(url)).filter(url => url !== '');
};

export const detectPlatform = (url) => {
  const sanitized = sanitizeUrl(url);
  if (!sanitized) return null;
  const patterns = {
    github: /github\.com/i, gitlab: /gitlab\.com/i, stackoverflow: /stackoverflow\.com/i,
    youtube: /youtube\.com|youtu\.be/i, figma: /figma\.com/i, codepen: /codepen\.io/i,
    codesandbox: /codesandbox\.io/i, npm: /npmjs\.com/i, pypi: /pypi\.org/i,
    medium: /medium\.com/i, dev: /dev\.to/i
  };
  for (const [platform, pattern] of Object.entries(patterns)) {
    if (pattern.test(sanitized)) return platform;
  }
  return 'generic';
};

export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg','image/jpg','image/png','image/gif','image/webp','image/svg+xml'];
  const maxSize = 5 * 1024 * 1024;
  if (!file) throw new Error('No file provided');
  if (!validTypes.includes(file.type)) throw new Error('Invalid image type');
  if (file.size > maxSize) throw new Error('Image too large. Maximum size: 5MB');
  return true;
};

export const validateVideoFile = (file) => {
  const validTypes = ['video/mp4','video/webm','video/quicktime'];
  const maxSize = 50 * 1024 * 1024;
  if (!file) throw new Error('No file provided');
  if (!validTypes.includes(file.type)) throw new Error('Invalid video type');
  if (file.size > maxSize) throw new Error('Video too large. Maximum size: 50MB');
  return true;
};

export const validateVideoDuration = (file, maxDuration = 30) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      video.duration > maxDuration ? reject(new Error(`Video must be ${maxDuration} seconds or shorter`)) : resolve(true);
    };
    video.onerror = () => reject(new Error('Failed to load video'));
    video.src = URL.createObjectURL(file);
  });
};

export const sanitizeFileName = (fileName) => {
  if (!fileName || typeof fileName !== 'string') return '';
  let safe = fileName.replace(/\.\./g, '').replace(/[^a-zA-Z0-9._-]/g, '_');
  if (safe.length > 255) {
    const ext = safe.split('.').pop();
    safe = safe.substring(0, 255 - ext.length - 1) + '.' + ext;
  }
  return safe;
};

export const validateImageUploads = (files, maxCount = 5) => {
  if (!files || files.length === 0) throw new Error('No files provided');
  if (files.length > maxCount) throw new Error(`Maximum ${maxCount} images allowed`);
  const validFiles = [], errors = [];
  Array.from(files).forEach((file, index) => {
    try { validateImageFile(file); validFiles.push(file); }
    catch (error) { errors.push(`File ${index + 1}: ${error.message}`); }
  });
  if (errors.length > 0) throw new Error(errors.join('\n'));
  return validFiles;
};

// Alias for better naming consistency
export const validateImageFiles = validateImageUploads;

export const validateTitle = (title) => {
  const sanitized = sanitizeText(title);
  if (!sanitized) return { valid: false, error: 'Title is required' };
  if (sanitized.length < 3) return { valid: false, error: 'Title must be at least 3 characters' };
  if (sanitized.length > 200) return { valid: false, error: 'Title must be 200 characters or less' };
  return { valid: true, sanitized };
};

export const validateTag = (tag) => {
  const sanitized = sanitizeText(tag);
  if (!sanitized) return { valid: false, error: 'Tag cannot be empty' };
  if (sanitized.length > 30) return { valid: false, error: 'Tag must be 30 characters or less' };
  if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) return { valid: false, error: 'Tag can only contain letters, numbers, hyphens, and underscores' };
  return { valid: true, sanitized };
};

export const validateTags = (tags, maxCount = 10) => {
  if (!tags || !Array.isArray(tags)) return { valid: true, sanitized: [] };
  if (tags.length > maxCount) return { valid: false, error: `Maximum ${maxCount} tags allowed` };
  const sanitizedTags = [], errors = [];
  tags.forEach((tag, index) => {
    const validation = validateTag(tag);
    validation.valid ? sanitizedTags.push(validation.sanitized) : errors.push(`Tag ${index + 1}: ${validation.error}`);
  });
  return errors.length > 0 ? { valid: false, error: errors.join('\n') } : { valid: true, sanitized: sanitizedTags };
};

export const validateContent = (content, maxLength = 50000) => {
  if (!content || typeof content !== 'string') return { valid: false, error: 'Content is required' };
  if (content.trim().length === 0) return { valid: false, error: 'Content cannot be empty' };
  if (content.length > maxLength) return { valid: false, error: `Content must be ${maxLength} characters or less` };
  return { valid: true, sanitized: sanitizeMarkdown(content) };
};

export const validateCodeSnippet = (code, language = 'javascript') => {
  if (!code || typeof code !== 'string') return { valid: false, error: 'Code is required' };
  if (code.trim().length === 0) return { valid: false, error: 'Code cannot be empty' };
  if (code.length > 50000) return { valid: false, error: 'Code must be 50,000 characters or less' };
  return { valid: true, sanitized: sanitizeCode(code), language };
};

export const validatePostData = (formData, contentType = 'text') => {
  const errors = [], sanitizedData = {};
  const titleValidation = validateTitle(formData.title);
  titleValidation.valid ? sanitizedData.title = titleValidation.sanitized : errors.push(titleValidation.error);
  
  if (contentType === 'text') {
    const contentValidation = validateContent(formData.content);
    if (contentValidation.valid) {
      sanitizedData.content = contentValidation.sanitized;
      sanitizedData.isCodePost = false;
    } else errors.push(contentValidation.error);
  } else if (contentType === 'code') {
    const codeValidation = validateCodeSnippet(formData.code, formData.codeLanguage);
    if (codeValidation.valid) {
      sanitizedData.code = codeValidation.sanitized;
      sanitizedData.codeLanguage = formData.codeLanguage || 'javascript';
      sanitizedData.isCodePost = true;
    } else errors.push(codeValidation.error);
  }
  
  if (formData.image) {
    const sanitizedUrl = sanitizeUrl(formData.image);
    !sanitizedUrl ? errors.push('Invalid image URL') : !isValidImageUrl(sanitizedUrl) ? errors.push('URL must point to a valid image') : sanitizedData.image = sanitizedUrl;
  }
  
  if (formData.tags && formData.tags.length > 0) {
    const tagsValidation = validateTags(formData.tags);
    tagsValidation.valid ? sanitizedData.tags = tagsValidation.sanitized : errors.push(tagsValidation.error);
  } else sanitizedData.tags = [];
  
  if (contentType === 'text' && formData.content) {
    sanitizedData.links = extractUrls(formData.content).map(url => ({ url, platform: detectPlatform(url) }));
  }
  
  return { valid: errors.length === 0, errors, data: errors.length === 0 ? sanitizedData : null };
};

export const detectCode = (text) => {
  if (!text || typeof text !== 'string') return false;
  const codePatterns = [/function\s+\w+\s*\(/,/const\s+\w+\s*=/,/let\s+\w+\s*=/,/var\s+\w+\s*=/,/import\s+.+\s+from/,/export\s+(default|const|class|function)/,/class\s+\w+/,/def\s+\w+\s*\(/,/public\s+(static\s+)?class/,/<\w+[^>]*>/,/\{\s*\n\s+/,/=>\s*{/,/if\s*\(/,/for\s*\(/,/while\s*\(/,/\bprint\s*\(/,/console\.(log|error|warn)/];
  const indicators = codePatterns.filter(pattern => pattern.test(text)).length;
  const hasBlockStructure = text.includes('{') && text.includes('}');
  const hasSemicolons = text.split(';').length > 2;
  const hasIndentation = /\n[ \t]+/.test(text);
  return indicators >= 2 || (hasBlockStructure && (hasSemicolons || hasIndentation));
};

export const detectLanguage = (code) => {
  if (!code || typeof code !== 'string') return 'javascript';
  const patterns = {
    jsx:[/import\s+React/,/useState/,/useEffect/,/<\/\w+>/],typescript:[/interface\s+\w+/,/type\s+\w+\s*=/,/:\s*(string|number|boolean)/],
    python:[/def\s+\w+\s*\(/,/import\s+\w+/,/from\s+\w+\s+import/,/print\s*\(/],java:[/public\s+class/,/System\.out/,/private\s+(static\s+)?void/],
    cpp:[/#include\s*</,/std::/,/cout\s*<</],csharp:[/using\s+System/,/namespace\s+\w+/,/public\s+class/],go:[/package\s+main/,/func\s+\w+/,/import\s*\(/],
    rust:[/fn\s+\w+/,/impl\s+\w+/,/let\s+mut/],php:[/<\?php/,/\$\w+\s*=/,/echo\s+/],ruby:[/def\s+\w+/,/end\s*$/,/puts\s+/],
    sql:[/SELECT\s+/,/FROM\s+/,/WHERE\s+/,/INSERT\s+INTO/],html:[/<!DOCTYPE/,/<html/,/<body/],css:[/\{[^}]*:\s*[^}]*;/,/@media/,/\.[\w-]+\s*\{/],
    json:[/^\s*\{/,/"\w+"\s*:/,/^\s*\[/],yaml:[/^[\w-]+:/,/^\s+-\s+/],bash:[/#!/,/\becho\b/,/\bif\s+\[/],markdown:[/^#+\s+/,/\[.*\]\(.*\)/,/^-\s+/]
  };
  let maxScore = 0, detectedLang = 'javascript';
  for (const [lang, langPatterns] of Object.entries(patterns)) {
    const score = langPatterns.filter(pattern => pattern.test(code)).length;
    if (score > maxScore) { maxScore = score; detectedLang = lang; }
  }
  return detectedLang;
};

export const checkRateLimit = (key, maxAttempts = 5, windowMs = 60000) => {
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(`rateLimit_${key}`) || '[]');
  const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
  if (recentAttempts.length >= maxAttempts) return { allowed: false, retryAfter: Math.ceil((recentAttempts[0] + windowMs - now) / 1000) };
  recentAttempts.push(now);
  localStorage.setItem(`rateLimit_${key}`, JSON.stringify(recentAttempts));
  return { allowed: true };
};

export const detectSpam = (text) => {
  if (!text || typeof text !== 'string') return false;
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  if (urlCount > 5) return true;
  const spamIndicators = [/https?:\/\/[^\s]+/gi,/\b(buy|click|free|winner|prize|claim)\b/gi,/(.)\1{10,}/,/[A-Z]{20,}/];
  return spamIndicators.filter(pattern => pattern.test(text)).length >= 3;
};

export const sanitizePostData = (formData) => {
  const contentType = formData.isCodePost ? 'code' : 'text';
  const validation = validatePostData(formData, contentType);
  return validation.valid ? validation.data : null;
};

export default { sanitizeText, sanitizeMarkdown, sanitizeCode, sanitizeUrl, isValidImageUrl, isValidVideoUrl, extractUrls, detectPlatform, validateImageFile, validateVideoFile, validateVideoDuration, validateImageUploads, validateImageFiles, sanitizeFileName, validateTitle, validateTag, validateTags, validateContent, validateCodeSnippet, validatePostData, sanitizePostData, detectCode, detectLanguage, checkRateLimit, detectSpam };