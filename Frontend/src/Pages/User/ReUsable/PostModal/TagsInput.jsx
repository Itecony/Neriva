// src/components/PostModal/TagsInput.jsx
import { X } from 'lucide-react';
import { validateTag } from '../../../../utils/sanitization';

export default function TagsInput({ tags, onChange, onError }) {
  const handleAddTag = (tagValue) => {
    if (!tagValue.trim()) return;

    if (tags.length >= 10) {
      onError?.('Maximum 10 tags allowed');
      return;
    }

    const validation = validateTag(tagValue);
    
    if (!validation.valid) {
      onError?.(validation.error);
      return;
    }

    if (tags.includes(validation.sanitized)) {
      onError?.('Tag already exists');
      return;
    }

    onChange([...tags, validation.sanitized]);
  };

  const handleRemoveTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(e.target.value);
      e.target.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tags (Optional, Max 10)
      </label>
      
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          onKeyPress={handleKeyPress}
          onBlur={(e) => {
            if (e.target.value.trim()) {
              handleAddTag(e.target.value);
              e.target.value = '';
            }
          }}
          placeholder="Add a tag (press Enter)..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          maxLength={30}
        />
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm flex items-center gap-2 group hover:bg-teal-200 transition-colors"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-teal-900 transition-colors"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        💡 Tags help others discover your post. Use relevant keywords.
      </p>
    </div>
  );
}