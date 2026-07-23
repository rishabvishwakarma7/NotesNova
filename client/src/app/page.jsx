import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import AIShowcase from '@/components/landing/AIShowcase';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <AIShowcase />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
