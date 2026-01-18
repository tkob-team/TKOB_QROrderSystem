/**
 * About Page
 * Company information and team
 */

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Target, 
  Users, 
  Heart, 
  Lightbulb,
  ArrowRight,
  MapPin,
  Calendar,
} from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Solve real problems',
    description: 'We build features restaurants actually need, not what sounds impressive on a landing page.',
  },
  {
    icon: Lightbulb,
    title: 'Keep it simple',
    description: 'Good tools shouldn’t require training. We design for busy people who need things to just work.',
  },
  {
    icon: Users,
    title: 'Listen closely',
    description: 'The best ideas come from the people using TKOB every shift. We pay attention and improve continuously.',
  },
  {
    icon: Heart,
    title: 'Care about service',
    description: 'Hospitality matters. We respect the work restaurant teams do, and we want to support it—not complicate it.',
  },
];

const team = [
  { name: 'Le Tan Hiep', role: 'Full-Stack Engineer (Lead)', avatar: '/images/mate1.jpg' },
  { name: 'Nguyen Phuc Hoang', role: 'Full-Stack Engineer', avatar: '/images/mate2.jpg' },
  { name: 'Tong Duong Thai Hoa', role: 'Full-Stack Engineer', avatar: '/images/mate3.jpg' },
];

export function AboutPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
            About us
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            A small team building{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              practical tools
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            We’re three full-stack engineers building TKOB to help restaurants run smoother service, one order at a time.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
                Our story
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                We started because we saw the chaos
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  TKOB began as a university project. We watched local restaurants juggle handwritten orders, missed tickets, and stressed kitchen staff during rush hours.
                </p>
                <p>
                  So we built a simple flow: QR ordering, a kitchen display, and a service board—all connected in real time.
                </p>
                <p>
                  Today, TKOB helps restaurant teams coordinate better, reduce mistakes, and focus on hospitality instead of chasing down orders.
                </p>
              </div>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Started 2025</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>Ho Chi Minh City</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl p-8 md:p-12">
                <div className="grid grid-cols-2 gap-4">
                  {['📱', '🍽️', '👨‍🍳', '📊'].map((emoji, i) => (
                    <div key={i} className="bg-white rounded-lg p-6 text-center shadow-sm">
                      <span className="text-4xl">{emoji}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-500 rounded-full opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
              Our values
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
              How we work
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              Our team
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
              The people behind TKOB
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, i) => (
              <div key={i} className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image 
                    src={member.avatar} 
                    alt={member.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-heading font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Questions? Want to chat?
          </h2>
          <p className="text-lg text-emerald-100 mb-8 py-4">
            Reach out anytime—we’re happy to help or just talk shop about restaurants.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/help"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-all"
            >
              Get in touch
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-all border border-emerald-500"
            >
              Try TKOB free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
