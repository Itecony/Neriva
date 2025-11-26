// src/components/PostModal/MediaInput.jsx
import { useState, useRef } from 'react';
import { Image as ImageIcon, Video, Link as LinkIcon, Upload, X, Plus } from 'lucide-react';
import { validateImageFiles, validateVideoFile, validateVideoDuration, sanitizeUrl } from '../../../../utils/sanitization';

export default function MediaInput({ images, video, onImagesChange, onVideoChange, onError }) {
  const [imageUrls, setImageUrls] = useState(images || []);
  const [videoUrl, setVideoUrl] = useState(video || '');
  const [showMenu, setShowMenu] = useState(false);
  const [activeMedia, setActiveMedia] = useState(null); // 'image-url', 'image-file', 'video-url', 'video-file'
  const menuRef = useRef(null);

  const handleImageUrlAdd = () => {
    if (imageUrls.length >= 5) {
      onError?.('Maximum 5 images allowed');
      return;
    }
    setImageUrls([...imageUrls, '']);
  };

  const handleImageUrlChange = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
    onImagesChange?.(newUrls.filter(url => url.trim()));
  };

  const handleImageUrlRemove = (index) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    onImagesChange?.(newUrls);
    if (newUrls.length === 0) setActiveMedia(null);
  };

  const handleImageFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    try {
      const validation = validateImageFiles(files);
      
      if (!validation.valid) {
        if (validation.error) {
          onError?.(validation.error);
        } else if (validation.errors) {
          onError?.(validation.errors.join('\n'));
        }
        return;
      }

      const fileUrls = await Promise.all(
        validation.sanitized.map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
          });
        })
      );

      const combinedUrls = [...imageUrls, ...fileUrls].slice(0, 5);
      setImageUrls(combinedUrls);
      onImagesChange?.(combinedUrls);
    } catch (error) {
      onError?.(error.message);
    }
  };

  const handleVideoFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateVideoFile(file);
      await validateVideoDuration(file, 30);

      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoUrl(e.target.result);
        onVideoChange?.(e.target.result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      onError?.(error.message);
    }
  };

  const handleVideoUrlChange = (value) => {
    const sanitized = sanitizeUrl(value);
    setVideoUrl(value);
    onVideoChange?.(sanitized);
  };

  const selectMediaType = (type) => {
    setActiveMedia(type);
    setShowMenu(false);
  };

  return (
    <div className="space-y-3">
      {/* Add Media Button with Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-gradient-to-b from-teal-500 via-cyan-600 to-blue-700 hover:brightness-110 rounded-full transition-colors"
          >
            <Plus className="w-6 h-6 font-bold" />
          </button>

          {/* Dropdown Menu (horizontal row) */}
          {showMenu && (
            <div
          className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-1 flex items-center gap-1"
          style={{ whiteSpace: 'nowrap' }}
            >
          <button
            type="button"
            onClick={() => selectMediaType('image-url')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            <span className="whitespace-nowrap">Image URL</span>
          </button>
          <button
            type="button"
            onClick={() => selectMediaType('image-file')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="whitespace-nowrap">Upload Image</span>
          </button>
          <button
            type="button"
            onClick={() => selectMediaType('video-url')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            <span className="whitespace-nowrap">Video URL</span>
          </button>
          <button
            type="button"
            onClick={() => selectMediaType('video-file')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
          >
            <Video className="w-4 h-4" />
            <span className="whitespace-nowrap">Upload Video</span>
          </button>
            </div>
          )}
        </div>

        {/* Image URL Input */}
      {activeMedia === 'image-url' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Image URLs</label>
            <button
              type="button"
              onClick={() => {
                setActiveMedia(null);
                setImageUrls([]);
                onImagesChange?.([]);
              }}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Clear all
            </button>
          </div>
          {imageUrls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={() => handleImageUrlRemove(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {imageUrls.length < 5 && (
            <button
              type="button"
              onClick={handleImageUrlAdd}
              className="text-sm text-teal-600 hover:text-teal-700"
            >
              + Add another image
            </button>
          )}
        </div>
      )}

      {/* Image File Upload */}
      {activeMedia === 'image-file' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Upload Images</label>
            <button
              type="button"
              onClick={() => {
                setActiveMedia(null);
                setImageUrls([]);
                onImagesChange?.([]);
              }}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Clear
            </button>
          </div>
          
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            multiple
            onChange={handleImageFileUpload}
            className="hidden"
            id="image-upload"
          />
          
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

          {imageUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageUrlRemove(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Video URL Input */}
      {activeMedia === 'video-url' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Video URL</label>
            <button
              type="button"
              onClick={() => {
                setActiveMedia(null);
                setVideoUrl('');
                onVideoChange?.('');
              }}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Clear
            </button>
          </div>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => handleVideoUrlChange(e.target.value)}
            placeholder="https://example.com/video.mp4"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <p className="text-xs text-gray-500 mt-1">Max 30 seconds</p>
        </div>
      )}

      {/* Video File Upload */}
      {activeMedia === 'video-file' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Upload Video</label>
            <button
              type="button"
              onClick={() => {
                setActiveMedia(null);
                setVideoUrl('');
                onVideoChange?.('');
              }}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Clear
            </button>
          </div>
          
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleVideoFileUpload}
            className="hidden"
            id="video-upload"
          />
          
          {!videoUrl ? (
            <label
              htmlFor="video-upload"
              className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition-colors text-sm"
            >
              <Video className="w-5 h-5 text-gray-400" />
              <div>
                <span className="text-gray-700">Click to upload</span>
                <span className="text-xs text-gray-500 block">Max 30s, 50MB</span>
              </div>
            </label>
          ) : (
            <div className="relative">
              <video
                src={videoUrl}
                controls
                className="w-full rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setVideoUrl('');
                  onVideoChange?.('');
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}