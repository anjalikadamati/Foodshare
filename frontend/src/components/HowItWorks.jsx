import { useState, useEffect, useRef } from "react";
import "../styles/Howitworks.css"

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

function HowItWorks() {
  const header = useScrollAnimation();
  const card1 = useScrollAnimation();
  const card2 = useScrollAnimation();

  const providerSteps = [
    { title: "List Available Food", text: "Upload details and photos of your surplus food items quickly." },
    { title: "Receive Requests", text: "Local organizations and individuals will notify you when they need it." },
    { title: "Coordinate Pickup", text: "Arrange a seamless handoff or delivery at your convenience." },
  ];

  const recipientSteps = [
    { title: "Browse Available Food", text: "Search for fresh, healthy food items available in your neighborhood." },
    { title: "Request Food Items", text: "Simply select the items you need and submit a request to the provider." },
    { title: "Collect & Distribute", text: "Pick up the food and share it with your family or community members." },
  ];

  return (
    <section className="how-it-works" id="donate">
      <div className="container">
        {/* Header */}
        <div ref={header.ref} className={`how-it-works-header ${header.visible ? "visible" : ""}`}>
          <p className="how-it-works-badge">Simple Process</p>
          <h2 className="how-it-works-title">
            I want to donate. <span className="highlight"> But how ? </span>
          </h2>
          <div className="how-it-works-line"></div>
        </div>

        {/* Cards */}
        <div className="how-it-works-cards">
          {/* Provider Card */}
          <div ref={card1.ref} className={`how-card ${card1.visible ? "visible" : ""}`}>
            <div className="how-card-icon">
              <div className="how-card-icon-inner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
            </div>
            <h3>For Food Providers</h3>
            <div className="how-steps">
              {providerSteps.map((step, i) => (
                <div key={step.title} className="how-step">
                  <div className="how-step-number">{i + 1}</div>
                  <div>
                    <h4>{step.title}</h4>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recipient Card */}
          <div ref={card2.ref} className={`how-card ${card2.visible ? "visible" : ""}`} style={{ transitionDelay: "150ms" }}>
            <div className="how-card-icon">
              <div className="how-card-icon-inner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
              </div>
            </div>
            <h3>For Food Recipients</h3>
            <div className="how-steps">
              {recipientSteps.map((step, i) => (
                <div key={step.title} className="how-step">
                  <div className="how-step-number">{i + 1}</div>
                  <div>
                    <h4>{step.title}</h4>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
