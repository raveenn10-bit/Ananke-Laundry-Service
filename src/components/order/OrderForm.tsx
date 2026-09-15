'use client';

import React, { useState, useId } from 'react';
import {
  User,
  Phone,
  Mail,
  Sparkles,
  Shirt,
  Plus,
  Minus,
  Trash2,
  Truck,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Camera,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Copy,
  ExternalLink,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  OrderItem,
  WhatsAppOrderData,
} from '@/types/order';
import {
  generateOrderId,
  formatWhatsAppOrderMessage,
  buildWhatsAppChatUrl,
  OFFICIAL_WHATSAPP_NUMBER,
} from '@/lib/order/whatsappOrder';

interface OrderFormProps {
  onComplete?: () => void;
  isModal?: boolean;
}

const PRESET_ITEMS = [
  { name: 'Shirt', icon: '👔' },
  { name: 'T-Shirt', icon: '👕' },
  { name: 'Trouser', icon: '👖' },
  { name: 'Jeans', icon: '👖' },
  { name: 'Shorts', icon: '🩳' },
  { name: 'Dress', icon: '👗' },
  { name: 'Saree', icon: '🥻' },
  { name: 'Bedsheet', icon: '🛏️' },
  { name: 'Towel', icon: '🧖' },
  { name: 'Curtain', icon: '🪟' },
  { name: 'Other', icon: '🧺' },
];

const SERVICE_OPTIONS = [
  {
    id: 'Wash & Fold',
    title: 'Wash & Fold',
    desc: 'Washed, dried, and neatly folded everyday laundry',
    icon: '🧺',
  },
  {
    id: 'Wash & Iron',
    title: 'Wash & Iron',
    desc: 'Deep cleaning followed by crisp pressing',
    icon: '👔',
  },
  {
    id: 'Ironing Only',
    title: 'Ironing Only',
    desc: 'Professional steam pressing for wrinkle-free finish',
    icon: '♨️',
  },
  {
    id: 'Dry Cleaning',
    title: 'Dry Cleaning',
    desc: 'Gentle solvent care for suits, silks, and delicate garments',
    icon: '✨',
  },
  {
    id: 'Other',
    title: 'Other / Custom Care',
    desc: 'Hotel linen, blankets, stain treatment, or bulk orders',
    icon: '🏷️',
  },
];

const TIME_SLOTS = [
  '09:00 AM – 12:00 PM (Morning)',
  '12:00 PM – 03:00 PM (Afternoon)',
  '03:00 PM – 06:00 PM (Evening)',
  'Flexible / Any time',
];

