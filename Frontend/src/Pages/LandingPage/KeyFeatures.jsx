import { ChevronRight, Briefcase, GlobeLock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import InfoModal from './InfoModal';

// Feature Card Component
function FeatureCard({ title, heading, description, buttonText, image, imageAlt, index, onExplore }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white border border-gray-200 rounded-lg shadow-2xl hover:shadow-md transition-shadow flex flex-col cursor-pointer"
      onClick={onExplore}
    >
      <div className="px-5 py-5 flex-grow">
        <h3 className="text-base font-bold text-gray-900 mb-2">
          {title}
        </h3>
        <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
          {heading}
        </h4>
        <p className="text-sm text-black mb-4">
          {description}
        </p>
        <button
          className='flex flex-row mb-4 items-center hover:text-blue-700 transition-colors'
          onClick={(e) => {
            e.stopPropagation();
            onExplore();
          }}
        >
          {buttonText} <ChevronRight />
        </button>
      </div>
      <img
        src={image}
        alt={imageAlt}
        className="w-full h-32 sm:h-50 object-cover rounded-b-lg mt-auto"
      />
    </motion.div>
  );
}

export default function FeaturesSection() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Feature cards data
  const featureCards = [
    {
      title: "Projects",
      heading: "Collaborate and work ideas into real-world ventures",
      description: "Join discussions, share insights, and connect with peers to transform ideas into actionable projects.",
      buttonText: "Explore",
      image: "/assets/ProjectsCard.png",
      imageAlt: "Forum collaboration",
      modalContent: (
        <div className="space-y-4">
          <p>
            Connect with a diverse network of developers, designers, and innovators. Our project collaboration tools are designed to help you take an idea from concept to launch.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Team Formation:</strong> Find the perfect teammates based on skills and interests.</li>
            <li><strong>Project Management:</strong> Integrated tools to track tasks, milestones, and progress.</li>
            <li><strong>Version Control:</strong> Seamless integration with Git for code collaboration.</li>
            <li><strong>Showcase:</strong> Present your finished projects to the community and potential employers.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Careers",
      heading: "Transform academic ideas into real-world ventures",
      description: "Get personalized career advice and strategic networking opportunities.",
      buttonText: "Explore",
      image: "/assets/CareersCard.png",
      imageAlt: "Classes and learning",
      modalContent: (
        <div className="space-y-4">
          <p>
            Navigate your professional journey with confidence. Whether you're a student, a recent grad, or looking to switch careers, we provide the roadmap you need.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Personalized Roadmaps:</strong> Tailored paths based on your current skills and career goals.</li>
            <li><strong>Skill Assessments:</strong> Identify gaps and get recommendations for improvement.</li>
            <li><strong>Mentorship Matching:</strong> Connect with industry veterans for one-on-one guidance.</li>
            <li><strong>Exclusive Job Board:</strong> Access opportunities curated for our community members.</li>
          </ul>
        </div>
      )
    },
    {
      title: "StartUps",
      heading: "Launch and grow your entrepreneurial ideas",
      description: "Participate in hackathons and competitions to build and showcase your innovative solutions.",
      buttonText: "Explore",
      image: "/assets/StartUpsCard.png",
      imageAlt: "Hackathon and innovation",
      modalContent: (
        <div className="space-y-4">
          <p>
            Turn your innovative ideas into viable businesses. Our startup ecosystem provides the support structure you need to succeed in the competitive market.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Incubator Program:</strong> Structured guidance to validate and build your MVP.</li>
            <li><strong>Co-founder Matching:</strong> Find partners who share your vision and complementary skills.</li>
            <li><strong>Investor Access:</strong> Opportunities to pitch to angel investors and venture capitalists.</li>
            <li><strong>Legal & Marketing Resources:</strong> Templates and guides to handle the business side of things.</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <section className="bg-white">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="bg-blue-900 text-white py-6 sm:py-8 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                Key features that drive your success
              </h2>
              <p className="text-sm sm:text-base text-blue-100 font-semibold">
                Discover tools and resources designed to accelerate your professional growth
              </p>
            </motion.div>
          </div>
        </div>

        <div id="features" className="py-6 sm:py-8 px-4 sm:px-6 lg:px-16">
          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10">
            {featureCards.map((card, index) => (
              <FeatureCard
                key={index}
                index={index}
                title={card.title}
                heading={card.heading}
                description={card.description}
                buttonText={card.buttonText}
                image={card.image}
                imageAlt={card.imageAlt}
                onExplore={() => setSelectedFeature(card)}
              />
            ))}
          </div>

          <InfoModal
            isOpen={!!selectedFeature}
            onClose={() => setSelectedFeature(null)}
            title={selectedFeature?.title}
            content={selectedFeature?.modalContent}
            image={selectedFeature?.image}
          />

          {/* Large Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <div className="bg-black/10 text-white rounded-lg p-6 sm:p-8 relative overflow-hidden h-[400px]">
              <div className="relative z-10 h-full flex flex-col justify-center">
                <p className='text-white font-semibold'></p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
                  Benefits that transform your potential
                </h3>
                <p className="text-sm sm:text-base text-gray-300 mb-6 max-w-xl">
                  Transform your skills and knowledge into impactful outcomes through structured learning, mentorship, and hands-on projects
                </p>
                <div>
                  <button className="text-white flex flex-row items-center rounded-md transition-colors font-semibold hover:gap-2 duration-300">
                    Explore Communities <ChevronRight className="ml-1" />
                  </button>
                </div>
              </div>
              <img
                src="/assets/BenefitsBackground.png"
                alt="Benefits background"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}