'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Zap, Lock, DollarSign, Menu, X, Facebook, Twitter, Instagram, Linkedin, Smile } from "lucide-react"
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from "./components/ThemeToggle"
import { useRouter } from 'next/navigation'

const StaticBanner = () => {
  return (
    <div className="w-full bg-black text-white py-2 text-center text-sm font-medium">
      🎉 Special offer: Get 50% off on all plans for a limited time! 🎉
    </div>
  )
}

const LogoBanner = () => {
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 py-8 overflow-hidden">
      <h2 className="text-2xl font-bold text-center mb-6">Our Trusted Partners</h2>
      <div className="flex animate-scroll whitespace-nowrap">
        {['/buff-logo.png', '/chatbase-logo.png', '/betashares-logo.png', '/mozilla-logo.png', '/1password-logo.png', '/pwc-logo.png', '/pika-logo.png'].map((src, index) => (
          <Image key={index} src={src} alt={`Partner ${index + 1}`} width={100} height={50} className="mx-8 opacity-50 hover:opacity-100 transition-opacity inline-block" />
        ))}
        {['/buff-logo.png', '/chatbase-logo.png', '/betashares-logo.png', '/mozilla-logo.png', '/1password-logo.png', '/pwc-logo.png', '/pika-logo.png'].map((src, index) => (
          <Image key={index + 7} src={src} alt={`Partner ${index + 8}`} width={100} height={50} className="mx-8 opacity-50 hover:opacity-100 transition-opacity inline-block" />
        ))}
      </div>
    </div>
  )
}

