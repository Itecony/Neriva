// src/components/PostModal/ContentTypeToggle.jsx
import { Type, Code } from 'lucide-react';

export default function ContentTypeToggle({ contentType, onToggle }) {
  return (
    <div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onToggle('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            contentType === 'text'
              ? 'bg-gradient-to-b from-teal-500 via-cyan-600 to-blue-700 hover:brightness-110 text-white'
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
              ? 'bg-gradient-to-b from-teal-500 via-cyan-600 to-blue-700 hover:brightness-110 text-white'
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