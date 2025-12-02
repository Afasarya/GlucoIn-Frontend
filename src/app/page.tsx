import Image from "next/image";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Hero from "./components/home/Hero";
import WhyChoose from "./components/home/WhyChoose";
import Workflow from "./components/home/Workflow";
import Faq from "./components/home/Faq";
import Cta from "./components/home/Cta";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Background Ellipse - Left Side (Hero) */}
      <div 
        className="pointer-events-none absolute -left-16 -top-16 h-[500px] w-[500px] sm:-left-24 sm:-top-24 sm:h-[600px] sm:w-[600px] md:h-[700px] md:w-[700px] lg:-left-32 lg:-top-32 lg:h-[900px] lg:w-[900px] xl:-left-40 xl:-top-40 xl:h-[1000px] xl:w-[1000px]"
        aria-hidden="true"
      >
        <Image
          src="/images/assets/elipse-home.png"
          alt=""
          fill
          className="object-cover object-right-bottom"
          priority
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <WhyChoose />
          
          {/* Workflow & FAQ Section with Ellipse Background */}
          <div className="relative">
            {/* Background Ellipse - Left Side (between Workflow and FAQ) */}
            <div 
              className="pointer-events-none absolute -left-16 top-1/4 h-[500px] w-[500px] sm:-left-24 sm:h-[600px] sm:w-[600px] md:h-[700px] md:w-[700px] lg:-left-32 lg:h-[900px] lg:w-[900px] xl:-left-40 xl:h-[1000px] xl:w-[1000px]"
              aria-hidden="true"
            >
              <Image
                src="/images/assets/elipse-faq.png"
                alt=""
                fill
                className="object-cover object-right-bottom"
              />
            </div>
            
            <div className="relative z-10">
              <Workflow />
              <Faq />
            </div>
          </div>
          
          <Cta />
        </main>
        <Footer />
      </div>
    </div>
  );
}
