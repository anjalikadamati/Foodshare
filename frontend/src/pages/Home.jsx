import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Helping from "../components/Helping";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Helping />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}

export default Home;
