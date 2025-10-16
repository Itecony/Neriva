import { useState } from 'react';

export default function OnboardingModal({ isOpen, onClose }) {
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(false);

  const roles = [
    'Graduate',
    'Startup',
    'Undergraduate',
    'Freelancer',
    'Professional',
    'Employer'
  ];

  const interests = [
    'Data Science',
    'AI and Machine Learning',
    'Software Development',
    'Cybersecurity',
    'Graphic Design',
    'Cloud Computing',
    'UI / UX Design',
    'Mobile Development'
  ];

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
      // Submit onboarding data to backend
      const response = await fetch('https://itecony-neriva-backend.onrender.com/api/onboarding/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          role: selectedRole.toLowerCase(),
          interests: selectedInterests,
          bio: '' // Optional
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit onboarding');
      }

      const data = await response.json();
      console.log('Onboarding completed:', data);

      // Close modal and redirect to dashboard
      onClose();
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 sm:p-10">
        {/* Header */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-8">
          Please Answer A few Questions To get Started
        </h2>

        {/* Question 1 */}
        <div className="mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            What best describes you.
          </h3>
          <div className="flex flex-row gap-1">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-1 py-2 rounded-full text-xs font-medium transition-colors ${
                  selectedRole === role
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 shadow-2xl text-black hover:bg-gray-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2 */}
        <div className="mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            What are you interested in
          </h3>
          <div className="flex flex-wrap gap-1">
            {interests.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-1 py-2 rounded-full text-xs font-medium transition-colors ${
                  selectedInterests.includes(interest)
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 shadow-2xl text-black hover:bg-gray-200'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Get Started Button */}
        <div className="flex justify-end">
          <button
            onClick={handleGetStarted}
            disabled={loading}
            className="bg-blue-900 text-white px-1 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400"
          >
            {loading ? 'Submitting...' : 'Get started'}
          </button>
        </div>
      </div>
    </div>
  );
}