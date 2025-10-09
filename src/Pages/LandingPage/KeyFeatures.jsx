import { ChevronRight, Briefcase, GlobeLock } from 'lucide-react';

export default function FeaturesSection() {
  return (
    <section className="bg-white">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="bg-blue-900 text-white py-6 sm:py-8 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              Key features that drive your success
            </h2>
            <p className="text-sm sm:text-base text-blue-100 font-semibold">
              Discover tools and resources designed to accelerate your professional growth
            </p>
          </div>
        </div>

        <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-15">
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10">
          {/* Feature Card 1 */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xl hover:shadow-md transition-shadow">
            <div className="px-5 py-5">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Projects
            </h3>
            <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
              Collaborate and work ideas into real-world ventures
            </h4>
            <p className="text-sm text-black mb-4">
              Join discussions, share insights, and connect with peers to transform ideas into actionable projects.
            </p>
            <button className='flex flex-row mb-4'>
              Explore <ChevronRight />
            </button>
            </div>
            <img 
              src="/assets/ProjectsCard.png" 
              alt="Forum collaboration" 
              className="w-full h-32 sm:h-50 object-cover rounded-md"
            />
          </div>
          {/* Feature Card 2 */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xl hover:shadow-md transition-shadow">
            <div className="px-5 py-5">
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Careers
              </h3>
              <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
                Transform academic ideas into real-world ventures
              </h4>
              <p className="text-sm text-black mb-4">
                Get personalized career advice and strategic networking opportunities.
              </p>
              <button className="flex flex-row mb-4">
                Explore <ChevronRight />
              </button>
            </div>
            <img 
              src="/assets/CareersCard.png" 
              alt="Classes and learning" 
              className="w-full h-32 sm:h-50 object-cover rounded-md"
            />
          </div>
  
          {/* Feature Card 3 */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xl hover:shadow-md transition-shadow">
            <div className="px-5 py-5">
              <h3 className="text-base font-bold text-gray-900 mb-2">
                StartUps
              </h3>
              <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
                Launch and grow your entrepreneurial ideas
              </h4>
              <p className="text-sm text-black mb-4">
                Participate in hackathons and competitions to build and showcase your innovative solutions.
              </p>
              <button className="flex flex-row mb-4">
                Explore <ChevronRight />
              </button>
            </div>
            <img 
              src="/assets/StartUpsCard.png" 
              alt="Hackathon and innovation" 
              className="w-full h-32 sm:h-50 object-cover rounded-md"
            />
          </div>
        </div>

        {/* Bottom Section - Large Card and Small Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Large Feature Card */}
          <div className="lg:col-span-2 bg-black/10 text-white rounded-lg p-6 sm:p-8 relative overflow-hidden">
            <div className="relative z-10">
              <p className='text-white font-semibold'></p>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
                Benefits that transform your potential
              </h3>
              <p className="text-sm sm:text-base text-gray-300 mb-6 max-w-xl">
              Transform your skills and knowledge into impactful outcomes through structured learning, mentorship, and hands-on projects
              </p>
              <button className="text-white flex flex-row justifiy-center rounded-md transition-colors font-semibold">
                Explore Communities <ChevronRight />
              </button>
            </div>
            <img 
              src="/assets/Rectangle(2).png" 
              alt="Benefits background" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Small Cards Column */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Mentorship Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 text-center justify-center items-center flex">
                <Briefcase className="w-10 h-10 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                Mentorship program
              </h3>
              <p className="text-sm text-black mb-4 text-center font-medium">
                Get guidance and support from experienced professionals
              </p>
              <div className="flex justify-center">
                <button className="text-black font-semibold hover:text-blue-700 transition-colors">
                  Discover
                </button>
              </div>
            </div>
            {/* Resource Hub Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 text-center justify-center items-center flex">
                <GlobeLock className="w-10 h-10 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                Resource Hub
              </h3>
              <p className="text-sm text-black mb-4 text-center font-medium">
                Access tools and materials to accelerate your learning
              </p>
              <div className="flex justify-center">
                <button className="text-black font-semibold hover:text-blue-700 transition-colors">
                  Access
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}