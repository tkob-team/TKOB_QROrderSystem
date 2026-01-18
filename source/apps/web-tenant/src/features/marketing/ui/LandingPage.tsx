/**
 * Landing Page - SUSHIFOOD-inspired design
 * Hero with floating food icons + anime.js animations
 */

'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  QrCode, 
  ChefHat, 
  BarChart3, 
  Users, 
  Clock, 
  Shield,
  Check,
  ArrowRight,
  Star,
  Zap,
  MonitorPlay,
  ClipboardCheck,
} from 'lucide-react';
import { useAnimeOnMount, useAnimeOnInView } from '../hooks/useAnimeAnimations';
import { usePublicSubscriptionControllerGetPublicPlans } from '@/services/generated/subscription-public/subscription-public';

// Floating food emojis for hero section
const floatingFoods = ['🍕', '🍔', '🍜', '🍣', '🥗', '🍰', '☕'];

// Features data
const features = [
  {
    icon: QrCode,
    title: 'QR Ordering',
    description: 'Guests scan, browse, and order in seconds—no app install, fewer mistakes.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: MonitorPlay,
    title: 'Kitchen Display',
    description: 'Orders show up instantly on a clear kitchen screen so the team can cook in order.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: ClipboardCheck,
    title: 'Service Board',
    description: 'A live board for staff to confirm, run, and close tickets without shouting across the room.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: ChefHat,
    title: 'Menu Management',
    description: 'Update items, options, and prices anytime—your digital menu stays current.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'See what sells, what slows you down, and where you can improve week over week.',
    color: 'from-rose-500 to-red-500',
  },
  {
    icon: Users,
    title: 'Staff Management',
    description: 'Simple roles and access so everyone sees only what they need during service.',
    color: 'from-cyan-500 to-sky-500',
  },
];

// Stats for social proof
const stats = [
  { value: '20+', label: 'Restaurants' },
  { value: '15k+', label: 'Orders/Month' },
  { value: '-30%', label: 'Wait Time' },
  { value: '99.9%', label: 'Uptime' },
];

// Testimonials
const testimonials = [
  {
    quote: "We cut order mistakes almost immediately. The kitchen sees everything clearly, and service feels calmer.",
    author: 'Minh Nguyen',
    role: 'Owner',
    avatar: '👨‍🍳',
  },
  {
    quote: "QR ordering helped during rush hours. Guests order faster, and our staff spends more time on hospitality.",
    author: 'Linh Tran',
    role: 'Manager',
    avatar: '👩‍💼',
  },
  {
    quote: "The KDS + service board keeps everyone aligned. It’s simple, fast, and doesn’t get in the way.",
    author: 'Duc Le',
    role: 'Kitchen Lead',
    avatar: '👨‍💻',
  },
];

