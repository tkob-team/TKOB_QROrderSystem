/**
 * About Page
 * Company information and team
 */

'use client';

import React from 'react';
import Link from 'next/link';
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
    title: 'Customer First',
    description: 'We build for restaurant owners, not for ourselves. Every feature is designed to solve real problems.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We constantly improve and adopt new technologies to give you the competitive edge.',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'We work closely with our customers to understand their needs and deliver value.',
  },
  {
    icon: Heart,
    title: 'Passion',
    description: 'We love what we do and it shows in every line of code and every pixel of design.',
  },
];

const team = [
  { name: 'Team Lead', role: 'Project Manager', avatar: '👨‍💼' },
  { name: 'Backend Dev', role: 'API & Database', avatar: '👨‍💻' },
  { name: 'Frontend Dev', role: 'UI/UX & Web', avatar: '👩‍💻' },
  { name: 'Designer', role: 'Visual Design', avatar: '🎨' },
];

export function AboutPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
            About Us
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Building the Future of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Restaurant Tech
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            We're a team of passionate developers and designers on a mission to help restaurants 
            thrive in the digital age.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
                Our Story
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                From University Project to Real Solution
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  TKOB started as a university project for our Web Application Development course. 
                  We saw how local restaurants struggled with order management, especially during peak hours.
                </p>
                <p>
                  What began as a class assignment evolved into a full-fledged platform that addresses 
                  real challenges faced by restaurant owners every day.
                </p>
                <p>
                  Today, we're proud to offer a comprehensive solution that helps restaurants 
                  streamline operations, reduce errors, and deliver better customer experiences.
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
              Our Values
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
              What Drives Us
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
              Our Team
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
              Meet the Creators
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {team.map((member, i) => (
              <div key={i} className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  {member.avatar}
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
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Want to Learn More?
          </h2>
          <p className="text-lg text-emerald-100 mb-8">
            Get in touch with us or try TKOB for your restaurant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/help"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-all"
            >
              Contact Us
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-all border border-emerald-500"
            >
              Try TKOB Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
