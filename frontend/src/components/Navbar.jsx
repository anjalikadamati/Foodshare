import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png"
import "../styles/Navbar.css"

function Navbar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <nav className={`navbar ${visible ? "visible" : ""}`}>
      <div className="container">
        <img src={logo} alt="Woman holding donation box" />

        <ul className="navbar-links">
          <li><a href="#how">How it works</a></li>
          <li><a href="#problem">The problem</a></li>
          <li><a href="#donate">How to donate</a></li>
        </ul>

        <div className="navbar-buttons">
          <Link to="/signup" className="btn btn-outline">Sign Up</Link>
          <Link to="/login" className="btn btn-primary">Donate</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
