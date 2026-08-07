import Hero from '@/components/sections/Hero';
import InfoBar from '@/components/sections/InfoBar';
import Services from '@/components/sections/Services';
import HowItWorks from '@/components/sections/HowItWorks';
import WhyChoose from '@/components/sections/WhyChoose';
import Pricing from '@/components/sections/Pricing';
import BookingForm from '@/components/sections/BookingForm';
import Gallery from '@/components/sections/Gallery';
import About from '@/components/sections/About';
import Reviews from '@/components/sections/Reviews';
import FAQ from '@/components/sections/FAQ';
import Contact from '@/components/sections/Contact';
import Commercial from '@/components/sections/Commercial';

export default function Home() {
  return (
    <main>
      <Hero />
      <InfoBar />
      <Services />
      <HowItWorks />
      <About />
      <WhyChoose />
      <Pricing />
      <BookingForm />
      <Gallery />
      <Commercial />
      <Reviews />
      <FAQ />
      <Contact />
    </main>
  );
}
