import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function InfoModal({ isOpen, onClose, title, content, image }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    ></motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header / Image */}
                        <div className="relative h-48 sm:h-64 flex-shrink-0">
                            {image ? (
                                <img
                                    src={image}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-blue-900 flex items-center justify-center">
                                    <h3 className="text-3xl font-bold text-white/20 uppercase tracking-widest">{title}</h3>
                                </div>
                            )}

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 sm:p-8 overflow-y-auto">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                {title}
                            </h2>

                            <div className="prose prose-blue max-w-none text-gray-600">
                                {typeof content === 'string' ? (
                                    <p>{content}</p>
                                ) : (
                                    content
                                )}
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
