import react from "react";
import Topbar from "./Topbar";
import HeroSection from "./HeroSection";
import FeaturesSection from "./KeyFeatures";
import ResourcesSection from "./ResourcesSection";
import MentorshipSection from "./MentorshipSection";
import NetworkingSection from "./NetworkingSection";
import StatsAndTestimonials from "./StatsAndTestimonials";

import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Topbar />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <ResourcesSection />
        <MentorshipSection />
        <NetworkingSection />
        <StatsAndTestimonials />
      </main>
      <Footer />
    </div>
  );
}