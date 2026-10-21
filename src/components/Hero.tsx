'use client'

import { motion } from 'framer-motion'
import { Volume2, VolumeX, Menu, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function Hero() {
  const [isMuted, setIsMuted] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50) // Show background after 50px scroll
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Ensure video is muted immediately on load and handle browser power-saving pauses gracefully
  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl) return

    videoEl.volume = 0
    videoEl.muted = true
    videoEl.defaultMuted = true

    const safePlay = () => {
      if (!videoEl || document.hidden) return
      const playPromise = videoEl.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Browsers may pause background video-only media to save power; ignore benign AbortError
        })
      }
    }

    const handlePlay = () => {
      videoEl.muted = isMuted
      videoEl.volume = isMuted ? 0 : 0.7
    }

    const handleTimeUpdate = () => {
      if (videoEl.currentTime >= 51.4) {
        videoEl.currentTime = 0
        safePlay()
      }
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && videoEl.paused) {
        safePlay()
      }
    }

    videoEl.addEventListener('play', handlePlay)
    videoEl.addEventListener('timeupdate', handleTimeUpdate)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    safePlay()

    return () => {
      videoEl.removeEventListener('play', handlePlay)
      videoEl.removeEventListener('timeupdate', handleTimeUpdate)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Update video mute state when isMuted changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
      videoRef.current.volume = isMuted ? 0 : 0.7
    }
  }, [isMuted])

  // Handle body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Close mobile menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      window.addEventListener('scroll', handleScroll)
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isMobileMenuOpen])



  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* MASSIVE VIDEO - Takes up 95% of space */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover scale-110"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/hero-video.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>

      {/* Full-Width Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="fixed top-0 left-0 right-0 w-full z-[110]"
      >
        <div 
          className={`w-full px-6 sm:px-8 lg:px-12 py-4 transition-all duration-300 ease-out ${
            isScrolled 
              ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' 
              : 'bg-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center cursor-pointer"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <span className="font-bagel text-white text-lg sm:text-xl tracking-wider uppercase">
                CREATE YOUR OWN AFFILIATE STORE
              </span>
            </motion.div>

            {/* Navigation Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a 
                href="#portfolio" 
                className="text-white hover:text-white/80 font-medium gentle-animation hover:scale-105"
              >
                Experience
              </a>
              <a 
                href="#about" 
                className="text-white hover:text-white/80 font-medium gentle-animation hover:scale-105"
              >
                Auto-Import
              </a>
              <a 
                href="#services" 
                className="text-white hover:text-white/80 font-medium gentle-animation hover:scale-105"
              >
                Capabilities
              </a>
              <a 
                href="#pricing" 
                className="text-white hover:text-white/80 font-medium gentle-animation hover:scale-105"
              >
                Pricing
              </a>
              <a 
                href="#contact" 
                className="text-white hover:text-white/80 font-medium gentle-animation hover:scale-105"
              >
                Ownership
              </a>
            </div>

            {/* Right Side - Video Controls + Mobile Menu */}
            <div className="flex items-center space-x-3 relative">
              {/* Video Controls with Sound On indicator */}
              <div className="relative">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="glass-effect p-3 rounded-full text-white hover:bg-white/20 gentle-animation cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                
                {/* Sound On indicator - only show when muted */}
                {isMuted && (
                  <div className="absolute -bottom-10 right-0 flex items-center text-white/80">
                    <span className="whitespace-nowrap font-medium text-sm mr-2">Sound On</span>
                    <span className="text-lg">↗</span>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden glass-effect p-3 rounded-full text-white hover:bg-white/20 active:bg-white/30 gentle-animation cursor-pointer z-[120] relative"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-md z-[80] cursor-pointer"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isMobileMenuOpen ? '0%' : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="md:hidden fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-black/90 backdrop-blur-xl border-l border-white/10 z-[90] mobile-menu-panel pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Close Button at the top */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="glass-effect p-3 rounded-full text-white hover:bg-white/20 active:bg-white/30 gentle-animation cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-col px-6 pb-6 h-full">
            {/* Mobile Navigation Links */}
            <div className="flex flex-col space-y-4 text-white">
              <a 
                href="#portfolio" 
                className="mobile-menu-link px-4 py-3 hover:text-white/80 hover:bg-white/10 rounded-lg gentle-animation font-medium text-lg active:bg-white/20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Experience
              </a>
              <a 
                href="#about" 
                className="mobile-menu-link px-4 py-3 hover:text-white/80 hover:bg-white/10 rounded-lg gentle-animation font-medium text-lg active:bg-white/20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Auto-Import
              </a>
              <a 
                href="#services" 
                className="mobile-menu-link px-4 py-3 hover:text-white/80 hover:bg-white/10 rounded-lg gentle-animation font-medium text-lg active:bg-white/20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Capabilities
              </a>
              <a 
                href="#pricing" 
                className="mobile-menu-link px-4 py-3 hover:text-white/80 hover:bg-white/10 rounded-lg gentle-animation font-medium text-lg active:bg-white/20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a 
                href="#contact" 
                className="mobile-menu-link px-4 py-3 hover:text-white/80 hover:bg-white/10 rounded-lg gentle-animation font-medium text-lg active:bg-white/20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Ownership
              </a>
            </div>

            {/* Mobile CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('select-onboarding-intent', { detail: 'free_prototype' }))
                const contactSection = document.getElementById('contact')
                contactSection?.scrollIntoView({ behavior: 'smooth' })
                setIsMobileMenuOpen(false)
              }}
              className="bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-700 active:bg-red-800 gentle-animation mt-8 cursor-pointer"
            >
              Register Free Prototype
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Big Studio Title - Lower Left */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-6 sm:left-8 lg:left-12 z-30 pointer-events-none"
      >
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight text-white">
            <span className="block">ONE LINK FOR YOUR</span>
            <span className="block">ENTIRE AFFILIATE</span>
            <span className="block">STOREFRONT</span>
          </h1>
        </div>
      </motion.div>

      {/* Center Main Screen CTA Button - Clean & Unobstructed */}
      <div className="absolute inset-x-0 top-[44%] -translate-y-1/2 flex items-center justify-center z-50 pointer-events-none px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="pointer-events-auto flex flex-col items-center text-center"
        >
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('select-onboarding-intent', { detail: 'free_prototype' }))
              const contactSection = document.getElementById('contact')
              contactSection?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-black text-base sm:text-lg md:text-xl px-8 sm:px-10 py-4 sm:py-5 rounded-xl shadow-[0_20px_50px_rgba(220,38,38,0.5)] border border-white/20 backdrop-blur-md gentle-animation cursor-pointer tracking-wide"
          >
            Register Free Prototype
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}