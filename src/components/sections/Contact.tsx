'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Send,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Please enter your contact name'),
  businessName: z.string().optional(),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  propertyType: z.enum([
    'Hotel',
    'Resort',
    'Villa',
    'Guest House',
    'Restaurant',
    'Spa',
    'Airbnb / Holiday Rental',
    'Individual / Residential',
    'Other',
  ]).optional(),
  serviceRequired: z.string().min(1, 'Please select a service'),
  laundryType: z.string().optional(),
  laundryVolume: z.string().optional(),
  frequency: z.enum([
    'One-time',
    'Daily',
    'Weekly',
    'Multiple times per week',
    'Monthly',
    'Custom',
  ]).optional(),
  address: z.string().optional(),
  message: z.string().min(5, 'Please enter your requirements or questions'),
  botField: z.string().max(0, 'Spam detected').optional(), // Honeypot field
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const [formMode, setFormMode] = useState<'commercial' | 'individual'>('commercial');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      businessName: '',
      phone: '',
      email: '',
      propertyType: 'Hotel',
      serviceRequired: 'Commercial Laundry Solutions',
      laundryType: 'Bed Linen (Sheets & Pillowcases)',
      laundryVolume: 'Weekly Hospitality Volume (50+ kg)',
      frequency: 'Weekly',
      address: '',
      message: '',
      botField: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    if (data.botField) return; // Honeypot triggered
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to submit quote request');
      }

      setSuccessMessage(
        resData.message ||
          'Thank you. Your laundry requirements have been received. Our team will review your request and contact you regarding a quotation.'
      );
      setIsSuccess(true);
      reset();
    } catch (err: any) {
      setSubmitError(
        err?.message ||
          'Unable to submit your quote request at this moment. Please call our Unawatuna facility directly at 091 225 0777.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-white relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-olive font-semibold tracking-wider text-xs sm:text-sm uppercase mb-3 block">
            CONTACT &amp; INQUIRIES
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-dark font-heading mb-4">
            Request a Quote or <span className="italic text-olive font-normal">Contact Us</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed font-body">
            Get in touch for individual laundry care, hospitality linen management, or visit our Unawatuna facility.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 max-w-6xl mx-auto items-start">
          {/* Verified Business Details & Operating Hours */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-5/12 flex flex-col gap-6"
          >
            <div className="bg-cream rounded-3xl p-6 sm:p-8 border border-cream-dark shadow-sm">
              <span className="text-olive font-bold text-xs uppercase tracking-widest block mb-1">
                Verified Business Location
              </span>
              <h3 className="font-heading text-2xl font-bold text-dark mb-1">Ananke Laundry</h3>
              <p className="text-xs text-gray-500 mb-6">ANANKE LAUNDRY (PVT) LTD &bull; Cleanline Network</p>

              <div className="space-y-5 text-sm sm:text-base">
                <div className="flex items-start gap-3.5">
                  <div className="bg-white p-2.5 rounded-xl text-olive shadow-sm shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark text-sm mb-0.5">Address</h4>
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                      No. 195/2, Matara Road,<br />
                      Unawatuna, Galle,<br />
                      Sri Lanka
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1 font-mono">Plus Code: 268X+XPP, Unawatuna</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="bg-white p-2.5 rounded-xl text-olive shadow-sm shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark text-sm mb-0.5">Telephone</h4>
                    <a
                      href="tel:+94912250777"
                      className="text-olive hover:text-accent font-semibold transition-colors block text-sm sm:text-base"
                    >
                      091 225 0777
                    </a>
                    <span className="text-xs text-gray-500">Landline: +94 91 225 0777</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="bg-[#25D366]/15 p-2.5 rounded-xl text-[#25D366] shadow-sm shrink-0 mt-0.5">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.952 3.71 1.453 5.711 1.454h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark text-sm mb-0.5">WhatsApp</h4>
                    <a
                      href="https://wa.me/94742697909?text=Hello%20Ananke%20Laundry%2C%20I%20would%20like%20to%20inquire%20about%20your%20services."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#25D366] hover:underline font-semibold transition-colors block text-sm sm:text-base"
                    >
                      074 269 7909
                    </a>
                    <span className="text-xs text-gray-500">Direct Chat: +94 74 269 7909</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 shadow-sm shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark text-sm mb-0.5">Email</h4>
                    <a
                      href="mailto:chinthaka.ananke@gmail.com"
                      className="text-blue-600 hover:underline font-semibold transition-colors block text-sm sm:text-base"
                    >
                      chinthaka.ananke@gmail.com
                    </a>
                    <span className="text-xs text-gray-500">General inquiries & quotations</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="bg-white p-2.5 rounded-xl text-olive shadow-sm shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="w-full">
                    <h4 className="font-semibold text-dark text-sm mb-2">Opening Hours</h4>
                    <div className="space-y-1.5 text-xs sm:text-sm text-gray-700 border-t border-gray-200/60 pt-2">
                      <div className="flex justify-between">
                        <span>Monday:</span>
                        <span className="font-medium">9:00 AM – 5:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tuesday – Friday:</span>
                        <span className="font-medium">9:00 AM – 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday – Sunday:</span>
                        <span className="font-medium">9:00 AM – 5:00 PM</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2 italic leading-normal">
                      * Opening hours may vary on public holidays. Please contact us before visiting.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200/80 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <a
                  href="tel:+94912250777"
                  className="bg-primary hover:bg-olive text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm text-center"
                >
                  <Phone size={14} className="text-accent" /> Call Now
                </a>
                <a
                  href="https://wa.me/94742697909?text=Hello%20Ananke%20Laundry%2C%20I%20would%20like%20to%20inquire%20about%20your%20services."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20ba5a] text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm text-center"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.952 3.71 1.453 5.711 1.454h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg> WhatsApp
                </a>
                <a
                  href="https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-dark px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm text-center"
                >
                  <Navigation size={14} className="text-olive" /> Directions
                </a>
              </div>
            </div>
          </motion.div>

          {/* Form Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-7/12"
          >
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xl relative">
              {/* Form Mode Selector */}
              <div className="flex bg-cream p-1.5 rounded-2xl mb-6 border border-cream-dark">
                <button
                  type="button"
                  onClick={() => setFormMode('commercial')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    formMode === 'commercial'
                      ? 'bg-olive text-white shadow-sm'
                      : 'text-gray-600 hover:text-dark'
                  }`}
                >
                  <Building size={16} />
                  <span>Commercial &amp; Hospitality</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormMode('individual')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    formMode === 'individual'
                      ? 'bg-olive text-white shadow-sm'
                      : 'text-gray-600 hover:text-dark'
                  }`}
                >
                  <span>Individual Care</span>
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold font-heading text-dark mb-1">
                  {formMode === 'commercial' ? 'Commercial Laundry Quotation' : 'Request Laundry Service'}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {formMode === 'commercial'
                    ? 'Tailored laundry & linen management contracts for hotels, villas, and restaurants across Southern Sri Lanka.'
                    : 'Professional washing, pressing, and dry cleaning in Unawatuna. Submit your requirements below.'}
                </p>
              </div>

              {isSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 sm:p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="font-heading font-bold text-2xl text-dark mb-3">Enquiry Received</h4>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-6 max-w-md mx-auto">
                    {successMessage}
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="bg-olive hover:bg-accent hover:text-dark text-white px-8 py-3 rounded-full text-sm font-bold transition-all shadow-md"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Honeypot Spam Protection (hidden) */}
                  <input
                    type="text"
                    {...register('botField')}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        {formMode === 'commercial' ? 'Contact Person *' : 'Your Name *'}
                      </label>
                      <input
                        type="text"
                        {...register('name')}
                        placeholder="e.g. John Perera"
                        className={`w-full rounded-xl border px-4 py-3 text-base focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all ${
                          errors.name ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                        }`}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        {formMode === 'commercial' ? 'Business / Hotel Name *' : 'Business Name (Optional)'}
                      </label>
                      <input
                        type="text"
                        {...register('businessName')}
                        placeholder={formMode === 'commercial' ? 'e.g. Unawatuna Bay Resort' : 'e.g. Villa or Residence'}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        inputMode="tel"
                        {...register('phone')}
                        placeholder="07X XXX XXXX / 091 XXX XXXX"
                        className={`w-full rounded-xl border px-4 py-3 text-base focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all ${
                          errors.phone ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        inputMode="email"
                        {...register('email')}
                        placeholder="contact@hotel.com"
                        className={`w-full rounded-xl border px-4 py-3 text-base focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all ${
                          errors.email ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Commercial-Specific Row: Property Type & Service Frequency */}
                  {formMode === 'commercial' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Property Type
                        </label>
                        <select
                          {...register('propertyType')}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all bg-white text-gray-700"
                        >
                          <option value="Hotel">Hotel</option>
                          <option value="Resort">Resort</option>
                          <option value="Villa">Boutique Villa</option>
                          <option value="Guest House">Guest House</option>
                          <option value="Restaurant">Restaurant / Bar</option>
                          <option value="Spa">Spa &amp; Wellness</option>
                          <option value="Airbnb / Holiday Rental">Airbnb / Holiday Rental</option>
                          <option value="Other">Other Business</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Service Frequency
                        </label>
                        <select
                          {...register('frequency')}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all bg-white text-gray-700"
                        >
                          <option value="Daily">Daily Turnaround</option>
                          <option value="Multiple times per week">Multiple Times per Week</option>
                          <option value="Weekly">Weekly Scheduled</option>
                          <option value="Monthly">Monthly Billing Contract</option>
                          <option value="One-time">One-time Commercial Load</option>
                          <option value="Custom">Custom Schedule</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Service Selection & Volume */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Service Required *
                      </label>
                      <select
                        {...register('serviceRequired')}
                        className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all bg-white ${
                          errors.serviceRequired ? 'border-red-400 bg-red-50/30' : 'border-gray-200 text-gray-700'
                        }`}
                      >
                        <option value="">Select service</option>
                        <option value="Commercial Laundry Solutions">Commercial Laundry Solutions</option>
                        <option value="Linen Management">Linen Management</option>
                        <option value="Professional Washing">Professional Washing</option>
                        <option value="Pressing">Pressing &amp; Steam Ironing</option>
                        <option value="Dry Cleaning">Dry Cleaning</option>
                        <option value="Stain Removal">Stain Removal Treatment</option>
                        <option value="Linen Care">Linen Care (Bed &amp; Bath)</option>
                      </select>
                      {errors.serviceRequired && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.serviceRequired.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        {formMode === 'commercial' ? 'Linen / Laundry Types' : 'Estimated Volume'}
                      </label>
                      {formMode === 'commercial' ? (
                        <select
                          {...register('laundryType')}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all bg-white text-gray-700"
                        >
                          <option value="Bed Linen (Sheets & Pillowcases)">Bed Linen (Sheets &amp; Pillowcases)</option>
                          <option value="Bath Towels & Mats">Bath &amp; Pool Towels</option>
                          <option value="Dining Table Linen & Napkins">Dining Linen &amp; Napkins</option>
                          <option value="Staff Uniforms">Staff Uniforms &amp; Aprons</option>
                          <option value="Mixed Hospitality Linen">Mixed Hospitality Linen</option>
                          <option value="Curtains & Upholstery">Curtains &amp; Upholstery</option>
                        </select>
                      ) : (
                        <select
                          {...register('laundryVolume')}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all bg-white text-gray-700"
                        >
                          <option value="Individual Garments (< 10 kg)">Small Load (&lt; 10 kg)</option>
                          <option value="Medium Load (10-25 kg)">Medium Load (10-25 kg)</option>
                          <option value="Large Household (25-50 kg)">Large Load (25-50 kg)</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Commercial Volume & Address */}
                  {formMode === 'commercial' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Estimated Volume / Batch
                        </label>
                        <select
                          {...register('laundryVolume')}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all bg-white text-gray-700"
                        >
                          <option value="Small Commercial / Airbnb (10-50 kg)">Small Commercial / Airbnb (10-50 kg)</option>
                          <option value="Weekly Hospitality Volume (50-100 kg)">Weekly Volume (50-100 kg)</option>
                          <option value="High Commercial Volume (100+ kg)">High Commercial Volume (100+ kg)</option>
                          <option value="Daily Bulk Contract (200+ kg)">Daily Bulk Contract (200+ kg)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Property Address / Location
                        </label>
                        <input
                          type="text"
                          {...register('address')}
                          placeholder="e.g. Yaddehimulla Road, Unawatuna"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Message / Specific Requirements *
                    </label>
                    <textarea
                      rows={formMode === 'commercial' ? 3 : 4}
                      {...register('message')}
                      placeholder={
                        formMode === 'commercial'
                          ? 'Please describe your room count, linen rotation requirements, or specific pickup preferences...'
                          : 'Please share details about fabrics, stain concerns, or special care requirements...'
                      }
                      className={`w-full rounded-xl border px-4 py-3 text-base focus:ring-2 focus:ring-olive/30 focus:border-olive outline-none transition-all resize-none ${
                        errors.message ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                      }`}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.message.message}
                      </p>
                    )}
                  </div>

                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-accent hover:bg-olive hover:text-white text-dark font-bold py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2 text-dark">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting Laundry Requirements...
                      </span>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>{formMode === 'commercial' ? 'Request Commercial Quote' : 'Request a Quote'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
