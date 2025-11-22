import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-tangerine-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-display font-bold">SeedSync</span>
            </div>
            <p className="text-neutral-300 text-sm mb-4">
              Transforming India's oilseed supply chain through digital innovation and transparency.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-300 hover:text-tangerine-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-300 hover:text-tangerine-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-300 hover:text-tangerine-500 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-neutral-300 hover:text-tangerine-500 text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-neutral-300 hover:text-tangerine-500 text-sm transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-neutral-300 hover:text-tangerine-500 text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-neutral-300 hover:text-tangerine-500 text-sm transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-neutral-300 hover:text-tangerine-500 text-sm transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-neutral-300 hover:text-tangerine-500 text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-neutral-300 hover:text-tangerine-500 text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-neutral-300 hover:text-tangerine-500 text-sm transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-tangerine-500 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-300 text-sm">
                  123 Agriculture Hub, New Delhi, India
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-tangerine-500 flex-shrink-0" />
                <span className="text-neutral-300 text-sm">+91 9876543210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-tangerine-500 flex-shrink-0" />
                <span className="text-neutral-300 text-sm">contact@seedsync.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-navy-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm">
            © {currentYear} SeedSync. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/terms" className="text-neutral-400 hover:text-tangerine-500 text-sm transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-neutral-400 hover:text-tangerine-500 text-sm transition-colors">
              Privacy
            </Link>
            <Link to="/cookies" className="text-neutral-400 hover:text-tangerine-500 text-sm transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}