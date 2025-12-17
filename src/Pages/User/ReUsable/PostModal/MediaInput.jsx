import { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Upload, X, Plus } from 'lucide-react';

export default function MediaInput({ images, onImagesChange, onFilesChange, onError }) {
  // Local state for the visual previews (Blobs)
  const [previewUrls, setPreviewUrls] = useState(images || []);
  
  // Track raw files to send to parent
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // Ref to track if we have user-selected content (to prevent parent overrides)
  const hasUserSelection = useRef(false);

  // Sync with parent ONLY if user hasn't started selecting files locally
  // This prevents the parent from wiping out your fresh Blob preview
  useEffect(() => {
    if (!hasUserSelection.current) {
      setPreviewUrls(images || []);
    }
  }, [images]);

  // ✅ INTERNAL VALIDATION (No external dependencies)
  const validateFiles = (files) => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const valid = [];
    const errors = [];

    files.forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`Invalid type: ${file.name}`);
      } else if (file.size > MAX_SIZE) {
        errors.push(`Too large (Max 5MB): ${file.name}`);
      } else {
        valid.push(file);
      }
    });

    return { validFiles: valid, errors };
  };

  const handleImageFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check Total Limit
    if (previewUrls.length + files.length > 5) {
      onError?.('Maximum 5 images allowed');
      return;
    }

    // Validate
    const { validFiles, errors } = validateFiles(files);
    
    if (errors.length > 0) {
      onError?.(errors.join('\n'));
      if (validFiles.length === 0) return; // Stop if no valid files
    }

    // ✅ OPTIMISTIC UI: Create Blob URLs immediately
    const newBlobs = validFiles.map(file => URL.createObjectURL(file));
    const updatedPreviews = [...previewUrls, ...newBlobs].slice(0, 5);
    const updatedFiles = [...selectedFiles, ...validFiles].slice(0, 5);

    // Lock sync so parent doesn't override us
    hasUserSelection.current = true;

    // Update Local State (Visual)
    setPreviewUrls(updatedPreviews);
    setSelectedFiles(updatedFiles);

    // Notify Parent
    onImagesChange?.(updatedPreviews); 
    onFilesChange?.(updatedFiles);     

    // Reset input
    e.target.value = '';
  };

  const handleRemove = (index) => {
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    
    // Logic to remove the correct raw file
    const existingCount = previewUrls.length - selectedFiles.length;
    if (index >= existingCount) {
        const fileIndex = index - existingCount;
        const updatedFiles = selectedFiles.filter((_, i) => i !== fileIndex);
        setSelectedFiles(updatedFiles);
        onFilesChange?.(updatedFiles);
    }

    // If list is empty, unlock sync
    if (updatedPreviews.length === 0) {
        hasUserSelection.current = false;
    }

    setPreviewUrls(updatedPreviews);
    onImagesChange?.(updatedPreviews);
  };

  return (
    <div className="space-y-3">
      {/* File Input */}
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        multiple
        onChange={handleImageFileUpload}
        className="hidden"
        id="image-upload"
      />

      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">Images ({previewUrls.length}/5)</label>
        {previewUrls.length < 5 && (
            <label
                htmlFor="image-upload"
                className="text-sm text-teal-600 hover:text-teal-700 cursor-pointer flex items-center gap-1"
            >
                <Plus className="w-4 h-4" /> Add
            </label>
        )}
      </div>

      {/* Empty State */}
      {previewUrls.length === 0 && (
        <label
            htmlFor="image-upload"
            className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition-colors text-sm"
        >
            <Upload className="w-5 h-5 text-gray-400" />
            <div>
            <span className="text-gray-700">Click to upload</span>
            <span className="text-xs text-gray-500 block">Max 5 images, 5MB each</span>
            </div>
        </label>
      )}

      {/* Preview Grid */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {previewUrls.map((url, index) => {
            // ✅ Fix for "Preview 1" alt text issue
            // If it's a blob, it shows directly. If it's a server URL (relative), prepend domain.
            let src = url;
            if (typeof src === 'string' && !src.startsWith('blob:') && !src.startsWith('http')) {
                src = `https://itecony-neriva-backend.onrender.com/${src}`;
            }

            return (
              <div key={index} className="relative group w-full h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={src}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Error'; }} // Fallback if link is broken
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}