const TestimonialSection = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              quote: "PennyGo transformed our online presence. It's incredibly easy to use and the results are stunning!",
              author: "Sarah Johnson",
              role: "Small Business Owner"
            },
            {
              quote: "I never thought I could have such a professional website without hiring a developer. PennyGo made it possible!",
              author: "Michael Chen",
              role: "Freelance Photographer"
            },
            {
              quote: "The customer support is outstanding. They helped me every step of the way to create my dream website.",
              author: "Emily Rodriguez",
              role: "Startup Founder"
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <p className="text-gray-600 dark:text-gray-300 mb-4">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mr-4"></div>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .animate-scroll {
        animation: scroll 40s linear infinite;
      }
      @keyframes gradientChange {
        0%, 100% { background-image: linear-gradient(45deg, #ff6b6b, #feca57); }
        25% { background-image: linear-gradient(45deg, #48dbfb, #ff9ff3); }
        50% { background-image: linear-gradient(45deg, #54a0ff, #5f27cd); }
        75% { background-image: linear-gradient(45deg, #ff6b6b, #ff9ff3); }
      }
      @keyframes disappear {
        0%, 90%, 100% { opacity: 1; transform: scale(1) rotate(0deg); filter: blur(0); }
        95% { opacity: 0; transform: scale(1.2) rotate(5deg); filter: blur(10px); }
      }
      .animate-pennygo {
        animation: gradientChange 4s infinite, disappear 4s infinite;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        display: inline-block;
        transition: all 0.3s ease;
      }
      .animate-pennygo:hover {
        transform: scale(1.1);
        filter: brightness(1.2);
      }
      @keyframes iconColorChange {
        0%, 100% { color: #ff6b6b; }
        25% { color: #48dbfb; }
        50% { color: #54a0ff; }
        75% { color: #ff9ff3; }
      }
      .animate-icon {
        animation: iconColorChange 4s infinite;
      }
      @keyframes jump {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      .animate-jump {
        animation: jump 1s ease-in-out infinite;
      }
      @keyframes buttonColorChange {
        0%, 100% { background-image: linear-gradient(45deg, #ff6b6b, #feca57); }
        25% { background-image: linear-gradient(45deg, #48dbfb, #ff9ff3); }
        50% { background-image: linear-gradient(45deg, #54a0ff, #5f27cd); }
        75% { background-image: linear-gradient(45deg, #ff6b6b, #ff9ff3); }
      }
      .animate-button {
        animation: buttonColorChange 8s infinite;
        background-size: 200% 200%;
        background-position: 0 0;
        color: white;
        transition: all 0.3s ease;
      }
      .animate-button:hover {
        background-size: 100% 100%;
      }
      @keyframes colorfulText {
        0%, 100% { color: #ff6b6b; }
        25% { color: #48dbfb; }
        50% { color: #54a0ff; }
        75% { color: #ff9ff3; }
      }
      .animate-colorful-text {
        animation: colorfulText 8s infinite;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const handleRegister = () => {
    router.push('/signup')
  }

  const products = [
    {
      title: "City Explorer Package",
      description: "Discover hidden gems in vibrant urban landscapes",
      image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      features: ["Guided city tours", "Local cuisine experiences", "Cultural workshops"]
    },
    {
      title: "Mountains and Hill",
      description: "Immerse yourself in breathtaking natural wonders",
      image: "https://images.unsplash.com/photo-1682686581362-796145f0e123?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      features: ["Scenic hiking trails", "Wildlife spotting", "Eco-friendly accommodations"]
    },
    {
      title: "Beach and Resort",
      description: "Relax and unwind in tropical paradise",
      image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      features: ["Pristine beaches", "Luxury resorts", "Water sports activities"]
    }
  ]

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <StaticBanner />
      <header className="w-full fixed top-8 z-50 p-2">
        <div className="container mx-auto px-4">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full mt-4 px-4 py-2 md:px-6 md:py-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4 md:gap-6">
              <Link className="flex items-center justify-center" href="#">
                <Image src="/logo.png" alt="PennyGo" width={75} height={75} className="mr-2 animate-jump" />
                <span className="font-bold hidden sm:inline animate-pennygo">PennyGo</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
                  Features
                </Link>
                <Link className="text-sm font-medium hover:text-primary transition-colors" href="#pricing">
                  Pricing
                </Link>
                <Link className="text-sm font-medium hover:text-primary transition-colors" href="#contact">
                  Contact
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/signin">
                <button className="hidden md:inline-flex px-6 py-3 text-white rounded-full animate-button text-base font-semibold">
                  Sign In
                </button>
              </Link>
              <Link href="/signup">
                <button className="hidden md:inline-flex px-6 py-3 text-black dark:text-white rounded-full hover:text-primary transition-colors duration-300 text-base font-semibold border border-current">
                  Sign Up
                </button>
              </Link>
              <button className="md:hidden p-2 rounded-full bg-gray-200" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden mt-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg p-4">
              <nav className="flex flex-col gap-4">
                <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </Link>
                <Link className="text-sm font-medium hover:text-primary transition-colors" href="#pricing" onClick={() => setMobileMenuOpen(false)}>
                  Pricing
                </Link>
                <Link className="text-sm font-medium hover:text-primary transition-colors" href="#contact" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </Link>
                <Link href="/signin">
                  <button className="w-full px-6 py-3 text-white rounded-full animate-button text-base font-semibold">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="w-full px-6 py-3 text-black dark:text-white rounded-full hover:text-primary transition-colors duration-300 text-base font-semibold border border-current">
                    Sign Up
                  </button>
                </Link>
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center pt-32">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center">
          <div className="container px-4 md:px-6 max-w-5xl">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  <span className="animate-pennygo">PennyGo</span> – Where Joiners Meet Journeys.
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                It emphasizes both the idea of joining trips and the excitement of shared travel experiences.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Button 
                  className="w-full bg-black text-white hover:bg-black/90 rounded-full" 
                  onClick={handleRegister}
                >
                  Register
                </Button>
                <p className="text-xs animate-colorful-text">
                  Meet new faces. Explore the world, one trip at a time!
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="products" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 md:mb-12">
              Explore Our Travel Experiences
            </h2>
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => (
                <div key={index} className="flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                  <div className="relative h-60 w-full">
                    <Image
                      src={product.image}
                      alt={product.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 ease-in-out transform hover:scale-105"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold mb-2">{product.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{product.description}</p>
                    <ul className="mt-auto space-y-2">
                      {product.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <svg
                            className="mr-2 h-4 w-4 text-green-500"
                            fill="none"
                            height="24"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 md:mb-12">
              Why Choose PennyGo?
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 border-gray-200 p-4 rounded-lg">
                <Smile className="h-12 w-12 animate-icon" />
                <h3 className="text-xl font-bold">No More Solo Travel</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">Even if you're traveling solo, you're never alone. Meet your tribe as you go.</p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-200 p-4 rounded-lg">
                <DollarSign className="h-12 w-12 animate-icon" />
                <h3 className="text-xl font-bold">Cost-Effective</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">Save money by pooling expenses with fellow Joiners.</p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-200 p-4 rounded-lg">
                <Zap className="h-12 w-12 animate-icon" />
                <h3 className="text-xl font-bold">Flexible & Fun</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">Join trips last-minute or plan ahead; it's travel on your terms.</p>
              </div>
            </div>
          </div>
        </section>
        <LogoBanner />
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 md:mb-12">
              Choose Your Journey
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  name: 'Solo Joiner',
                  price: '$19',
                  features: [
                    'Join up to 3 trips per month',
                    'Basic trip matching',
                    'Community forum access'
                  ]
                },
                {
                  name: 'Adventure Seeker',
                  price: '$49',
                  features: [
                    'Unlimited trip joins',
                    'Advanced trip matching',
                    'Priority support'
                  ]
                },
                {
                  name: 'Global Explorer',
                  price: 'Custom',
                  features: [
                    'Unlimited trip creation & joining',
                    'Personalized trip recommendations',
                    'Exclusive events access'
                  ]
                }
              ].map((plan, index) => (
                <div key={plan.name} className="flex flex-col p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg justify-between border border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="text-2xl font-bold text-center">{plan.name}</h3>
                    <div className="mt-4 text-center text-gray-500 dark:text-gray-400">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {index !== 2 && <span className="text-2xl">/ month</span>}
                    </div>
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <svg
                            className="text-primary mr-2 h-4 w-4"
                            fill="none"
                            height="24"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6">
                    <Button className="w-full bg-black text-white hover:bg-black/90">
                      {index === 2 ? 'Contact Us' : 'Get Started'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <TestimonialSection />
      </main>
      <footer className="w-full bg-gray-100 dark:bg-gray-900 py-12">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Features</Link></li>
                <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Pricing</Link></li>
                <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Testimonials</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">About Us</Link></li>
                <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Careers</Link></li>
                <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Blog</Link></li>
                <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Help Center</Link></li>
                <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Terms of Service</Link></li>
                <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">© 2023 PennyGo Inc. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                  <Facebook className="h-6 w-6" />
                  <span className="sr-only">Facebook</span>
                </Link>
                <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                  <Twitter className="h-6 w-6" />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                  <Instagram className="h-6 w-6" />
                  <span className="sr-only">Instagram</span>
                </Link>
                <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                  <Linkedin className="h-6 w-6" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}