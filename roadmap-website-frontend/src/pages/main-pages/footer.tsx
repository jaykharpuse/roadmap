"use client"

import { motion } from "framer-motion"

import { Linkedin, Github, Twitter } from "lucide-react"
import { Link } from "react-router-dom"

export default function FooterSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  const socialLinks = [
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "#",
      color: "hover:text-[#0077B5]",
    },
    {
      name: "GitHub",
      icon: Github,
      href: "#",
      color: "hover:text-gray-900",
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: "#",
      color: "hover:text-[#1DA1F2]",
    },
  ]

  const footerLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Use", href: "#" },
    { name: "Careers", href: "#" },
  ]

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-white py-16 px-4 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Links Section */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Links</h3>
            <nav className="space-y-4">
              {footerLinks.map((link, index) => (
                <motion.div key={index} whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <Link
                    to={link.href}
                    className="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors duration-200 block"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>

          {/* Social Links Section */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Social Links</h3>
            <div className="flex space-x-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className={`text-[#3B82F6] ${social.color} transition-colors duration-200`}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <social.icon className="w-8 h-8" />
                  <span className="sr-only">{social.name}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          className="mt-12 pt-8 border-t border-gray-200 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="text-gray-600">© 2024 Roadmap Generator. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  )
}
