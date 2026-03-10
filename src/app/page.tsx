'use client';

import Hero from '@/components/landing/Hero';
import BusinessSearch from '@/components/landing/BusinessSearch';
import FeaturedBusinesses from '@/components/landing/FeaturedBusinesses';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <BusinessSearch />
        <div className="py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <FeaturedBusinesses />
        </div>
        
        {/* Testimonials section */}
        <section className="py-16 bg-primary/5 dark:bg-primary/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light font-medium text-sm mb-4"
              >
                Testimonials
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-bold text-gray-900 dark:text-white"
              >
                What People <span className="text-primary dark:text-secondary">Say</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-4 text-xl text-gray-600 dark:text-gray-300"
              >
                Don't just take our word for it
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "Finding quality service providers has never been easier. This platform transformed how I connect with local businesses.",
                  author: "Sarah Johnson",
                  role: "Customer"
                },
                {
                  quote: "Since registering my business here, I've seen a 40% increase in new customer inquiries. The platform is intuitive and effective.",
                  author: "Michael Chen",
                  role: "Business Owner"
                },
                {
                  quote: "The verification process gives me confidence that I'm working with legitimate businesses. Highly recommended!",
                  author: "Emma Rodriguez",
                  role: "Customer"
                }
              ].map((testimonial, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 dark:bg-secondary/20 flex items-center justify-center">
                      <span className="text-primary dark:text-secondary text-xl font-bold">{testimonial.author.charAt(0)}</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{testimonial.author}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.quote}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-primary-dark dark:from-gray-800 dark:to-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-6"
            >
              Ready to <span className="text-secondary dark:text-secondary">Connect</span>?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl mb-8 max-w-2xl mx-auto text-gray-100 dark:text-gray-300"
            >
              Join thousands of businesses and customers already using our platform
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a 
                href="/business-create" 
                className="bg-secondary text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-secondary-light transition-colors shadow-md hover:shadow-lg"
              >
                Register Your Business
              </a>
              <a 
                href="/search" 
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Find Services
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
