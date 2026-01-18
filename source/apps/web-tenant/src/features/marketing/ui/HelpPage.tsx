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
    question: 'How do I get started?',
    answer: 'Create an account, add your restaurant details and menu, then print QR codes for your tables. Most teams are set up in under 30 minutes.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes—try any plan free for 14 days. No credit card needed until you decide to continue.',
  },
  {
    question: 'Can I use TKOB at multiple locations?',
    answer: 'Absolutely. Our Enterprise plan is built for multi-location setups with centralized menus and reporting.',
  },
  {
    question: 'How does QR ordering work for guests?',
    answer: 'They scan the code with their phone camera, browse your menu, place their order—no app to download, no account to create.',
  },
  {
    question: 'What devices work with the Kitchen Display?',
    answer: 'Any device with a browser: tablets, laptops, monitors. We recommend tablets for portability and touchscreen ease.',
  },
  {
    question: 'How do I reach support if something goes wrong?',
    answer: 'Email us at support@tkob.io, use the contact form below, or chat with us in-app. Pro and Enterprise customers get faster response times.',
  },
  {
    question: 'Can I customize my digital menu?',
    answer: 'Yes. Upload photos, organize categories, add modifiers, set prices—your menu stays flexible and reflects your brand.',
  },
  {
    question: 'Is my restaurant data secure?',
    answer: 'We use industry-standard encryption, secure servers, and regular backups. Your data is safe, private, and always yours.',
  },
];

const supportChannels = [
  {
    icon: Mail,
    title: 'Email us',
    description: 'We reply within a few hours',
    contact: 'support@tkob.io',
    href: 'mailto:support@tkob.io',
  },
  {
    icon: MessageCircle,
    title: 'Live chat',
    description: 'Quick help during business hours',
    contact: 'Available 9AM–6PM',
    href: '#',
  },
  {
    icon: Phone,
    title: 'Call us',
    description: 'Prefer talking? We’re here',
    contact: '+84 123 456 789',
    href: 'tel:+84123456789',
  },
];

const resources = [
  {
    icon: Book,
    title: 'Docs',
    description: 'Setup guides and feature walkthroughs',
    href: '#',
  },
  {
    icon: Video,
    title: 'Video tutorials',
    description: 'Watch how features work step-by-step',
    href: '#',
  },
  {
    icon: HelpCircle,
    title: 'Knowledge base',
    description: 'Browse articles and troubleshooting tips',
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
    alert('Thanks for reaching out! We’ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
            Help & support
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            We’re here to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              help you succeed
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Whether you’re setting up or running into a snag—here are answers, guides, and ways to reach us.
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
              Common questions
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
              Quick answers
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
              Learn more
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
              Guides & resources
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
                Contact us
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Send us a message
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Still have questions? Drop us a line. We’ll respond within 24 hours (usually much faster).
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
