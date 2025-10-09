import { useState } from 'react';

export default function OnboardingModal({ isOpen, onClose }) {
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);

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

  const handleGetStarted = () => {
    console.log('Selected Role:', selectedRole);
    console.log('Selected Interests:', selectedInterests);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/10 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 sm:p-10">
        {/* Header */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
          Please Answer A few Questions To get Started
        </h2>

        {/* Question 1 */}
        <div className="mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            What best describes you.
          </h3>
          <div className="flex flex-row flex-wrap gap-1">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-2 py-2 rounded-full text-xs font-semibold transition-colors ${
                  selectedRole === role
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                className={`px-2 py-2 rounded-full text-xs font-semibold transition-colors ${
                  selectedInterests.includes(interest)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Get started
          </button>
        </div>
      </div>
    </div>
  );
}