export default function OrderForm({ onComplete, isModal = false }: OrderFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [orderId, setOrderId] = useState<string>(() => generateOrderId());

  // Step 1: Customer Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Step 2: Services
  const [selectedServices, setSelectedServices] = useState<string[]>(['Wash & Fold']);
  const [otherServiceDetails, setOtherServiceDetails] = useState('');

  // Step 3: Clothes / Items
  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', name: 'Shirt', quantity: 2 },
    { id: '2', name: 'Trouser', quantity: 2 },
  ]);

  // Step 4: Collection & Delivery
  const [collectionMethod, setCollectionMethod] = useState<'Pickup Required' | 'I will drop off the clothes'>('Pickup Required');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupDate, setPickupDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [pickupTime, setPickupTime] = useState('09:00 AM – 12:00 PM (Morning)');

  const [deliveryMethod, setDeliveryMethod] = useState<'Delivery Required' | 'I will collect the clothes'>('Delivery Required');
  const [sameAsPickupAddress, setSameAsPickupAddress] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Notes & Image
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');

  // Status & Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [submittedWhatsAppUrl, setSubmittedWhatsAppUrl] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // Form Validation per step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!customerName.trim()) {
        newErrors.customerName = 'Please enter your full name';
      }
      const cleanPhone = customerPhone.replace(/[\s\-\+]/g, '');
      if (!cleanPhone || cleanPhone.length < 8) {
        newErrors.customerPhone = 'Please enter a valid WhatsApp or phone number';
      }
      if (customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
        newErrors.customerEmail = 'Please enter a valid email address';
      }
    }

    if (step === 2) {
      if (selectedServices.length === 0) {
        newErrors.services = 'Please select at least one laundry service';
      }
      if (selectedServices.includes('Other') && !otherServiceDetails.trim()) {
        newErrors.otherServiceDetails = 'Please specify the service you require';
      }
    }

    if (step === 3) {
      if (items.length === 0) {
        newErrors.items = 'Please add at least one item or select a preset';
      } else {
        const hasEmptyName = items.some((item) => !item.name.trim());
        if (hasEmptyName) {
          newErrors.items = 'Please enter an item name for all custom items';
        }
      }
    }

    if (step === 4) {
      if (collectionMethod === 'Pickup Required') {
        if (!pickupAddress.trim()) {
          newErrors.pickupAddress = 'Please enter your pickup address';
        }
        if (!pickupDate) {
          newErrors.pickupDate = 'Please select a preferred pickup date';
        }
      }

      if (deliveryMethod === 'Delivery Required' && (!sameAsPickupAddress || collectionMethod !== 'Pickup Required')) {
        if (!deliveryAddress.trim()) {
          newErrors.deliveryAddress = 'Please enter your delivery address';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    setErrors({});
    setCurrentStep(step);
  };

  // Service toggle
  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((s) => s !== serviceId);
      }
      return [...prev, serviceId];
    });
    if (errors.services) {
      setErrors((prev) => ({ ...prev, services: '' }));
    }
  };

  // Items manipulation
  const addItem = (name: string = 'Shirt') => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      name,
      quantity: 1,
    };
    setItems((prev) => [...prev, newItem]);
    if (errors.items) {
      setErrors((prev) => ({ ...prev, items: '' }));
    }
  };

  const updateItemQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const updateItemName = (id: string, name: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Image Upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFileName('');
  };

  // Total items count
  const totalItemsCount = items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

  // Submit via WhatsApp
  const handlePlaceOrderWhatsApp = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    const orderData: WhatsAppOrderData = {
      orderId,
      customerName,
      customerPhone,
      customerEmail: customerEmail.trim() || undefined,
      services: selectedServices,
      otherServiceDetails: otherServiceDetails.trim() || undefined,
      items,
      collectionMethod,
      pickupAddress: collectionMethod === 'Pickup Required' ? pickupAddress : undefined,
      pickupDate: collectionMethod === 'Pickup Required' ? pickupDate : undefined,
      pickupTime: collectionMethod === 'Pickup Required' ? pickupTime : undefined,
      deliveryMethod,
      deliveryAddress:
        deliveryMethod === 'Delivery Required'
          ? sameAsPickupAddress && collectionMethod === 'Pickup Required'
            ? pickupAddress
            : deliveryAddress
          : undefined,
      sameAsPickupAddress: deliveryMethod === 'Delivery Required' && sameAsPickupAddress,
      specialInstructions: specialInstructions.trim() || undefined,
      imageAttached: Boolean(imagePreview),
      imageFileName: imageFileName || undefined,
      createdAt: new Date().toISOString(),
    };

    const message = formatWhatsAppOrderMessage(orderData);
    const whatsappUrl = buildWhatsAppChatUrl(message, OFFICIAL_WHATSAPP_NUMBER);

    setSubmittedMessage(message);
    setSubmittedWhatsAppUrl(whatsappUrl);

    // Asynchronously log the order to backend for future Zoho & admin tracking (non-blocking)
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    // Delay slightly to give premium feedback, then launch WhatsApp
    setTimeout(() => {
      setIsSubmitting(false);
      setIsOrderPlaced(true);

      // Attempt to open WhatsApp directly
      if (typeof window !== 'undefined') {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
        if (isMobile) {
          window.location.href = whatsappUrl;
        } else {
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        }
      }

      if (onComplete) {
        // give user time to see success screen
      }
    }, 400);
  };

  const handleCopyOrderId = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(orderId);
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    }
  };

  const resetForm = () => {
    setOrderId(generateOrderId());
    setCurrentStep(1);
    setIsOrderPlaced(false);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setSelectedServices(['Wash & Fold']);
    setOtherServiceDetails('');
    setItems([
      { id: '1', name: 'Shirt', quantity: 2 },
      { id: '2', name: 'Trouser', quantity: 2 },
    ]);
    setSpecialInstructions('');
    setImagePreview(null);
    setImageFileName('');
    setErrors({});
  };

  // SUCCESS CONFIRMATION SCREEN
  if (isOrderPlaced) {
    return (
      <div className="text-center py-6 sm:py-10 px-2 sm:px-4 max-w-xl mx-auto">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-[#25D366] text-white flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-[0_8px_30px_rgba(37,211,102,0.4)] animate-bounce">
          <CheckCircle2 size={36} className="sm:size-10 stroke-[2.5]" />
        </div>

        <span className="text-xs font-bold text-olive uppercase tracking-widest bg-olive/10 px-3 py-1 rounded-full">
          ORDER READY TO SEND
        </span>

        <h3 className="font-heading text-2xl sm:text-3xl font-bold text-dark mt-2.5 mb-2">
          WhatsApp Chat Opening!
        </h3>

        <p className="text-gray-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed mb-6">
          Your laundry order has been prepared. If WhatsApp didn’t open automatically on your device, click the green button below to send your order.
        </p>

        {/* Order Reference Badge */}
        <div className="bg-cream border border-cream-dark p-4 rounded-2xl max-w-sm mx-auto mb-6 flex items-center justify-between shadow-xs">
          <div className="text-left">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">
              Order Reference ID
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-dark tracking-wide">
              {orderId}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyOrderId}
            className="flex items-center gap-1.5 text-xs font-semibold text-olive hover:text-dark bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-xs transition-colors"
          >
            {copiedOrderId ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copiedOrderId ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Fallback Direct WhatsApp Button */}
        <div className="flex flex-col gap-3 max-w-sm mx-auto">
          <a
            href={submittedWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-[#128C7E] to-[#25D366] hover:from-[#0f776a] hover:to-[#20ba5a] text-white font-bold py-3.5 px-6 rounded-2xl shadow-[0_4px_20px_rgba(37,211,102,0.4)] flex items-center justify-center gap-2.5 text-sm sm:text-base transition-all hover:scale-[1.02] active:scale-95"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.952 3.71 1.453 5.711 1.454h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            <span>Open WhatsApp Chat</span>
          </a>

          <button
            type="button"
            onClick={resetForm}
            className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:text-dark bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Start Another Order
          </button>
        </div>
      </div>
    );
  }

  const stepsLabels = [
    { num: 1, label: 'Customer', icon: User },
    { num: 2, label: 'Services', icon: Sparkles },
    { num: 3, label: 'Clothes', icon: Shirt },
    { num: 4, label: 'Pickup & Delivery', icon: Truck },
    { num: 5, label: 'Review', icon: CheckCircle2 },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step Progress Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          {stepsLabels.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            const Icon = s.icon;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num < currentStep) goToStep(s.num);
                }}
                disabled={s.num > currentStep}
                className={`flex flex-col items-center gap-1 transition-all group ${
                  s.num <= currentStep ? 'cursor-pointer' : 'cursor-default opacity-50'
                }`}
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-olive text-white ring-4 ring-olive/20 shadow-md scale-105'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {isCompleted ? <Check size={14} className="stroke-[3]" /> : <Icon size={16} />}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-semibold hidden xs:block transition-colors ${
                    isCurrent ? 'text-olive' : isCompleted ? 'text-dark' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Progress Bar Line */}
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-olive to-accent h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentStep - 1) / (stepsLabels.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content Area */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-4 sm:p-7 shadow-xl shadow-black/5 relative">
        <AnimatePresence mode="wait">
          {/* ================= STEP 1: CUSTOMER DETAILS ================= */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 sm:space-y-5"
            >
              <div>
                <span className="text-[11px] font-bold text-olive uppercase tracking-widest block">
                  Step 1 of 5
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-dark">
                  Customer Details
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Enter your contact details so our Unawatuna laundry team can confirm your order.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: '' }));
                    }}
                    placeholder="e.g. Kasun Perera"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm sm:text-base outline-none transition-all ${
                      errors.customerName
                        ? 'border-red-400 bg-red-50/30 ring-2 ring-red-100'
                        : 'border-gray-200 focus:border-olive focus:ring-2 focus:ring-olive/20'
                    }`}
                  />
                </div>
                {errors.customerName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.customerName}
                  </p>
                )}
              </div>

              {/* WhatsApp / Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  WhatsApp / Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="tel"
                    inputMode="tel"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (errors.customerPhone) setErrors((prev) => ({ ...prev, customerPhone: '' }));
                    }}
                    placeholder="e.g. 077 123 4567 or +94 77 123 4567"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm sm:text-base outline-none transition-all ${
                      errors.customerPhone
                        ? 'border-red-400 bg-red-50/30 ring-2 ring-red-100'
                        : 'border-gray-200 focus:border-olive focus:ring-2 focus:ring-olive/20'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  We use this number to send order status updates on WhatsApp.
                </p>
                {errors.customerPhone && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.customerPhone}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email Address <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    inputMode="email"
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (errors.customerEmail) setErrors((prev) => ({ ...prev, customerEmail: '' }));
                    }}
                    placeholder="e.g. kasun@example.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm sm:text-base outline-none transition-all ${
                      errors.customerEmail
                        ? 'border-red-400 bg-red-50/30'
                        : 'border-gray-200 focus:border-olive focus:ring-2 focus:ring-olive/20'
                    }`}
                  />
                </div>
                {errors.customerEmail && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.customerEmail}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ================= STEP 2: LAUNDRY SERVICES ================= */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <span className="text-[11px] font-bold text-olive uppercase tracking-widest block">
                  Step 2 of 5
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-dark">
                  Select Laundry Services
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Choose one or multiple services you need for this order.
                </p>
              </div>

              {errors.services && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errors.services}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICE_OPTIONS.map((service) => {
                  const isSelected = selectedServices.includes(service.id);
                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all select-none flex items-start gap-3.5 ${
                        isSelected
                          ? 'bg-olive/5 border-olive ring-2 ring-olive/20 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="text-2xl shrink-0 mt-0.5">{service.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm sm:text-base text-dark">
                            {service.title}
                          </h4>
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                              isSelected
                                ? 'bg-olive border-olive text-white'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check size={13} className="stroke-[3]" />}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-normal">
                          {service.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedServices.includes('Other') && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Specify Custom / Other Service Details <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={otherServiceDetails}
                    onChange={(e) => {
                      setOtherServiceDetails(e.target.value);
                      if (errors.otherServiceDetails) {
                        setErrors((prev) => ({ ...prev, otherServiceDetails: '' }));
                      }
                    }}
                    placeholder="e.g. Wedding dress preservation, hotel duvet washing..."
                    className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base outline-none transition-all ${
                      errors.otherServiceDetails
                        ? 'border-red-400 bg-red-50/30'
                        : 'border-gray-200 focus:border-olive focus:ring-2 focus:ring-olive/20'
                    }`}
                  />
                  {errors.otherServiceDetails && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.otherServiceDetails}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ================= STEP 3: CLOTHES / ITEMS ================= */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-olive uppercase tracking-widest block">
                    Step 3 of 5
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-heading text-dark">
                    Clothes &amp; Items
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Add your laundry items and specify quantities.
                  </p>
                </div>
                <div className="bg-olive/10 text-olive px-3 py-1.5 rounded-full text-xs font-bold shrink-0">
                  Total: {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                </div>
              </div>

              {errors.items && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errors.items}</span>
                </div>
              )}

              {/* Quick Add Presets Chips */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Quick Add Presets:
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {PRESET_ITEMS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => addItem(preset.name)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-cream border border-cream-dark hover:border-olive/50 hover:bg-olive/10 text-dark transition-colors active:scale-95 cursor-pointer"
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.name}</span>
                      <Plus size={12} className="text-olive" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <div className="text-center py-8 px-4 border border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
                    <Shirt size={28} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      No items added yet. Click any preset above or add a custom item.
                    </p>
                  </div>
                ) : (
                  items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 bg-gray-50/80 hover:bg-gray-50 border border-gray-200 rounded-xl p-2.5 sm:p-3 transition-colors"
                    >
                      <span className="w-6 text-center text-xs font-bold text-gray-400 shrink-0">
                        {index + 1}.
                      </span>

                      {/* Item Name Input */}
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItemName(item.id, e.target.value)}
                        placeholder="Item name (e.g. Linen Bedding)"
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-dark focus:border-olive focus:ring-1 focus:ring-olive/20 outline-none"
                      />

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-xs sm:text-sm font-bold text-dark select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.id, 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Custom Item Button */}
              <button
                type="button"
                onClick={() => addItem('Other')}
                className="w-full py-2.5 px-4 border border-dashed border-olive/60 hover:border-olive bg-olive/5 hover:bg-olive/10 text-olive text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus size={16} />
                <span>+ Add Another Item</span>
              </button>
            </motion.div>
          )}

          {/* ================= STEP 4: PICKUP & DELIVERY ================= */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div>
                <span className="text-[11px] font-bold text-olive uppercase tracking-widest block">
                  Step 4 of 5
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-dark">
                  Collection &amp; Delivery
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Choose how you want your laundry collected and returned in Unawatuna / Galle.
                </p>
              </div>

              {/* Collection Method Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Collection Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCollectionMethod('Pickup Required')}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      collectionMethod === 'Pickup Required'
                        ? 'bg-olive/5 border-olive ring-2 ring-olive/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Truck className={collectionMethod === 'Pickup Required' ? 'text-olive' : 'text-gray-400'} size={20} />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-dark">Pickup Required</h4>
                      <p className="text-[11px] text-gray-500">We pick up from your doorstep</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCollectionMethod('I will drop off the clothes')}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      collectionMethod === 'I will drop off the clothes'
                        ? 'bg-olive/5 border-olive ring-2 ring-olive/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <MapPin className={collectionMethod === 'I will drop off the clothes' ? 'text-olive' : 'text-gray-400'} size={20} />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-dark">Drop Off at Facility</h4>
                      <p className="text-[11px] text-gray-500">Matara Road, Unawatuna</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Pickup Address & Schedule (if Pickup Required) */}
              {collectionMethod === 'Pickup Required' && (
                <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200 space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Pickup Address *
                    </label>
                    <textarea
                      rows={2}
                      value={pickupAddress}
                      onChange={(e) => {
                        setPickupAddress(e.target.value);
                        if (errors.pickupAddress) setErrors((prev) => ({ ...prev, pickupAddress: '' }));
                      }}
                      placeholder="e.g. Villa 14, Yaddehimulla Road, Unawatuna"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition-all bg-white resize-none ${
                        errors.pickupAddress ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus:border-olive'
                      }`}
                    />
                    {errors.pickupAddress && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.pickupAddress}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                        <Calendar size={13} className="text-olive" /> Preferred Pickup Date *
                      </label>
                      <input
                        type="date"
                        value={pickupDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          setPickupDate(e.target.value);
                          if (errors.pickupDate) setErrors((prev) => ({ ...prev, pickupDate: '' }));
                        }}
                        className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm bg-white outline-none ${
                          errors.pickupDate ? 'border-red-400' : 'border-gray-200 focus:border-olive'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                        <Clock size={13} className="text-olive" /> Preferred Time Slot *
                      </label>
                      <select
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white outline-none focus:border-olive text-gray-700"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Method Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Delivery Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('Delivery Required')}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      deliveryMethod === 'Delivery Required'
                        ? 'bg-olive/5 border-olive ring-2 ring-olive/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Truck className={deliveryMethod === 'Delivery Required' ? 'text-olive' : 'text-gray-400'} size={20} />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-dark">Delivery Required</h4>
                      <p className="text-[11px] text-gray-500">Delivered back fresh &amp; packed</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('I will collect the clothes')}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      deliveryMethod === 'I will collect the clothes'
                        ? 'bg-olive/5 border-olive ring-2 ring-olive/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <MapPin className={deliveryMethod === 'I will collect the clothes' ? 'text-olive' : 'text-gray-400'} size={20} />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-dark">I will Collect at Facility</h4>
                      <p className="text-[11px] text-gray-500">Pick up at your convenience</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Delivery Address (if Delivery Required) */}
              {deliveryMethod === 'Delivery Required' && (
                <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200 space-y-2.5">
                  {collectionMethod === 'Pickup Required' && (
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm text-dark font-medium">
                      <input
                        type="checkbox"
                        checked={sameAsPickupAddress}
                        onChange={(e) => setSameAsPickupAddress(e.target.checked)}
                        className="w-4 h-4 rounded text-olive focus:ring-olive"
                      />
                      <span>Same as Pickup Address</span>
                    </label>
                  )}

                  {(!sameAsPickupAddress || collectionMethod !== 'Pickup Required') && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Delivery Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={deliveryAddress}
                        onChange={(e) => {
                          setDeliveryAddress(e.target.value);
                          if (errors.deliveryAddress) setErrors((prev) => ({ ...prev, deliveryAddress: '' }));
                        }}
                        placeholder="Enter delivery address in Unawatuna/Galle"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition-all bg-white resize-none ${
                          errors.deliveryAddress ? 'border-red-400' : 'border-gray-200 focus:border-olive'
                        }`}
                      />
                      {errors.deliveryAddress && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.deliveryAddress}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Special Instructions & Optional Photo */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Special Instructions / Care Notes <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Please handle white clothes separately, stain treatment on shirt collar..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-olive bg-white resize-none"
                />
              </div>

              {/* Optional Garment Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Camera size={14} className="text-olive" /> Optional Garment Photo
                </label>
                {imagePreview ? (
                  <div className="relative inline-block border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-1">
                    <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1 rounded-full transition-colors"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                    <span className="block text-[10px] text-gray-500 px-1 pt-1 truncate max-w-[120px]">
                      {imageFileName}
                    </span>
                  </div>
                ) : (
                  <label className="border border-dashed border-gray-300 hover:border-olive bg-gray-50/50 hover:bg-olive/5 rounded-xl p-3.5 flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs text-gray-600 font-medium">
                    <Camera size={16} className="text-olive" />
                    <span>Upload or Take Photo of Garments (Optional)</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
                <p className="text-[11px] text-gray-400 mt-1">
                  Helpful for delicate garments or specific stains. You can also attach it directly in WhatsApp.
                </p>
              </div>
            </motion.div>
          )}

          {/* ================= STEP 5: REVIEW ORDER ================= */}
          {currentStep === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <span className="text-[11px] font-bold text-olive uppercase tracking-widest block">
                  Step 5 of 5
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-dark">
                  Review Your Order
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Please verify your order details before placing it via WhatsApp.
                </p>
              </div>

              {/* Order Reference Box */}
              <div className="bg-olive/10 border border-olive/20 rounded-2xl p-3 sm:p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-olive uppercase tracking-wider block">
                    Generated Order Reference
                  </span>
                  <span className="font-mono text-base font-bold text-dark">{orderId}</span>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <span>Ananke Laundry</span>
                  <p className="text-[10px] text-emerald-600 font-semibold">Direct WhatsApp Chat</p>
                </div>
              </div>

              {/* Review Sections */}
              <div className="space-y-3 text-xs sm:text-sm">
                {/* 1. Customer */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-700 flex items-center gap-1.5 mb-1">
                      <User size={13} className="text-olive" /> Customer Details
                    </h4>
                    <p className="font-semibold text-dark">{customerName}</p>
                    <p className="text-gray-600 font-mono text-xs">{customerPhone}</p>
                    {customerEmail && <p className="text-gray-500 text-xs">{customerEmail}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="text-xs font-semibold text-olive hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* 2. Services */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-700 flex items-center gap-1.5 mb-1">
                      <Sparkles size={13} className="text-olive" /> Selected Services
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedServices.map((srv) => (
                        <span
                          key={srv}
                          className="bg-white border border-gray-200 text-dark px-2.5 py-0.5 rounded-md text-xs font-medium"
                        >
                          {srv === 'Other' && otherServiceDetails ? `Other: ${otherServiceDetails}` : srv}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="text-xs font-semibold text-olive hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* 3. Items */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex items-start justify-between">
                  <div className="w-full mr-2">
                    <h4 className="font-bold text-gray-700 flex items-center gap-1.5 mb-1">
                      <Shirt size={13} className="text-olive" /> Items ({totalItemsCount} total)
                    </h4>
                    <ul className="divide-y divide-gray-200/60 mt-1 max-h-32 overflow-y-auto">
                      {items.map((item) => (
                        <li key={item.id} className="py-1 flex justify-between text-xs">
                          <span className="text-dark font-medium">{item.name}</span>
                          <span className="font-bold text-gray-600">× {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="text-xs font-semibold text-olive hover:underline shrink-0"
                  >
                    Edit
                  </button>
                </div>

                {/* 4. Collection & Delivery */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-700 flex items-center gap-1.5 mb-1">
                      <Truck size={13} className="text-olive" /> Collection &amp; Delivery
                    </h4>
                    <p className="text-dark font-medium">
                      Collection: <span className="font-semibold">{collectionMethod}</span>
                    </p>
                    {collectionMethod === 'Pickup Required' && (
                      <div className="text-gray-600 text-xs pl-2 border-l-2 border-olive/30 mt-0.5 space-y-0.5">
                        <p>📍 {pickupAddress}</p>
                        <p>📅 {pickupDate} ({pickupTime})</p>
                      </div>
                    )}
                    <p className="text-dark font-medium mt-1">
                      Delivery: <span className="font-semibold">{deliveryMethod}</span>
                    </p>
                    {deliveryMethod === 'Delivery Required' && (
                      <div className="text-gray-600 text-xs pl-2 border-l-2 border-olive/30 mt-0.5">
                        <p>📍 {sameAsPickupAddress && collectionMethod === 'Pickup Required' ? 'Same as Pickup Address' : deliveryAddress}</p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(4)}
                    className="text-xs font-semibold text-olive hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* 5. Special Notes */}
                {specialInstructions && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs">
                    <h4 className="font-bold text-gray-700 mb-0.5">Special Instructions:</h4>
                    <p className="text-gray-600 italic">&ldquo;{specialInstructions}&rdquo;</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-600 hover:text-dark hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto bg-olive hover:bg-dark text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePlaceOrderWhatsApp}
              className="ml-auto bg-gradient-to-r from-[#128C7E] via-[#25D366] to-[#4ade80] hover:shadow-[0_8px_25px_rgba(37,211,102,0.6)] text-white font-bold py-3.5 px-6 rounded-xl text-xs sm:text-base transition-all duration-300 flex items-center gap-2.5 shadow-lg active:scale-95 cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Preparing WhatsApp...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.952 3.71 1.453 5.711 1.454h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>Place Order via WhatsApp</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
