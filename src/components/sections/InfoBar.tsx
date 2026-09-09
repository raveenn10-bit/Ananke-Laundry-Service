'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Phone, Building2, Clock } from 'lucide-react';

export default function InfoBar() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [slStatus, setSlStatus] = useState<string | null>(null);

  useEffect(() => {
    try {
      const now = new Date();
      // Format current day and hour in Sri Lanka (Asia/Colombo UTC+5:30)
      const dayFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Colombo',
        weekday: 'short',
      });
      const hourFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Colombo',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      });

      const day = dayFormatter.format(now);
      const [hStr, mStr] = hourFormatter.format(now).split(':');
      const currentMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);

      // Schedule:
      // Mon: 9:00 AM (540m) – 5:00 PM (1020m)
      // Tue-Fri: 9:00 AM (540m) – 6:00 PM (1080m)
      // Sat-Sun: 9:00 AM (540m) – 5:00 PM (1020m)
      const openMinutes = 9 * 60; // 540
      let closeMinutes = 17 * 60; // 1020
      if (['Tue', 'Wed', 'Thu', 'Fri'].includes(day)) {
        closeMinutes = 18 * 60; // 1080
      }

      if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
        setSlStatus('Open Now (Sri Lanka Time)');
      } else {
        setSlStatus('Opens at 9:00 AM');
      }
    } catch {
      // Fallback gracefully without throwing
      setSlStatus(null);
    }
  }, []);

  const infoItems = [
    {
      icon: MapPin,
      label: 'Facility Location',
      value: 'No. 195/2, Matara Road, Unawatuna',
      subtitle: '268X+XPP, Unawatuna, Galle',
      link: 'https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic',
    },
    {
      icon: Phone,
      label: 'Direct Inquiries',
      value: '091 225 0777',
      subtitle: 'Int: +94 91 225 0777',
      link: 'tel:+94912250777',
    },
    {
      icon: Building2,
      label: 'Business Category',
      value: 'Commercial Laundry & Linen Care',
      subtitle: 'Part of Cleanline Linen Management',
      link: '#commercial',
    },
    {
      icon: Clock,
      label: 'Operating Hours',
      value: 'Mon–Sun from 9:00 AM',
      subtitle: slStatus || 'Mon, Sat-Sun: 5PM | Tue-Fri: 6PM',
      link: '#contact',
    },
  ];

  return (
    <div className="w-full px-4 md:px-6 -mt-10 md:-mt-12 relative z-20">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        id="info-bar"
        className="bg-primary text-white rounded-2xl md:rounded-3xl mx-auto max-w-7xl shadow-2xl overflow-hidden border border-white/10"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {infoItems.map((item, idx) => (
            <div key={idx} className="p-5 md:p-6 flex items-start gap-4 hover:bg-white/5 transition-colors">
              <div className="bg-olive/20 p-3 rounded-2xl shrink-0 text-accent border border-olive/30">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                {item.link ? (
                  <a
                    href={item.link}
                    target={item.link.startsWith('http') ? '_blank' : '_self'}
                    rel="noreferrer"
                    className="font-semibold hover:text-accent transition-colors block text-sm xl:text-base truncate"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="font-semibold text-sm xl:text-base truncate">{item.value}</p>
                )}
                <p className="text-accent/90 text-xs mt-0.5 font-medium truncate flex items-center gap-1.5">
                  {idx === 3 && slStatus && (
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0 inline-block" />
                  )}
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
