/**
 * Help / Contact Page
 * FAQ and contact form
 */

'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  Mail, 
  MessageCircle, 
  Phone, 
  MapPin,
  Send,
  HelpCircle,
  Book,
  Video,
} from 'lucide-react';

const faqs = [
  {
    question: 'How do I get started with TKOB?',
    answer: 'Sign up for a free account, add your restaurant details, create your menu, and generate QR codes for your tables. You can be up and running in less than 30 minutes!',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All plans come with a 14-day free trial. No credit card required. You can explore all features before deciding.',
  },
  {
    question: 'Can I use TKOB for multiple restaurant branches?',
    answer: 'Absolutely! Our Enterprise plan supports multi-location management with centralized reporting and menu control.',
  },
  {
    question: 'How does QR ordering work?',
    answer: 'Customers scan the QR code at their table using their phone camera. They can browse your menu, customize orders, and submit directly to your kitchen. No app download needed!',
  },
  {
    question: 'What devices are supported for KDS?',
    answer: 'Our Kitchen Display System works on any device with a web browser - tablets, laptops, or dedicated screens. We recommend tablets for the best experience.',
  },
  {
    question: 'How do I contact support?',
    answer: 'You can reach us via email at support@tkob.io, through the contact form below, or via our in-app chat. Pro and Enterprise customers get priority support.',
  },
  {
    question: 'Can I customize the menu design?',
    answer: 'Yes! You can upload images, set categories, add modifiers, and customize the layout. Your digital menu reflects your brand.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Security is our priority. We use industry-standard encryption, secure data centers, and regular backups. Your data is safe with us.',
  },
];

const supportChannels = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get help via email',
    contact: 'support@tkob.io',
    href: 'mailto:support@tkob.io',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Chat with our team',
    contact: 'Available 9AM-6PM',
    href: '#',
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Call us directly',
    contact: '+84 123 456 789',
    href: 'tel:+84123456789',
  },
];

const resources = [
  {
    icon: Book,
    title: 'Documentation',
    description: 'Detailed guides and tutorials',
    href: '#',
  },
  {
    icon: Video,
    title: 'Video Tutorials',
    description: 'Step-by-step video guides',
    href: '#',
  },
  {
    icon: HelpCircle,
    title: 'Knowledge Base',
    description: 'Common questions answered',
    href: '#',
  },
];

export function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
            Help Center
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How Can We{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Help You?
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Find answers to common questions or get in touch with our support team.
          </p>
        </div>
      </section>

      {/* Support Channels */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {supportChannels.map((channel, i) => {
              const Icon = channel.icon;
              return (
                <a
                  key={i}
                  href={channel.href}
                  className="flex items-center gap-4 p-6 bg-gray-50 rounded-2xl hover:bg-emerald-50 transition-colors group"
                >
                  <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <Icon className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-gray-900">{channel.title}</h3>
                    <p className="text-sm text-gray-500">{channel.description}</p>
                    <p className="text-sm font-medium text-emerald-600">{channel.contact}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
              FAQ
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-heading font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              Resources
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
              Learn More
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {resources.map((resource, i) => {
              const Icon = resource.icon;
              return (
                <a
                  key={i}
                  href={resource.href}
                  className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl hover:bg-emerald-50 transition-colors group"
                >
                  <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                    <Icon className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="font-heading font-semibold text-gray-900 mb-1">{resource.title}</h3>
                  <p className="text-sm text-gray-500">{resource.description}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Info */}
            <div>
              <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
                Contact Us
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Get in Touch
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Have a question that isn&apos;t answered above? We&apos;d love to hear from you. 
                Fill out the form and we&apos;ll get back to you within 24 hours.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <span>Ho Chi Minh City, Vietnam</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  <span>contact@tkob.io</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <span>+84 123 456 789</span>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all resize-none"
                    placeholder="Tell us more..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/25 transition-all"
                >
                  Send Message
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
