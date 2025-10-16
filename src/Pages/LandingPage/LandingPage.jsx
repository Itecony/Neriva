import react from "react";
import Topbar from "./Topbar";
import HeroSection from "./HeroSection";
import FeaturesSection from "./KeyFeatures";
import StatsAndTestimonials from "./StatsAndTestimonials";

import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <StatsAndTestimonials />
      </main>
      <Footer />
    </div>
  );
}