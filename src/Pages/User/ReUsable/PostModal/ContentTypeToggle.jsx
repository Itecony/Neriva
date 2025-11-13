// src/components/PostModal/ContentTypeToggle.jsx
import { Type, Code } from 'lucide-react';

export default function ContentTypeToggle({ contentType, onToggle }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Content Type
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onToggle('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            contentType === 'text'
              ? 'bg-teal-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={contentType === 'text'}
        >
          <Type className="w-4 h-4" />
          Text
        </button>
        <button
          type="button"
          onClick={() => onToggle('code')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            contentType === 'code'
              ? 'bg-teal-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={contentType === 'code'}
        >
          <Code className="w-4 h-4" />
          Code
        </button>
      </div>
    </div>
  );
}