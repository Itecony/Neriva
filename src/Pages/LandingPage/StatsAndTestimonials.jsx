import { Star } from 'lucide-react';

export default function CommunityStatsSection() {
  const testimonials = [
    {
      name: "Oluwaseun Ojo",
      role: "Developer",
      location: "Abuja",
      image: "/assets/Image.png",
      text: "The community has been invaluable for my career development. The collaborative environment and access to real-world projects have accelerated my professional growth. The real time messaging has helped my team be more efficient in communication.",
      rating: 5
    },
    {
      name: "Michael Eze",
      role: "Designer",
      location: "Lagos",
      image: "/assets/Image(1).png",
      text: "I've learned more in the past month than I've ever could in my life. The engagement level is incredible and everyone here is wonderful.",
      rating: 5
    },
    {
      name: "Esosa Okwuosa",
      role: "Engineer",
      location: "PH",
      image: "/assets/Image(2).png",
      text: "The mentorship and resources available here have been crucial to my growth.",
      rating: 4
    }
  ];

  return (
    <section className="bg-white">
      <div className="w-full">
        {/* Stats Section */}
        <div className="bg-blue-900 text-white sm:py-7 pl-12 mb-12 sm:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 space-x-15">
            {/* Left Side - Text */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Impact</h3>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                Our community's success in numbers
              </h2>
              <p className="text-sm sm:text-base text-blue-100 mb-6">
                Real outcomes that showcase the power of collaboration, mentorship, and hands-on learning
              </p>
              <button className="text-white underline hover:text-blue-100 transition-colors">
                View More →
              </button>
            </div>

            {/* Right Side - Stats Grid */}
            <div className="grid grid-cols-2 gap-6 space-x-14">
              <div className='w-full flex flex-col justify-center items-center'>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">75%</div>
                <p className="text-sm text-blue-100">Success Rate</p>
              </div>
              <div className='w-full flex flex-col justify-center items-center'>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">60%</div>
                <p className="text-sm text-blue-100">Engagement</p>
              </div>
              <div className='w-full flex flex-col justify-center items-center'>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">85%</div>
                <p className="text-sm text-blue-100">Satisfaction</p>
              </div>
              <div className='w-full flex flex-col justify-center items-center'>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">90%</div>
                <p className="text-sm text-blue-100">Retention</p>
              </div>
            </div>
          </div>
        </div>
        <div className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-20">
        {/* Testimonials Section */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by Community Builders
          </h2>
          <p className="text-sm sm:text-base text-black max-w-2xl mx-auto">
            Join over 10,000 satisfied members building their communities and transforming ideas into impactful projects
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
            >
              {/* Star Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating 
                        ? 'fill-yellow-400 stroke-yellow-500' 
                        : 'fill-none stroke-gray-300'
                    }`}
                    strokeWidth={2}
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-base text-black mb-6 leading-relaxed">
                {testimonial.text}
              </p>

              {/* User Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-auto">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-black">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-black">
                    {testimonial.role} • {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </section>
  );
}