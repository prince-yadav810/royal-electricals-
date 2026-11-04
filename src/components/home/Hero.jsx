'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play } from 'lucide-react';
import { gsap } from 'gsap';

const Hero = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const imagesRef = useRef([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Array of images to cycle through - place your images in public/images/hero/
  const heroImages = [
    { src: '/images/hero/1.png', alt: 'Premium industrial materials and electrical components for Royal Electricals & Hardware projects' },
    { src: '/images/hero/2.png', alt: 'Structural steel and engineering supplies from Royal Electricals & Hardware' },
    { src: '/images/hero/3.png', alt: 'High quality safety PPE kits and factory automation equipment' },
  ];

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // Keep each glint attached near the end as its curve drifts.
      const positionGlint = (lineNumber, progress) => {
        const line = heroRef.current.querySelector(`.wavy-line-${lineNumber}`);
        const glint = heroRef.current.querySelector(`.gold-glint-${lineNumber}`);
        const point = line.getPointAtLength(line.getTotalLength() * progress);
        glint.setAttribute('transform', `translate(${point.x} ${point.y})`);
      };
      positionGlint(1, 0.9);
      positionGlint(2, 0.94);

      // Initial animation timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(titleRef.current, {
        y: isMobile ? 40 : 100,
        opacity: 0,
        duration: isMobile ? 0.6 : 1,
        delay: 0.2,
      })
        .from(
          subtitleRef.current,
          {
            y: isMobile ? 25 : 50,
            opacity: 0,
            duration: isMobile ? 0.5 : 0.8,
          },
          '-=0.5'
        )
        .from(
          ctaRef.current,
          {
            y: isMobile ? 15 : 30,
            opacity: 0,
            duration: isMobile ? 0.5 : 0.8,
          },
          '-=0.5'
        );

      // Floating animation for glass cards — skip on mobile for performance
      if (!isMobile) {
        gsap.to('.glass-float', {
          y: -20,
          duration: 3,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          stagger: 0.5,
        });

        // Animation for wavy lines — skip on mobile
        gsap.to('.wavy-line-1', {
          attr: { d: 'M0,100 C30,50 50,90 100,0' },
          duration: 10,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          onUpdate: () => positionGlint(1, 0.9),
        });

        gsap.to('.wavy-line-2', {
          attr: { d: 'M0,100 C40,95 60,70 100,30' },
          duration: 8,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 1,
          onUpdate: () => positionGlint(2, 0.94),
        });
      }

      // Initial setup for images - hide all except first
      imagesRef.current.forEach((img, index) => {
        if (img) {
          gsap.set(img, {
            opacity: index === 0 ? 1 : 0,
            scale: index === 0 ? 1 : 0.8,
            x: index === 0 ? 0 : 100,
          });
        }
      });
    }, heroRef);

    return () => {
      // Kill all GSAP animations immediately
      gsap.killTweensOf('.glass-float');
      gsap.killTweensOf('.wavy-line-1');
      gsap.killTweensOf('.wavy-line-2');
      if (titleRef.current) gsap.killTweensOf(titleRef.current);
      if (subtitleRef.current) gsap.killTweensOf(subtitleRef.current);
      if (ctaRef.current) gsap.killTweensOf(ctaRef.current);
      imagesRef.current.forEach(img => {
        if (img) gsap.killTweensOf(img);
      });

      // Revert the GSAP context
      ctx.revert();
    };
  }, []);

  // Animated image cycling effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const nextIndex = (prev + 1) % heroImages.length;

        // Animate out current image
        if (imagesRef.current[prev]) {
          gsap.to(imagesRef.current[prev], {
            opacity: 0,
            scale: 0.8,
            x: -100,
            duration: 0.8,
            ease: 'power2.in',
          });
        }

        // Animate in next image
        if (imagesRef.current[nextIndex]) {
          gsap.fromTo(
            imagesRef.current[nextIndex],
            {
              opacity: 0,
              scale: 0.8,
              x: 100,
            },
            {
              opacity: 1,
              scale: 1,
              x: 0,
              duration: 0.8,
              ease: 'power2.out',
              delay: 0.2,
            }
          );
        }

        return nextIndex;
      });
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100"
    >
      {/* Animated Background Elements — hidden on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden hidden md:block">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '4s' }}></div>

        {/* Floating Wavy Lines */}
        <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="hero-gold-line" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#99651b" stopOpacity="0.15" />
              <stop offset="18%" stopColor="#b88628" stopOpacity="0.65" />
              <stop offset="36%" stopColor="#e6ba58" />
              <stop offset="44%" stopColor="#fff4c5" />
              <stop offset="53%" stopColor="#c99532" stopOpacity="0.9" />
              <stop offset="73%" stopColor="#b78020" stopOpacity="0.8" />
              <stop offset="88%" stopColor="#f5cf72" />
              <stop offset="94%" stopColor="#fff8dc" />
              <stop offset="100%" stopColor="#bb8525" stopOpacity="0.35" />
            </linearGradient>
            <radialGradient id="hero-gold-flare">
              <stop offset="0%" stopColor="#fffdf0" />
              <stop offset="15%" stopColor="#ffe4a0" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#efbb4b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#efbb4b" stopOpacity="0" />
            </radialGradient>
            <filter id="hero-gold-glow" filterUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120" colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.32" result="softGlow" />
              <feDropShadow in="SourceGraphic" dx="0" dy="0" stdDeviation="0.12" floodColor="#dba638" floodOpacity="0.5" result="goldHalo" />
              <feMerge>
                <feMergeNode in="softGlow" />
                <feMergeNode in="goldHalo" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            className="wavy-line-1"
            d="M0,100 C30,60 50,80 100,0"
            fill="none"
            stroke="url(#hero-gold-line)"
            strokeWidth="1.8"
            filter="url(#hero-gold-glow)"
            vectorEffect="non-scaling-stroke"
          />
          <path
            className="wavy-line-2"
            d="M0,100 C40,90 60,60 100,20"
            fill="none"
            stroke="url(#hero-gold-line)"
            strokeWidth="1.4"
            filter="url(#hero-gold-glow)"
            vectorEffect="non-scaling-stroke"
          />
          {[1, 2].map((lineNumber) => (
            <g key={lineNumber} className={`gold-glint-${lineNumber}`}>
              <g transform={lineNumber === 2 ? 'scale(0.75)' : undefined}>
                <ellipse rx="2.4" ry="2.8" fill="url(#hero-gold-flare)" />
                <path d="M-1.65,0 L-0.14,-0.12 L0,-1.3 L0.14,-0.12 L1.65,0 L0.14,0.12 L0,1.3 L-0.14,0.12 Z" fill="#fff9df" />
                <circle r="0.12" fill="#ffffff" />
              </g>
            </g>
          ))}
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-[99px] md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">

            {/* Main Title */}
            <h1
              id="hero-headline"
              ref={titleRef}
              className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold mb-6 leading-[1.08] tracking-tight"
            >
              <span className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 bg-clip-text text-transparent">
                Electrical &amp; Hardware Solutions
              </span>
              <br />
              <span className="text-secondary-600">Since 2000.</span>
            </h1>

            {/* Subtitle */}
            <p
              ref={subtitleRef}
              className="text-xl md:text-2xl text-gray-600 mb-0 md:mb-12 max-w-3xl mx-auto lg:mx-0 leading-relaxed"
            >
              Your trusted supplier and distributor of electrical and hardware essentials.
              Serving <span className="font-semibold text-primary-700">50+ clients</span> with
              <span className="font-semibold text-primary-700"> 1000+ products</span> from leading brands.
            </p>

            {/* CTAs */}
            <div ref={ctaRef} className="hidden md:flex flex-col sm:flex-row items-center lg:items-start lg:justify-start justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                href="/contact"
                className="group px-8 py-4 bg-gradient-to-r from-secondary-500 to-secondary-700 text-white rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Request Quote</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/products"
                className="group px-8 py-4 bg-white/60 backdrop-blur-sm text-gray-900 rounded-full font-semibold text-lg border-2 border-gray-200 hover:border-primary-500 hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <span>View Catalog</span>
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>
            </div>

            {/* Stats with Glass Effect */}
            <div className="mt-10 lg:mt-16 grid grid-cols-3 gap-3">
              {[
                { value: '50+', label: 'Clients' },
                { value: '1000+', label: 'Products' },
                { value: '2000', label: 'Established' },
              ].map((stat, index) => (
                <div key={index} className="glass-float">
                  <div className="relative h-20 lg:h-24 rounded-xl backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/30 shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
                    {/* Liquid glass shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-transparent pointer-events-none"></div>
                    {/* Bottom gradient for depth */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/5 to-transparent pointer-events-none"></div>
                    <div className="relative h-full flex flex-col items-center justify-center p-2 lg:p-3">
                      <div className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent mb-1">
                        {stat.value}
                      </div>
                      <div className="text-[10px] lg:text-xs text-gray-800 font-semibold text-center leading-tight">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Animated Images */}
          <div className="relative block -mt-12 lg:-mt-12">
            <div className="relative w-full h-[300px] lg:h-[600px]">
              {/* Decorative Elements — hidden on mobile */}
              <div className="hidden md:block absolute -top-4 -right-4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
              <div className="hidden md:block absolute -bottom-4 -left-4 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

              {/* Image Container with Stacked Effect */}
              <div className="relative w-full h-full flex items-center justify-center">
                {heroImages.map((image, index) => (
                  <div
                    key={index}
                    ref={(el) => (imagesRef.current[index] = el)}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      willChange: 'transform, opacity',
                    }}
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Clean Image Display */}
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        priority={index === 0}
                        className="object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Indicators */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {heroImages.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${index === currentImageIndex
                      ? 'w-8 bg-primary-600'
                      : 'w-2 bg-gray-300'
                      }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>


    </section>
  );
};

export default Hero;
