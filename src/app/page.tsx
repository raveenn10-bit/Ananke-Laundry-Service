import Hero from '@/components/sections/Hero';
import InfoBar from '@/components/sections/InfoBar';
import Services from '@/components/sections/Services';
import Commercial from '@/components/sections/Commercial';
import HowItWorks from '@/components/sections/HowItWorks';
import About from '@/components/sections/About';
import Sustainability from '@/components/sections/Sustainability';
import WhyChoose from '@/components/sections/WhyChoose';
import Pricing from '@/components/sections/Pricing';
import Gallery from '@/components/sections/Gallery';
import Reviews from '@/components/sections/Reviews';
import FAQ from '@/components/sections/FAQ';
import Contact from '@/components/sections/Contact';

export default function Home() {
  return (
    <>
      <Hero />
      <InfoBar />
      <Services />
      <Commercial />
      <HowItWorks />
      <About />
      <Sustainability />
      <WhyChoose />
      <Pricing />
      <Gallery />
      <Reviews />
      <FAQ />
      <Contact />
    </>
  );
}
