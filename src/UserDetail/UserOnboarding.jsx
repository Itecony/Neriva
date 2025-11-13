import { useState, useEffect } from 'react';

export default function OnboardingModal({ isOpen, onClose, existingData = null }) {
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(false);

  const roles = [
    'student',
    'professional', 
    'hobbyist',
    'educator',
    'entrepreneur'
  ];

  const interests = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'UI/UX Design',
    'DevOps',
    'Cybersecurity',
    'Game Development',
    'Blockchain',
    'Cloud Computing',
    'IoT',
    'AR/VR'
  ];

  useEffect(() => {
    if (existingData) {
      if (existingData.role) {
        setSelectedRole(existingData.role);
      }
      if (Array.isArray(existingData.interests)) {
        setSelectedInterests(existingData.interests);
      }
    }
  }, [existingData]);

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleGetStarted = async () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }
    if (selectedInterests.length === 0) {
      alert('Please select at least one interest');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://itecony-neriva-backend.onrender.com/api/onboarding/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          role: selectedRole,
          interests: selectedInterests,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit onboarding');
      }

      const data = await response.json();
      console.log('✅ Onboarding completed successfully:', data);

      // Simply close the modal - backend has saved everything
      onClose();

    } catch (error) {
      console.error('❌ Onboarding error:', error);
      alert(error.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 sm:p-10">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-8">
          {existingData?.role ? 'Update Your Profile' : 'Please Answer A Few Questions To Get Started'}
        </h2>

        {/* Question 1 - Role */}
        <div className="mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            What best describes you?
          </h3>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-2 py-2 rounded-full text-xs font-medium transition-colors capitalize ${
                  selectedRole === role
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 shadow-sm text-black hover:bg-gray-100'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2 - Interests */}
        <div className="mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            What are you interested in? (Select all that apply)
          </h3>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-1 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedInterests.includes(interest)
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 shadow-sm text-black hover:bg-gray-100'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          {selectedInterests.length > 0 && (
            <p className="text-xs text-gray-600 mt-2">
              {selectedInterests.length} selected
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleGetStarted}
            disabled={loading}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : existingData?.role ? 'Update Profile' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  );
}