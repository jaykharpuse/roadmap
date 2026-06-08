"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Users, Send, ChevronRight, Loader2 } from "lucide-react"
import axiosInstance from "@/helper/axiosInstance"
import { toast } from "sonner"

export default function ContactSupport() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await axiosInstance.post("/user/contact", formData)
      toast.success("Message sent! We'll get back to you soon.")
      setFormData({ name: "", email: "", message: "" })
    } catch {
      toast.error("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      question: "How can I create a custom roadmap?",
      answer:
        "After signing in, click 'Generate Roadmap' from the navbar. Describe your goal in plain language — for example, 'become a frontend developer in 6 months' — and Tutoreez will generate a structured roadmap with nodes, resources, and milestones. You can then edit, reorder, or add your own nodes to tailor it exactly to your situation.",
    },
    {
      question: "Is there a fee to download roadmaps?",
      answer:
        "No. All roadmaps on Tutoreez are free to view, use, and share. You can download or export any roadmap at no cost. We may introduce premium features in the future, but core roadmap access will always remain free.",
    },
    {
      question: "How do I access learning resources?",
      answer:
        "Each node in a roadmap links to curated learning resources — articles, videos, and courses. Click any node to expand it and see its resources. You can also browse the Resources page from the navbar to search across all available materials by topic or type.",
    },
  ]

  return (
    <section className="relative bg-background py-28 px-5 md:px-8 overflow-hidden">

      {/* Divider line top */}
      <div className="gradient-line w-full max-w-7xl mx-auto mb-20" />

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-orange-500/[0.05] blur-[110px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65 }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-orange-400/70 mb-3">
            Get in Touch
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold text-foreground"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Contact &{" "}
            <span className="text-gradient-brand">Support.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65 }}
          >
            <div className="glass rounded-2xl p-8 h-full">
              <h3
                className="text-xl font-semibold text-foreground mb-6"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                Send a message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-foreground/50 uppercase tracking-wider mb-2">
                    Name
                  </label>
                  <Input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="h-11 bg-muted/50 dark:bg-white/[0.04] border-border dark:border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:border-orange-500/40 focus:ring-orange-500/20 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground/50 uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="h-11 bg-muted/50 dark:bg-white/[0.04] border-border dark:border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:border-orange-500/40 focus:ring-orange-500/20 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground/50 uppercase tracking-wider mb-2">
                    Message
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="How can we help you?"
                    className="bg-muted/50 dark:bg-white/[0.04] border-border dark:border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:border-orange-500/40 focus:ring-orange-500/20 rounded-lg resize-none"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="w-full h-11 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 hover:opacity-90 transition-all duration-300 disabled:opacity-60"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Message</>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* FAQs + Community */}
          <motion.div
            className="flex flex-col gap-5"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, delay: 0.1 }}
          >
            {/* FAQs */}
            <div className="glass rounded-2xl p-8">
              <h3
                className="text-xl font-semibold text-foreground mb-5"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                FAQs
              </h3>
              <ul className="space-y-2">
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index
                  return (
                    <li key={index}>
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="group w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors duration-200 text-left"
                      >
                        <ChevronRight
                          className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${isOpen ? "rotate-90 text-orange-400" : "text-orange-400/50 group-hover:text-orange-400"}`}
                        />
                        <span className={`text-sm transition-colors duration-200 ${isOpen ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80"}`}>
                          {faq.question}
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-muted-foreground leading-relaxed pl-7 pr-3 pb-3">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Community */}
            <div className="glass rounded-2xl p-8 flex-1">
              <div className="flex flex-col items-center text-center gap-5 h-full justify-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/25 to-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-violet-400" />
                </div>

                <div>
                  <h3
                    className="text-xl font-semibold text-foreground mb-1.5"
                    style={{ fontFamily: 'Syne, sans-serif' }}
                  >
                    Join our community
                  </h3>
                  <p className="text-sm text-muted-foreground">Connect with learners on Discord or Slack</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-violet-500/[0.12] border border-violet-500/25 text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/40 transition-all duration-200"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  <Users className="w-4 h-4" />
                  Join Community
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
