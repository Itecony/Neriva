import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Code, BookOpen, Download, ArrowRight } from 'lucide-react';
import InfoModal from './InfoModal';

export default function ResourcesSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-100px" });
    const [selectedResource, setSelectedResource] = useState(null);

    const resources = [
        {
            category: "Tools",
            title: "Developer Toolkit",
            description: "Essential libraries, frameworks, and utilities to speed up your development process.",
            icon: <Code className="w-6 h-6 text-purple-600" />,
            color: "bg-purple-50",
            modalContent: (
                <div className="space-y-4">
                    <p>
                        Streamline your workflow with our curated collection of developer tools. We've gathered the most effective utilities to increase your productivity.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>IDE Plugins:</strong> Configurations for VS Code and IntelliJ to match our coding standards.</li>
                        <li><strong>Debugging Utilities:</strong> Advanced tools to profile and debug your applications.</li>
                        <li><strong>Deployment Scripts:</strong> CI/CD templates for major cloud providers.</li>
                        <li><strong>API Testers:</strong> Pre-configured collections for testing our public APIs.</li>
                    </ul>
                </div>
            )
        },
        {
            category: "Education",
            title: "Learning Hub",
            description: "Curated courses, tutorials, and articles covering the latest trends and technologies.",
            icon: <BookOpen className="w-6 h-6 text-orange-600" />,
            color: "bg-orange-50",
            modalContent: (
                <div className="space-y-4">
                    <p>
                        Stay ahead of the curve with our comprehensive learning resources. Whether you're a beginner or an expert, there's always something new to learn.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Video Tutorials:</strong> Step-by-step guides on building complex features.</li>
                        <li><strong>Interactive Challenges:</strong> Hands-on coding problems to test your skills.</li>
                        <li><strong>Tech Talks:</strong> Recordings of seminars from industry leaders.</li>
                        <li><strong>Certification Prep:</strong> Materials to help you ace your next technical certification.</li>
                    </ul>
                </div>
            )
        },
        {
            category: "Assets",
            title: "Digital Assets",
            description: "High-quality templates, UI kits, and graphics ready to use in your next project.",
            icon: <Download className="w-6 h-6 text-green-600" />,
            color: "bg-green-50",
            modalContent: (
                <div className="space-y-4">
                    <p>
                        Accelerate your development with professional-grade assets. Don't reinvent the wheel—use our verified components and designs.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>UI Kits:</strong> Figma and Sketch files for our design system.</li>
                        <li><strong>Icon Sets:</strong> Specialized icons for tech and business applications.</li>
                        <li><strong>Stock Photos:</strong> extensive library of royalty-free images.</li>
                        <li><strong>Code Templates:</strong> Boilerplate code for React, Vue, and Angular projects.</li>
                    </ul>
                </div>
            )
        }
    ];

    return (
        <section id="resources" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-2xl"
                    >
                        <span className="text-blue-600 font-semibold tracking-wide uppercase text-sm">Resource Library</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                            Everything You Need to Succeed
                        </h2>
                    </motion.div>
                    <motion.a
                        href="/dreamboard/resources"
                        initial={{ opacity: 0, x: 20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                        transition={{ duration: 0.5 }}
                        className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors mt-4 md:mt-0"
                    >
                        View All Resources <ArrowRight className="w-4 h-4" />
                    </motion.a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {resources.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 bg-white"
                        >
                            <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-600 mb-4 line-clamp-2">
                                {item.description}
                            </p>
                            <button
                                onClick={() => setSelectedResource(item)}
                                className="inline-flex items-center text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors"
                            >
                                Learn more <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <a href="/dreamboard/resources" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                        View All Resources <ArrowRight className="w-4 h-4" />
                    </a>
                </div>

                <InfoModal
                    isOpen={!!selectedResource}
                    onClose={() => setSelectedResource(null)}
                    title={selectedResource?.title}
                    content={selectedResource?.modalContent}
                />
            </div>
        </section>
    );
}
