import { useState, useEffect, useRef } from "react";
import foodWaste from "../assets/food-waste.png";
import globalFoodWaste from "../assets/global-food-waste.png";
import worldHunger from "../assets/world-hunger.png";
import "../styles/Helping.css"

// Simple scroll animation hook
function useScrollAnimation() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function Helping() {
  const header = useScrollAnimation();
  const item1 = useScrollAnimation();
  const item2 = useScrollAnimation();
  const item3 = useScrollAnimation();

  return (
    <section className="helping" id="problem">
      <div className="container">
        {/* Header */}
        <div ref={header.ref} className={`helping-header ${header.visible ? "visible" : ""}`}>
          <div className="helping-icon">
            <svg viewBox="0 0 24 24">
              <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05l-5 2.84 1.06 15.1zM12.5 12.99c.28 0 .5.22.5.5v1c0 .28-.22.5-.5.5h-1c-.28 0-.5-.22-.5-.5v-1c0-.28.22-.5.5-.5h1zm0 3c.28 0 .5.22.5.5v1c0 .28-.22.5-.5.5h-1c-.28 0-.5-.22-.5-.5v-1c0-.28.22-.5.5-.5h1zm-4-3c.28 0 .5.22.5.5v1c0 .28-.22.5-.5.5h-1c-.28 0-.5-.22-.5-.5v-1c0-.28.22-.5.5-.5h1zm0 3c.28 0 .5.22.5.5v1c0 .28-.22.5-.5.5h-1c-.28 0-.5-.22-.5-.5v-1c0-.28.22-.5.5-.5h1zM5.94 22.99l1.06-15.1-5-2.84 1.71 16.48c.1.82.79 1.46 1.63 1.46h.6z" />
            </svg>
          </div>
          <h2 className="helping-title">
            The Problem solving through<br />
            <span className="highlight">The FoodShare </span>
          </h2>
        </div>

        {/* Items */}
        <div className="helping-items">
          <div ref={item1.ref} className={`helping-item ${item1.visible ? "visible" : ""}`}>
            <div className="helping-item-image">
              <div className="helping-item-circle">
                <img src={foodWaste} alt="Reduce food waste" />
              </div>
            </div>
            <div className="helping-item-content">
              <h3>Reduce food waste</h3>
              <p>Cut the food going to waste. Donate to hungry stomachs. Solve the global food crisis. End pollution.</p>
            </div>
          </div>

          <div ref={item2.ref} className={`helping-item reverse ${item2.visible ? "visible" : ""}`}>
            <div className="helping-item-image">
              <div className="helping-item-circle">
                <img src={globalFoodWaste} alt="Global food waste" />
              </div>
            </div>
            <div className="helping-item-content">
              <h3>1.3 Billion Tons</h3>
              <p className="subtitle">of food wasted globally each year</p>
              <p>Every year, one-third of all food produced for human consumption is lost or wasted globally.</p>
            </div>
          </div>

          <div ref={item3.ref} className={`helping-item ${item3.visible ? "visible" : ""}`}>
            <div className="helping-item-image">
              <div className="helping-item-circle">
                <img src={worldHunger} alt="World hunger" />
              </div>
            </div>
            <div className="helping-item-content">
              <h3>828 Million</h3>
              <p className="subtitle">people face hunger worldwide</p>
              <p>While food is wasted, millions go hungry. Together we can bridge this gap and make every meal count.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="helping-cta">
          <button className="btn btn-primary btn-large">
            Yes, I want to feed the hungry!
          </button>
        </div>
      </div>
    </section>
  );
}

export default Helping;
