// src/components/PostModal/TextEditor.jsx
import { useEffect } from 'react';

export default function TextEditor({ value, onChange, onPaste, onTagsDetected }) {
  useEffect(() => {
    // Extract hashtags from content
    const hashtagRegex = /#(\w+)/g;
    const matches = value.match(hashtagRegex);
    
    if (matches) {
      const tags = matches.map(tag => tag.slice(1)); // Remove # symbol
      const uniqueTags = [...new Set(tags)]; // Remove duplicates
      
      // Notify parent component
      if (onTagsDetected) {
        onTagsDetected(uniqueTags);
      }
    } else {
      if (onTagsDetected) {
        onTagsDetected([]);
      }
    }
  }, [value, onTagsDetected]);

  return (
    <div>
      <textarea
        name="content"
        value={value}
        onChange={onChange}
        onPaste={onPaste}
        rows="10"
        placeholder="Tell us about your idea... (Use #hashtags)"
        className="w-full px-2 py-2 placeholder:font-bold placeholder:text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-mono text-sm"
      />
      <div className="mt-2 flex justify-between items-center">
        <p className="text-xs text-gray-500">
        </p>
      </div>
    </div>
  );
}