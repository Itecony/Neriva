// src/components/PostModal/CodeEditor.jsx
import { getSupportedLanguages } from '../../../../utils/prismloader';

export default function CodeEditor({ code, language, onChange }) {
  const supportedLanguages = getSupportedLanguages().map(lang => ({
    value: lang,
    label: lang.charAt(0).toUpperCase() + lang.slice(1)
  }));

  return (
    <>
      {/* Language Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Programming Language
        </label>
        <select
          name="codeLanguage"
          value={language}
          onChange={onChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        >
          {supportedLanguages.map(lang => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Code Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Code *
        </label>
        <textarea
          name="code"
          value={code}
          onChange={onChange}
          rows="16"
          placeholder="// Your code here...
          
function example() {
  console.log('Start coding!');
}

// Supports syntax highlighting for multiple languages"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-mono text-sm bg-gray-900 text-gray-100"
          style={{ tabSize: 2 }}
          spellCheck="false"
        />
        <div className="mt-2 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            💡 Tab key inserts spaces (2 spaces)
          </p>
          <p className="text-xs text-gray-400">
            {code.length} characters
          </p>
        </div>
      </div>
    </>
  );
}