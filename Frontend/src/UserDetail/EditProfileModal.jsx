import { useState, useRef } from 'react';
import { X, Camera, Save, MapPin, Briefcase, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function EditProfileModal({ isOpen, onClose, currentUser, onUpdate }) {
    const [formData, setFormData] = useState({
        firstName: currentUser?.firstName || '',
        lastName: currentUser?.lastName || '',
        bio: currentUser?.bio || '',
        title: currentUser?.title || '',
        company: currentUser?.company || '',
        location: currentUser?.location || ''
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(
        currentUser?.avatar || currentUser?.profileImage || currentUser?.profilePicture || null
    );
    const [loading, setLoading] = useState(false);
    const [removeImage, setRemoveImage] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setRemoveImage(false);
        }
    };

    const handleRemoveImage = () => {
        setFile(null);
        setPreview(null);
        setRemoveImage(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');

            // 1. Upload Image if changed
            if (file) {
                const imageFormData = new FormData();
                imageFormData.append('image', file);

                const uploadRes = await fetch(`${API_BASE_URL}/api/upload-image`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: imageFormData
                });

                if (!uploadRes.ok) throw new Error('Failed to upload image');
            }

            // 2. Update Profile Data
            const profileData = { ...formData };
            if (removeImage && !file) {
                profileData.avatar = null;
                profileData.profilePicture = null;
            }

            const res = await fetch(`${API_BASE_URL}/api/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            if (!res.ok) throw new Error('Failed to update profile');

            const data = await res.json();
            onUpdate(data.user); // Should call parent to refresh or data
            onClose();
        } catch (error) {
            console.error(error);
            alert('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (src) => {
        if (!src) return null;
        if (typeof src === 'string' && (src.startsWith('http') || src.startsWith('blob:'))) return src;
        return `${API_BASE_URL}/${src}`;
    };

    const displayPreview = getImageUrl(preview);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">Edit Profile</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* content */}
                <div className="overflow-y-auto p-6 flex-1">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Image Upload */}
                        <div className="flex flex-col items-center">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-md bg-gray-100">
                                    {displayPreview ? (
                                        <img src={displayPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-700 font-bold text-2xl">
                                            {formData.firstName?.[0]}{formData.lastName?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            <div className="flex gap-3 mt-3">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-teal-600 font-medium hover:underline">Change Photo</button>
                                {preview && (
                                    <button type="button" onClick={handleRemoveImage} className="text-sm text-red-500 font-medium hover:underline flex items-center gap-1">
                                        <Trash2 className="w-3 h-3" /> Remove
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Professional Info */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Professional Headline / Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Senior Software Engineer"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Company</label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder="Company Name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="City, Country"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>

            </div>
        </div>
    );
}
