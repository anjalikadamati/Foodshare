import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroWoman from "../assets/hero-woman.png";
import "../styles/Hero.css"


function Hero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);


  return (
    <section className="hero">
      <div className="container">
        <div className={`hero-content ${visible ? "visible" : ""}`}>
          <h1 className="hero-title">
            Let's tranform <br />
            the world;<br />
            From Hungry to<br />
            <span className="highlight">Hunger-Free</span>
          </h1>

          <p className="hero-text">
            Where almost <strong>hundreds of millions</strong> of people are starving daily,
            but millions of tons of edible food go into the trash
            every day! <strong> FoodShare</strong> is on a mission to meet both
            worlds by creating a bridge to donate and receive
            food that's otherwise wasted!
          </p>

          <Link to="/signup"><button className="btn btn-primary btn-large">
            Start Donating
          </button> </Link>
        </div>

        <div className={`hero-image ${visible ? "visible" : ""}`}>
          <div className="hero-image-wrapper">
            <div className="hero-blob"></div>
            <img src={heroWoman} alt="Woman holding donation box" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
