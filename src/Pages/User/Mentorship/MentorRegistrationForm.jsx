import { useState } from 'react';
import { X, AlertCircle, CheckCircle, BookOpen, Target, Lightbulb, Briefcase } from 'lucide-react';

export default function MentorRegistrationForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    why_mentor: '',       // Will map to 'essay'
    teaching_style: '',   
    mentorship_goals: '', 
    domains: [],          // Will map to 'domains'
    newDomain: '',
    // ✅ NEW: Added Projects State
    projects: [],         // Will map to 'selected_projects'
    newProject: ''
  });

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  // ✅ NEW: Handlers for Projects
  const handleAddProject = () => {
    if (formData.newProject.trim()) {
      setFormData(prev => ({
        ...prev,
        projects: [...prev.projects, formData.newProject.trim()],
        newProject: ''
      }));
    }
  };

  const handleRemoveProject = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error("No 'authToken' found. Please log in.");

      // Validation
      if (!formData.why_mentor.trim()) throw new Error('Please complete the motivation section.');
      if (formData.domains.length === 0) throw new Error('Please select at least one area of expertise.');
      if (formData.projects.length === 0) throw new Error('Please list at least one project.');

      // ✅ FIX: Mapping data to match the Backend Error requirements exactly
      const payload = {
        essay: formData.why_mentor,             // Backend expects 'essay'
        domains: formData.domains,              // Backend expects 'domains'
        selected_projects: formData.projects,   // Backend expects 'selected_projects'
        
        // We still send these just in case, but 'essay' covers the main text
        teaching_style: formData.teaching_style,
        mentorship_goals: formData.mentorship_goals,
      };

      const response = await fetch(
        'https://itecony-neriva-backend.onrender.com/api/mentors/apply',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || resData.error || 'Submission failed');
      }

      setSuccess(true);
      setFormData({ 
        why_mentor: '', teaching_style: '', mentorship_goals: '', 
        domains: [], newDomain: '', projects: [], newProject: '' 
      });
      
      setTimeout(() => {
        setSuccess(false);
        setStep(1);
      }, 3000);

    } catch (err) {
      console.error('Submission Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (step / 3) * 100;
  const wordCount = (text) => text.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentor Application</h1>
          <p className="text-gray-600">Join our community of experts.</p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3 animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Application Submitted!</p>
              <p className="text-sm text-green-700">We will review your profile shortly.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Progress Bar */}
          <div className="h-1.5 bg-gray-100 w-full">
            <div className="h-full bg-teal-600 transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
          </div>

          {/* Steps */}
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between relative">
             {/* Simple visual steps */}
             {[1, 2, 3].map(num => (
               <div key={num} className={`flex flex-col items-center z-10 ${num <= step ? 'text-teal-600' : 'text-gray-400'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${num <= step ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-gray-300'}`}>
                   {num}
                 </div>
                 <span className="text-xs font-medium mt-1">
                   {num === 1 ? 'Essay' : num === 2 ? 'Details' : 'Projects'}
                 </span>
               </div>
             ))}
             <div className="absolute top-10 left-0 w-full h-0.5 bg-gray-200 -z-0" />
          </div>

          <div className="p-8">
            
            {/* Step 1: Essay */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Why do you want to mentor?</h2>
                  <p className="text-sm text-gray-500 mb-4">Share your motivation (This will be your application essay).</p>
                  <textarea
                    name="why_mentor"
                    value={formData.why_mentor}
                    onChange={handleChange}
                    placeholder="I want to mentor because..."
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    rows="8"
                  />
                  <div className="mt-2 text-right text-xs text-gray-500">{wordCount(formData.why_mentor)} words</div>
                </div>
              </div>
            )}

            {/* Step 2: Teaching Style & Goals */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Teaching Style</label>
                  <textarea
                    name="teaching_style"
                    value={formData.teaching_style}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Mentorship Goals</label>
                  <textarea
                    name="mentorship_goals"
                    value={formData.mentorship_goals}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    rows="3"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Domains & Projects */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in">
                
                {/* 1. Domains */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Expertise Domains</h2>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={formData.newDomain}
                      onChange={(e) => setFormData({ ...formData, newDomain: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDomain())}
                      placeholder="e.g. React, UX Design"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <button onClick={handleAddDomain} className="px-4 py-2 bg-gray-900 text-white rounded-xl">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.domains.map((d) => (
                      <span key={d} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-sm border border-teal-100 flex items-center gap-2">
                        {d} <button onClick={() => handleRemoveDomain(d)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. ✅ NEW: Projects Section */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Selected Projects</h2>
                  <p className="text-sm text-gray-500 mb-3">Add links or names of projects you have worked on.</p>
                  
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={formData.newProject}
                      onChange={(e) => setFormData({ ...formData, newProject: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProject())}
                      placeholder="e.g. github.com/my-app or 'E-commerce Platform'"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <button onClick={handleAddProject} className="px-4 py-2 bg-gray-900 text-white rounded-xl">Add</button>
                  </div>

                  <div className="space-y-2">
                    {formData.projects.length === 0 && <p className="text-sm text-gray-400 italic">No projects added yet.</p>}
                    {formData.projects.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm font-medium text-gray-700 truncate">{p}</span>
                        <button onClick={() => handleRemoveProject(idx)} className="text-gray-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium disabled:opacity-50"
              >
                Back
              </button>

              {step < 3 ? (
                <button
                  onClick={() => {
                     if(step===1 && !formData.why_mentor.trim()) return setError("Please fill out the essay.");
                     setError(null);
                     setStep(step + 1);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-70 flex justify-center"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}