export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  // Fetch pricing plans from API
  const { data: apiPlans, isLoading: isLoadingPlans } = usePublicSubscriptionControllerGetPublicPlans();

  // Map API plans to display format
  const pricingPlans = React.useMemo(() => {
    if (!apiPlans || apiPlans.length === 0) {
      // Fallback plans while loading or if API fails
      return [
        {
          name: 'Starter',
          price: '$29',
          period: '/month',
          description: 'Perfect for small restaurants',
          features: ['Up to 10 tables', 'Basic QR ordering', 'Standard KDS', 'Email support'],
          cta: 'Start Free Trial',
          highlighted: false,
          tier: 'BASIC',
        },
        {
          name: 'Pro',
          price: '$79',
          period: '/month',
          description: 'For growing restaurants',
          features: ['Unlimited tables', 'Advanced QR + Menu', 'Full KDS + Service Board', 'Analytics Dashboard', 'Staff management', 'Priority support'],
          cta: 'Start Free Trial',
          highlighted: true,
          tier: 'PREMIUM',
        },
        {
          name: 'Enterprise',
          price: 'Custom',
          period: '',
          description: 'Multi-branch solutions',
          features: ['Multi-location support', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee', 'On-site training'],
          cta: 'Contact Us',
          highlighted: false,
          tier: 'ENTERPRISE',
        },
      ];
    }

    // Transform API plans to display format
    return (apiPlans as any[]).map((plan: any) => {
      const isPopular = plan.tier === 'PREMIUM';
      const isEnterprise = plan.tier === 'ENTERPRISE';
      
      // Transform features object to array of strings
      let featuresArray: string[] = [];
      if (plan.features && typeof plan.features === 'object') {
        // Features from API is an object like {analytics: boolean, promotions: boolean, ...}
        // Convert to readable strings based on plan limits
        featuresArray = [
          plan.maxTables === -1 ? 'Unlimited tables' : `Up to ${plan.maxTables} table${plan.maxTables > 1 ? 's' : ''}`,
          plan.maxMenuItems === -1 ? 'Unlimited menu items' : `Up to ${plan.maxMenuItems} menu items`,
          plan.maxOrdersMonth === -1 ? 'Unlimited orders/month' : `${plan.maxOrdersMonth} orders/month`,
          plan.maxStaff === -1 ? 'Unlimited staff' : `Up to ${plan.maxStaff} staff member${plan.maxStaff > 1 ? 's' : ''}`,
        ];
        
        // Add feature-based items
        if (plan.features.analytics) featuresArray.push('Analytics Dashboard');
        if (plan.features.promotions) featuresArray.push('Promotions & Discounts');
        if (plan.features.customBranding) featuresArray.push('Custom Branding');
        if (plan.features.prioritySupport) featuresArray.push('Priority Support');
        
        // Add email support for plans without priority support
        if (!plan.features.prioritySupport) featuresArray.push('Email Support');
      } else if (Array.isArray(plan.features)) {
        // Fallback if features is already an array
        featuresArray = plan.features;
      }
      
      return {
        name: plan.name || plan.tier,
        price: isEnterprise ? 'Custom' : `$${(plan.priceUSD || 0).toFixed(0)}`,
        period: isEnterprise ? '' : '/month',
        description: plan.description || '',
        features: featuresArray,
        cta: isEnterprise ? 'Contact Us' : 'Start Free Trial',
        highlighted: isPopular,
        tier: plan.tier,
      };
    });
  }, [apiPlans]);

  // Hero animation on mount
  useAnimeOnMount(heroRef, 'fadeUpStagger');
  
  // Stats animation on scroll
  useAnimeOnInView(statsRef, 'countUp');
  
  // Features stagger animation
  useAnimeOnInView(featuresRef, 'fadeUpStagger');

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        {/* Floating Food Icons - Decorative */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {floatingFoods.map((food, i) => (
            <div
              key={i}
              className="floating-food absolute text-4xl md:text-5xl opacity-60"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              {food}
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div ref={heroRef} className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Text Content */}
            <div className="hero-content space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4" />
                All-in-one restaurant system
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Run Your Restaurant{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  Smarter
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 max-w-xl">
                QR ordering, payments, KDS, and a service board—everything you need to move orders from table to kitchen without the chaos.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/login"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                >
                  Start free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-200 shadow-sm transition-all"
                >
                  See how it works
                </a>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  {['👨‍🍳', '👩‍🍳', '👨‍💼', '👩‍💼'].map((avatar, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-white flex items-center justify-center text-lg"
                    >
                      {avatar}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-gray-600">Trusted by local restaurant teams</span>
                </div>
              </div>
            </div>

            {/* Right: Dashboard Preview */}
            <div className="hero-visual relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/10 border border-gray-200 bg-white">
                {/* Mock Dashboard Header */}
                <div className="h-12 bg-emerald-600 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/30"></div>
                  <div className="w-3 h-3 rounded-full bg-white/30"></div>
                  <div className="w-3 h-3 rounded-full bg-white/30"></div>
                  <span className="ml-4 text-white/80 text-sm font-medium">TKOB Dashboard</span>
                </div>
                {/* Mock Dashboard Content */}
                <div className="p-6 bg-gray-50 min-h-[300px]">
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: 'Today\'s revenue', value: '$12,450', color: 'emerald' },
                      { label: 'Orders today', value: '156', color: 'blue' },
                      { label: 'Open tables', value: '8 tables', color: 'amber' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-500">{stat.label}</p>
                        <p className={`font-bold text-${stat.color}-600`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-sm font-medium text-gray-700">Latest tickets</span>
                    </div>
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🍜</span>
                          <span className="text-sm text-gray-600">Table {i + 1}</span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">Ready</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div ref={statsRef} className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center stat-item">
                <div className="font-display text-3xl md:text-4xl font-bold text-emerald-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need, from scan to serve
            </h2>
            <p className="text-lg text-gray-600">
              Keep guests moving and staff in sync—orders, tickets, and kitchen workflow in one clean flow.
            </p>
          </div>

          <div ref={featuresRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="feature-card group bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200"
                >
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built with real restaurant teams
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border border-gray-100"
              >
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
              Pricing
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pricing that scales with you
            </h2>
            <p className="text-lg text-gray-600">
              Start small, upgrade when you’re ready. No surprises—just the tools you need to run service well.
            </p>
          </div>

          {isLoadingPlans ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-6 md:p-8 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-2xl shadow-emerald-500/25 scale-105'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-amber-900 text-sm font-bold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className={`font-heading text-xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlighted ? 'text-emerald-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className="font-display text-4xl font-bold">{plan.price}</span>
                  <span className={plan.highlighted ? 'text-emerald-100' : 'text-gray-500'}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <Check className={`w-5 h-5 ${plan.highlighted ? 'text-emerald-200' : 'text-emerald-500'}`} />
                      <span className={plan.highlighted ? 'text-emerald-50' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/login"
                  className={`block w-full py-3 text-center font-semibold rounded-lg transition-all ${
                    plan.highlighted
                      ? 'bg-white text-emerald-600 hover:bg-emerald-50'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">
            Ready to see TKOB in your restaurant?
          </h2>
          <p className="text-lg md:text-xl text-emerald-100 mb-8 py-4">
            Start with a free account or book a quick walkthrough—we’ll show you how it works.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-all shadow-lg"
            >
              Start free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-all border border-emerald-500"
            >
              Book a walkthrough
            </a>
          </div>
        </div>
      </section>

      {/* Floating animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        .floating-food {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
