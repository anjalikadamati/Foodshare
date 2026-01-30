import { useState, useEffect, useRef } from "react";
import "../styles/Features.css"

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

// Feature data
const features = [
  {
    icon: "user",
    title: "Easy Signup/Login",
    description: "Join the community seamlessly using your email or social media accounts",
  },
  {
    icon: "list",
    title: "Effortless Meal Listing",
    description: "In a handful of steps, list a meal knowing your location is only shared after you accept",
  },
  {
    icon: "search",
    title: "Search for Meals",
    description: "Browse the FoodShare community marketplace for free meals with filtering options",
  },
  {
    icon: "check",
    title: "Availability of Food",
    description: "Check real-time availability of food items in your area and get notified when new meals are listed",
  },
  {
    icon: "clock",
    title: "Check Expiry of Food",
    description: "View expiration dates and freshness indicators to ensure you receive quality meals",
  },
  {
    icon: "accept",
    title: "Accept or Reject",
    description: "Easily accept or reject meal requests with a single tap, keeping full control of your donations",
  },
];

// Icon component
function Icon({ type }) {
  const icons = {
    user: <><circle cx="12" cy="8" r="4" /><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" /></>,
    list: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h6" /></>,
    search: <><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></>,
    check: <><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
    accept: <><path d="M9 12l2 2 4-4" /><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></>,
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {icons[type]}
    </svg>
  );
}

// Feature card component
function FeatureCard({ icon, title, description, delay }) {
  const { ref, visible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`feature-card ${visible ? "visible" : ""}`}
      style={{ transitionDelay: `${delay * 100}ms` }}
    >
      <div className="feature-icon">
        <Icon type={icon} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Features() {
  const header = useScrollAnimation();

  return (
    <section className="features" id="how">
      {/* Decorative blob */}
      <div className="features-blob">
        <svg
          viewBox="0 0 600 600"
          className="blob-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#b91c1c"
            d="
              M421,63
              C511,117,575,215,559,312
              C543,409,447,504,342,543
              C237,582,123,566,69,481
              C15,396,21,270,78,176
              C135,82,331,9,421,63Z
            "
          />
        </svg>
      </div>

      <div className="container">
        {/* Header */}
        <div ref={header.ref} className={`features-header ${header.visible ? "visible" : ""}`}>
          <div className="features-badge">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>Stopping Food Waste</span>
          </div>
          <h2 className="features-title">
            How does The FoodShare App<br />
            help <span className="highlight">stop food waste?</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
