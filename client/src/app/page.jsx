import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import Features from '@/components/landing/Features';
import AIShowcase from '@/components/landing/AIShowcase';
import Premium from '@/components/landing/Premium';
import Testimonials from '@/components/landing/Testimonials';
import Contact from '@/components/landing/Contact';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <AIShowcase />
      <Premium />
      <Testimonials />
      <Contact />
      <FAQ />
      <Footer />
    </main>
  );
}
