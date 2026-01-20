import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <div className="bg-blue-900 py-8 text-white sm:py-10 px-6 sm:pl-12 sm:pr-0 mb-12 sm:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left Side - Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="flex flex-col justify-center"
            >
              <h3 className="text-sm font-semibold mb-2 text-blue-200 uppercase tracking-wider">Impact</h3>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Our community's success in numbers
              </h2>
              <p className="text-base sm:text-lg text-blue-100 mb-8 max-w-lg">
                Real outcomes that showcase the power of collaboration, mentorship, and hands-on learning.
              </p>
              <div>
                <button className="text-white font-semibold underline decoration-blue-400 underline-offset-4 hover:text-blue-200 transition-colors">
                  View full report →
                </button>
              </div>
            </motion.div>

            {/* Right Side - Stats Grid */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-8 sm:gap-12 py-4"
            >
              <div className='flex flex-col items-center sm:items-start'>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">75%</div>
                <p className="text-sm sm:text-base text-blue-200 font-medium">Success Rate</p>
              </div>
              <div className='flex flex-col items-center sm:items-start'>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">60%</div>
                <p className="text-sm sm:text-base text-blue-200 font-medium">Engagement</p>
              </div>
              <div className='flex flex-col items-center sm:items-start'>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">85%</div>
                <p className="text-sm sm:text-base text-blue-200 font-medium">Satisfaction</p>
              </div>
              <div className='flex flex-col items-center sm:items-start'>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">90%</div>
                <p className="text-sm sm:text-base text-blue-200 font-medium">Retention</p>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-20">
          {/* Testimonials Section */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Loved by Community Builders
              </h2>
              <p className="text-sm sm:text-base text-black max-w-2xl mx-auto">
                Join over 10,000 satisfied members building their communities and transforming ideas into impactful projects
              </p>
            </motion.div>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
              >
                {/* Star Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating
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
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}