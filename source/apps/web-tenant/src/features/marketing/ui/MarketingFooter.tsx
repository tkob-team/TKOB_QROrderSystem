/**
 * Marketing Footer
 * Footer for landing pages
 */

import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  product: [
    { href: '/home#features', label: 'Features' },
    { href: '/home#pricing', label: 'Pricing' },
    { href: '/home#demo', label: 'Demo' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/help', label: 'Help Center' },
    { href: '/help#contact', label: 'Contact' },
  ],
  legal: [
    { href: '#', label: 'Privacy Policy' },
    { href: '#', label: 'Terms of Service' },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/home" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold">
                TKOB<span className="text-emerald-400">.</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Smart restaurant management platform. Streamline orders, manage menus, and boost efficiency.
            </p>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <a href="mailto:contact@tkob.io" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                <Mail className="w-4 h-4" />
                contact@tkob.io
              </a>
              <a href="tel:+84123456789" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                <Phone className="w-4 h-4" />
                +84 123 456 789
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Ho Chi Minh City, Vietnam
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Product</h4>
            <ul className="flex flex-col gap-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Company</h4>
            <ul className="flex flex-col gap-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Legal</h4>
            <ul className="flex flex-col gap-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} TKOB Restaurant. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Made with ❤️ in Vietnam
          </p>
        </div>
      </div>
    </footer>
  );
}
