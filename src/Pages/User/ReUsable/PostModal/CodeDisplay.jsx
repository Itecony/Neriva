// src/components/PostModal/CodeDisplay.jsx
import { useState, useEffect, useRef } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeDisplay({ code, language, image }) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  useEffect(() => {
    if (code && codeRef.current && window.Prism) {
      window.Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy code');
    }
  };

  return (
    <div className="mb-6">
      {/* Side-by-Side Layout for Code Posts with Images */}
      {image && code ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Image */}
          <div className="rounded-xl overflow-hidden">
            <img
              src={image}
              alt="Post visual"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right: Code with Copy Button */}
          <div className="relative">
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 z-10 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto h-full">
              <pre className="text-sm">
                <code 
                  ref={codeRef}
                  className={`language-${language || 'javascript'}`}
                >
                  {code}
                </code>
              </pre>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 text-right">
              Language: {language?.toUpperCase() || 'JavaScript'}
            </div>
          </div>
        </div>
      ) : (
        // Code only (no image)
        <div className="relative">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 z-10 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          
          <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
            <pre className="text-sm">
              <code 
                ref={codeRef}
                className={`language-${language || 'javascript'}`}
              >
                {code}
              </code>
            </pre>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 text-right">
            Language: {language?.toUpperCase() || 'JavaScript'}
          </div>
        </div>
      )}
    </div>
  );
}