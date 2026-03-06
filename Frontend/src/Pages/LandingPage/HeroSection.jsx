import LandingPageImage from "/assets/LandingPage.png";
import { motion } from "framer-motion";
import { useState } from "react";
import InfoModal from "./InfoModal";

export default function HeroSection() {
  const [showLearnMore, setShowLearnMore] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section
        className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-gray-900"
        style={{ backgroundImage: `url(${LandingPageImage})` }}
      >

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-opacity-60"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 max-w-4xl"
          >
            Bridging the gap between university and real life
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white text-sm sm:text-base md:text-lg mb-8 max-w-2xl"
          >
            Gain practical skills and experience through hands-on projects, mentorship, and community collaboration that prepare you for the workforce.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a href="/signup">
              <button className="bg-blue-900 font-semibold text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-blue-700 transition-color">
                Join now
              </button>
            </a>
            <button
              className="bg-white/10 border font-semibold text-blue-900 border-white text-shadow-blue-700 px-3 sm:px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={() => setShowLearnMore(true)}
            >
              Learn More
            </button>
          </motion.div>

          <InfoModal
            isOpen={showLearnMore}
            onClose={() => setShowLearnMore(false)}
            title="About Our Platform"
            content={
              <div className="space-y-4 text-left">
                <p>
                  We are bridging the gap between academic learning and professional success. Our platform provides a comprehensive ecosystem for students and early-career professionals to:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-bold text-blue-900">Collaboration</h4>
                    <p className="text-sm">Work on real-world projects with peers from around the globe.</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-bold text-blue-900">Mentorship</h4>
                    <p className="text-sm">Get guidance from experienced industry professionals.</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-bold text-blue-900">Skill Building</h4>
                    <p className="text-sm">Access curated resources and learning paths.</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-bold text-blue-900">Career Growth</h4>
                    <p className="text-sm">Find job opportunities and build a portfolio that stands out.</p>
                  </div>
                </div>
                <p className="mt-4">
                  Join us today and start building your future.
                </p>
              </div>
            }
          />
        </div>
      </section>

      {/* Your Journey Starts Here Section */}
      <section
        className="relative bg-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/vector.png')" }}
      >
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
            className="text-gray-900 text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
          >
            Your Journey Starts Here
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600 text-sm sm:text-base md:text-lg mb-8 max-w-2xl mx-auto"
          >
            Connect with a network of ambitious professionals and turn your academic potential into real-world success. Join communities, work on projects, and build your career.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a href="/login">
              <button className="bg-blue-900 text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-semibold">
                Login
              </button>
            </a>
            <a href="/signup">
              <button className="bg-gray-200 text-blue-900 px-3 sm:px-4 py-2 rounded-xl hover:bg-gray-300 transition-colors font-semibold">
                Sign Up
              </button>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}