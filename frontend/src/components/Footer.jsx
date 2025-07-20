import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {

    return (
        <footer className="bg-[#414535] text-[#F2E3BC] py-8 px-6 md:px-12">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Brand/Info Column */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-[#89cdcd]">Lumin</h2>
                    <p className="text-sm opacity-90">
                    Your AI-powered solution for modern challenges.
                    </p>
                    <div className="flex space-x-4">
                    <a href="#" className="text-[#F2E3BC] hover:text-[#96BBBB] transition-colors">
                        <span className="sr-only">Twitter</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        {/* Twitter icon */}
                        </svg>
                    </a>
                    {/* Add other social icons similarly */}
                    </div>
                </div>

                {/* Links Column */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#C19875]">
                    Quick Links
                    </h3>
                    <ul className="space-y-2">
                    <li><Link to="/" className="hover:text-[#96BBBB] transition-colors">Home</Link></li>
                    <li><Link to="/" className="hover:text-[#96BBBB] transition-colors">ChatBot</Link></li>
                    <li><Link to="/other" className="hover:text-[#96BBBB] transition-colors">Other</Link></li>
                    </ul>
                </div>

                {/* Contact Column */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#C19875]">
                    Contact Us
                    </h3>
                    <address className="not-italic text-sm">
                    <p>123 AI Street</p>
                    <p>Tech City, TC 10001</p>
                    <p className="mt-2">Email: info@lumin.example</p>
                    <p>Phone: (123) 456-7890</p>
                    </address>
                </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-6 border-t border-[#618985]/30 text-sm text-center opacity-80">
                <p>&copy; {new Date().getFullYear()} Lumin. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;