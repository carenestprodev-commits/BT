/* eslint-disable no-unused-vars */
import Container from "../../Layout/Container/Container";
import Academy from "./Academy";
import Footer from "./Footer";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import Mobile from "./Mobile";
import Navbar from "./Navbar";
import Review from "./Review";
import WhatWeDo from "./WhatWeDo";
import WhyChooseUs from "./WhyChooseUs";

const Home = () => {
  return (
    <div className="dark:bg-white">
      <Navbar />
      {/* Hero Section */}
      <Hero />
      {/* What We Do Section */}
      <WhatWeDo />
      <HowItWorks />
      <WhyChooseUs />
      <Academy />
      <Review />
      <Mobile />
      <Footer />
    </div>
  );
};

export default Home;
