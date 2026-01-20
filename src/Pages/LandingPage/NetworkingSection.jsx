import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, MessageCircle, Calendar } from 'lucide-react';

export default function NetworkingSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-100px" });

    const features = [
        {
            icon: <Users className="w-6 h-6 text-blue-600" />,
            title: "Community Forums",
            description: "Connect with like-minded professionals, ask questions, and share your expertise in our active forums."
        },
        {
            icon: <MessageCircle className="w-6 h-6 text-blue-600" />,
            title: "Direct Messaging",
            description: "Build meaningful connections through one-on-one conversations with peers and mentors."
        },
        {
            icon: <Calendar className="w-6 h-6 text-blue-600" />,
            title: "Virtual Events",
            description: "Participate in webinars, workshops, and networking mixers designed to expand your professional circle."
        }
    ];

    return (
        <section id="networking" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                    >
                        Connect & Grow Together
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl text-gray-600 max-w-2xl mx-auto"
                    >
                        Join a vibrant community of innovators and creators. Build your network and unlock new opportunities.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
