// src/components/PostModal/TextEditor.jsx
export default function TextEditor({ value, onChange, onPaste }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Content * <span className="text-xs text-gray-500">(Markdown supported)</span>
      </label>
      <textarea
        name="content"
        value={value}
        onChange={onChange}
        onPaste={onPaste}
        rows="10"
        placeholder="What's on your mind? You can use Markdown formatting here...

**Bold text**
*Italic text*
[Link](https://example.com)
- Bullet points
1. Numbered lists
`inline code`

💡 Tip: Paste code and it will automatically switch to code mode!"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-mono text-sm"
      />
      <div className="mt-2 flex justify-between items-center">
        <p className="text-xs text-gray-500">
          💡 Supports Markdown formatting for rich text
        </p>
        <p className="text-xs text-gray-400">
          {value.length} characters
        </p>
      </div>
    </div>
  );
}