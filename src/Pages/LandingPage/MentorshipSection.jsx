import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Target, TrendingUp, CheckCircle } from 'lucide-react';

export default function MentorshipSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-100px" });

    return (
        <section id="mentorship" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        ref={ref}
                        initial={{ opacity: 0, x: -50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Accelerate Your Career with Expert Mentorship
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Get personalized guidance from industry veterans who have walked the path you're on. Our mentorship program matches you with the right mentor to help you achieve your goals.
                        </p>

                        <div className="space-y-4">
                            {[
                                "One-on-one guidance sessions",
                                "Career roadmap planning",
                                "Skill assessment and development",
                                "Industry insights and networking"
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 font-medium">{item}</span>
                                </div>
                            ))}
                        </div>

                        <button className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                            Find a Mentor
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gray-100 relative">
                            {/* Placeholder until real image is available, using a solid color or pattern would be better but simple div here */}
                            <div className="absolute inset-0 bg-blue-900/5 flex items-center justify-center">
                                <Target className="w-32 h-32 text-blue-200" />
                            </div>
                            <img
                                src="/assets/Mentorship.jpg"
                                alt="Mentorship session"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none' }}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
