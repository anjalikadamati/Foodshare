import { useState, useEffect, useRef } from "react";
import "../styles/cta.css"

function CTA() {
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

  return (
    <section className="cta">
      <div ref={ref} className={`container ${visible ? "visible" : ""}`}>
        <h2 className="cta-title">
          Remember, your excess<br />
          food is someone's feast!<br />
          <span className="highlight">Don't waste it!</span>
        </h2>
        <button className="btn btn-primary btn-large">
          No more wasted meals!
        </button>
      </div>
    </section>
  );
}

export default CTA;
