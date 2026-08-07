'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Navigation, MessageCircle } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 max-w-6xl mx-auto">
          
          {/* Info Column */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-5/12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-dark mb-6">Get In Touch</h2>
            <p className="text-gray-600 mb-8">Have a question or need to schedule a pickup? Reach out to us through any of the channels below.</p>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-cream p-3 rounded-full text-olive shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-dark mb-1">Our Location</h4>
                  <p className="text-gray-600">195/2, Matara Road,<br />Unawatuna, Sri Lanka</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-cream p-3 rounded-full text-olive shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-dark mb-1">Phone Number</h4>
                  <a href="tel:+94742697909" className="text-gray-600 hover:text-accent transition-colors">+94 74 269 7909</a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-cream p-3 rounded-full text-olive shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-dark mb-1">Email Address</h4>
                  <a href="mailto:chinthaka.ananke@gmail.com" className="text-gray-600 hover:text-accent transition-colors">chinthaka.ananke@gmail.com</a>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <a href="tel:+94742697909" className="flex items-center gap-2 bg-dark text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-colors">
                <Phone className="w-4 h-4" /> Call Now
              </a>
              <a href="https://wa.me/94742697909" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-green-600 transition-colors">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <a href="https://maps.app.goo.gl/7FCjn432AeM9KkXDA?g_st=ic" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors">
                <Navigation className="w-4 h-4" /> Get Directions
              </a>
            </div>
          </motion.div>

          {/* Form / Map Column */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-7/12"
          >
            <div className="bg-cream rounded-3xl p-6 md:p-8">
              <h3 className="text-2xl font-bold text-dark mb-6">Send a Message</h3>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input required type="text" placeholder="Your Name" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all" />
                  </div>
                  <div>
                    <input required type="email" placeholder="Your Email" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input type="tel" placeholder="Phone Number" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all" />
                  </div>
                  <div>
                    <select className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all bg-white text-gray-500">
                      <option value="">Subject</option>
                      <option value="inquiry">General Inquiry</option>
                      <option value="support">Support</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                </div>
                <div>
                  <textarea required rows={4} placeholder="Your Message" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all resize-none" />
                </div>
                <button type="submit" className="bg-olive hover:bg-accent text-white px-8 py-3 rounded-full font-medium transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
