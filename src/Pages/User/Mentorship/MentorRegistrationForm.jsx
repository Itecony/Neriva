import { useState, useEffect } from 'react';
import { ChevronDown, X, AlertCircle, CheckCircle } from 'lucide-react';

export default function MentorRegistrationForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    essay: '',
    selectedProjects: [],
    domains: [],
    newDomain: ''
  });

  // Fetch user's projects on component mount
  useEffect(() => {
    fetchUserProjects();
  }, []);

  const fetchUserProjects = async () => {
    try {
      const token = localStorage.getItem('authToken');
      // This endpoint might need adjustment based on your API
      const response = await fetch(
        'https://itecony-neriva-backend.onrender.com/api/projects',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch projects');

      const data = await response.json();
      const userProjects = Array.isArray(data) ? data : data.projects || [];
      setProjects(userProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setProjects([]);
    }
  };

  const handleEssayChange = (e) => {
    setFormData({ ...formData, essay: e.target.value });
  };

  const handleProjectToggle = (projectId) => {
    setFormData(prev => ({
      ...prev,
      selectedProjects: prev.selectedProjects.includes(projectId)
        ? prev.selectedProjects.filter(id => id !== projectId)
        : [...prev.selectedProjects, projectId]
    }));
  };

  const handleAddDomain = () => {
    if (formData.newDomain.trim() && !formData.domains.includes(formData.newDomain.trim())) {
      setFormData(prev => ({
        ...prev,
        domains: [...prev.domains, formData.newDomain.trim()],
        newDomain: ''
      }));
    }
  };

  const handleRemoveDomain = (domain) => {
    setFormData(prev => ({
      ...prev,
      domains: prev.domains.filter(d => d !== domain)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error("No 'authToken' found. Please log in again.");
      }

      if (!formData.essay.trim()) {
        throw new Error('Please write your mentorship essay');
      }

      if (formData.selectedProjects.length === 0) {
        throw new Error('Please select at least one project');
      }

      if (formData.domains.length === 0) {
        throw new Error('Please add at least one domain of expertise');
      }

      // POST /api/mentors/apply (protected)
      const response = await fetch(
        'https://itecony-neriva-backend.onrender.com/api/mentors/apply',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            essay: formData.essay,
            selected_projects: formData.selectedProjects,
            domains: formData.domains
          })
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Server Error (${response.status}): ${errorBody || response.statusText}`);
      }

      const data = await response.json();
      setSuccess(true);
      setFormData({ essay: '', selectedProjects: [], domains: [], newDomain: '' });
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setStep(1);
      }, 3000);
    } catch (err) {
      setError(err.message);
      console.error('FULL ERROR DETAILS:', err);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (step / 3) * 100;
  const essayWordCount = formData.essay.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Become a Mentor</h1>
          <p className="text-gray-600 text-lg">Share your expertise and guide the next generation of professionals</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900">Application submitted successfully!</p>
              <p className="text-sm text-green-700">Our team will review your application and get back to you soon.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-700 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 transition-colors ${
                      s <= step
                        ? 'bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-700 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s}
                  </div>
                  <span className={`text-xs font-medium text-center ${
                    s <= step ? 'text-teal-600' : 'text-gray-600'
                  }`}>
                    {s === 1 ? 'Your Story' : s === 2 ? 'Projects' : 'Expertise'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="px-6 py-8">
            {/* Step 1: Essay */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Tell us about your mentorship journey
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    Share your experience, what you've learned, and why you want to mentor others. This helps us understand your background and teaching philosophy.
                  </p>
                  <textarea
                    value={formData.essay}
                    onChange={handleEssayChange}
                    placeholder="I have been working in web development for 5 years and have mentored 10+ junior developers. My approach focuses on hands-on learning and real-world projects..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    rows="8"
                    minLength="100"
                  />
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Minimum 100 words required
                    </span>
                    <span className={`text-xs font-medium ${
                      essayWordCount >= 100 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {essayWordCount} words
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Projects */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Select your best projects (at least 1)
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose projects that showcase your expertise and would be good examples for mentees.
                  </p>
                  
                  {projects.length > 0 ? (
                    <div className="space-y-3">
                      {projects.map((project) => (
                        <div
                          key={project._id || project.id}
                          className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleProjectToggle(project._id || project.id)}
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedProjects.includes(project._id || project.id)}
                            onChange={() => {}}
                            className="mt-1 w-5 h-5 text-teal-500 rounded border-gray-300 focus:ring-teal-500 cursor-pointer"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{project.title || project.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {project.description || 'No description provided'}
                            </p>
                            {project.technologies && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {(Array.isArray(project.technologies) ? project.technologies : []).slice(0, 3).map((tech, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-50 rounded-lg text-center border border-gray-200">
                      <p className="text-gray-600">No projects found. You can add projects later.</p>
                    </div>
                  )}

                  {formData.selectedProjects.length > 0 && (
                    <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
                      <p className="text-sm text-teal-800">
                        ✓ {formData.selectedProjects.length} project{formData.selectedProjects.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Expertise Domains */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Areas of expertise (at least 1)
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    List the domains where you have strong expertise and can mentor others.
                  </p>

                  {/* Suggested Domains */}
                  <div className="mb-6">
                    <p className="text-xs font-medium text-gray-600 mb-3">Suggested domains:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'Web Development',
                        'Mobile Development',
                        'Product Management',
                        'UI/UX Design',
                        'Data Science',
                        'Machine Learning',
                        'DevOps',
                        'Cloud Architecture',
                        'Cybersecurity',
                        'Leadership',
                        'Project Management',
                        'Technical Writing'
                      ].map((domain) => (
                        <button
                          key={domain}
                          type="button"
                          onClick={() => {
                            if (!formData.domains.includes(domain)) {
                              setFormData(prev => ({
                                ...prev,
                                domains: [...prev.domains, domain]
                              }));
                            }
                          }}
                          disabled={formData.domains.includes(domain)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.domains.includes(domain)
                              ? 'bg-teal-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {domain}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Domain Input */}
                  <div className="mb-6">
                    <p className="text-xs font-medium text-gray-600 mb-2">Or add a custom domain:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.newDomain}
                        onChange={(e) => setFormData({ ...formData, newDomain: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDomain())}
                        placeholder="e.g., Blockchain Development"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        onClick={handleAddDomain}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Selected Domains */}
                  {formData.domains.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-3">Your expertise areas:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.domains.map((domain) => (
                          <div
                            key={domain}
                            className="flex items-center gap-2 px-3 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium"
                          >
                            {domain}
                            <button
                              onClick={() => handleRemoveDomain(domain)}
                              className="text-teal-600 hover:text-teal-800 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                  step === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Back
              </button>

              {step < 3 ? (
                <button
                  onClick={() => {
                    if (step === 1 && formData.essay.trim().split(/\s+/).filter(w => w.length > 0).length < 100) {
                      setError('Please write at least 100 words for your essay');
                      return;
                    }
                    if (step === 2 && formData.selectedProjects.length === 0) {
                      setError('Please select at least one project');
                      return;
                    }
                    setError(null);
                    setStep(step + 1);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-700 hover:brightness-110 text-white rounded-lg font-medium transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-700 hover:brightness-110 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 text-center mt-6">
              By submitting this application, you agree to our Mentor Code of Conduct. Our team will review your application within 3-5 business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}