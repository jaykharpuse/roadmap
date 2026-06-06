"use client"

import { motion } from "framer-motion"
import { Linkedin, Github, Twitter, Route } from "lucide-react"
import { Link } from "react-router-dom"

export default function FooterSection() {
  const footerLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Use", href: "#" },
    { name: "Careers", href: "#" },
  ]

  const socialLinks = [
    { name: "LinkedIn", icon: Linkedin, href: "#" },
    { name: "GitHub",   icon: Github,   href: "#" },
    { name: "Twitter",  icon: Twitter,  href: "#" },
  ]

  return (
    <footer className="relative bg-background px-5 md:px-8 overflow-hidden">

      {/* Top gradient line */}
      <div className="gradient-line w-full" />

      <div className="max-w-7xl mx-auto py-14">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-3"
          >
            <Link to="/" className="flex items-center gap-2.5 w-fit group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 via-rose-500 to-violet-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Route className="w-4 h-4 text-white" />
              </div>
              <span
                className="text-lg font-bold text-white tracking-tight"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                Road<span className="text-gradient-brand">Mapper</span>
              </span>
            </Link>
            <p className="text-sm text-white/35 max-w-xs leading-relaxed">
              Structured learning paths for every topic. Free, forever.
            </p>
          </motion.div>

          {/* Links + Social */}
          <motion.div
            className="flex flex-col sm:flex-row gap-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            {/* Quick Links */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-4">
                Quick Links
              </p>
              <nav className="flex flex-col gap-2.5">
                {footerLinks.map((link, i) => (
                  <motion.div key={i} whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
                    <Link
                      to={link.href}
                      className="text-sm text-white/45 hover:text-orange-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Social */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-4">
                Social
              </p>
              <div className="flex items-center gap-3">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    whileHover={{ scale: 1.15, y: -2 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ duration: 0.15 }}
                    className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/40 hover:text-orange-400 hover:border-orange-500/25 transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} RoadMapper. All rights reserved.
          </p>
          <p className="text-xs text-white/20">
            Made with ♥ for learners everywhere
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
