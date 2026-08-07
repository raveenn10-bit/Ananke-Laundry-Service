'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingId('AL' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
      setShowSuccess(true);
    }, 1500);
  };

  return (
    <section id="booking" className="py-20 md:py-28 bg-white relative">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-dark mb-4">Schedule Your Pickup</h2>
          <p className="text-gray-600">Fill out the form below to book your laundry pickup. We'll confirm your request shortly.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-cream rounded-3xl p-6 md:p-10 shadow-sm"
        >
          {showSuccess ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-dark mb-2">Booking Requested!</h3>
              <p className="text-gray-600 mb-6">Your booking reference is <strong className="text-olive">{bookingId}</strong>.</p>
              <p className="text-gray-600 mb-8">We will contact you shortly to confirm the pickup time.</p>
              <button onClick={() => setShowSuccess(false)} className="bg-olive hover:bg-accent text-white px-8 py-3 rounded-full font-medium transition-colors">
                Book Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input required type="text" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input required type="tel" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all" placeholder="+94 XX XXX XXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                  <input type="tel" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all" placeholder="Same as phone" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all" placeholder="john@example.com" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address *</label>
                  <textarea required rows={2} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all resize-none" placeholder="Full address including landmarks" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Type *</label>
                  <select required className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all bg-white">
                    <option value="">Select a service</option>
                    <option value="wash-fold">Wash & Fold</option>
                    <option value="dry-cleaning">Dry Cleaning</option>
                    <option value="ironing">Ironing Only</option>
                    <option value="bedding">Bedding & Linen</option>
                    <option value="mixed">Mixed Services</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Quantity</label>
                  <select className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all bg-white">
                    <option value="small">Small (1-2 kg)</option>
                    <option value="medium">Medium (3-5 kg)</option>
                    <option value="large">Large (5-10 kg)</option>
                    <option value="xl">Extra Large (10+ kg)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Pickup Date *</label>
                  <input required type="date" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                  <input required type="time" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                  <textarea rows={2} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all resize-none" placeholder="Stains, fabric care notes, etc." />
                </div>
                <div className="md:col-span-2 flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-olive rounded" />
                    <span className="text-sm font-medium text-gray-700">Delivery Required</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-olive rounded" />
                    <span className="text-sm font-medium text-gray-700">Express Service (24h)</span>
                  </label>
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full bg-olive hover:bg-accent text-white py-4 rounded-full font-bold text-lg transition-colors flex items-center justify-center">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Processing...
                    </span>
                  ) : 'Book Pickup'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
