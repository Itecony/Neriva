// src/components/PostModal/MediaInput.jsx
import { useState } from 'react';
import { Image as ImageIcon, Video, Upload, X } from 'lucide-react';
import { validateImageFiles, validateVideoFile, validateVideoDuration, sanitizeUrl } from '../../../../utils/sanitization';

export default function MediaInput({ images, video, onImagesChange, onVideoChange, onError }) {
  const [imageUrls, setImageUrls] = useState(images || []);
  const [videoUrl, setVideoUrl] = useState(video || '');
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'

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

      // Convert files to data URLs for preview
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
      // Validate file type and size
      validateVideoFile(file);
      
      // Validate duration
      await validateVideoDuration(file, 30);

      // Convert to data URL
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

  return (
    <div className="space-y-4">
      {/* Upload Mode Toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Media (Optional)
        </label>
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setUploadMode('url')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              uploadMode === 'url'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('file')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              uploadMode === 'file'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upload
          </button>
        </div>
      </div>

      {/* Images Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <ImageIcon className="w-4 h-4 inline mr-1" />
          Images (Max 5)
        </label>

        {uploadMode === 'url' ? (
          <div className="space-y-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => handleImageUrlRemove(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            
            {imageUrls.length < 5 && (
              <button
                type="button"
                onClick={handleImageUrlAdd}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-teal-500 hover:text-teal-500 transition-colors"
              >
                + Add Image URL
              </button>
            )}
          </div>
        ) : (
          <div>
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
              className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                Click to upload images
              </span>
              <span className="text-xs text-gray-500 mt-1">
                JPEG, PNG, GIF, WebP (Max 5MB each)
              </span>
            </label>

            {/* Preview uploaded images */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageUrlRemove(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Video className="w-4 h-4 inline mr-1" />
          Short Video (Max 30 seconds)
        </label>

        {uploadMode === 'url' ? (
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => handleVideoUrlChange(e.target.value)}
            placeholder="https://example.com/video.mp4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        ) : (
          <div>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoFileUpload}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition-colors"
            >
              <Video className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                Click to upload video
              </span>
              <span className="text-xs text-gray-500 mt-1">
                MP4, WebM, MOV (Max 30 seconds, 50MB)
              </span>
            </label>

            {videoUrl && (
              <div className="mt-3 relative">
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
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        💡 Add images to visualize your content or a short video for demos
      </p>
    </div>
  );
}