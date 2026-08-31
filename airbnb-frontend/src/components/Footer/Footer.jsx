/**
 * components/Footer/Footer.jsx
 * Static footer with 4 column link grid and copyright bar.
 */
import React from 'react';
import './Footer.css';

const footerLinks = [
  {
    heading: 'Support',
    links: ['Help Centre', 'AirCover', 'Anti-discrimination', 'Disability support', 'Cancellation options', 'Report neighbourhood concern'],
  },
  {
    heading: 'Community',
    links: ['Airbnb.org: disaster relief', 'Support Afghan refugees', 'Celebrating diversity & belonging', 'Combating discrimination'],
  },
  {
    heading: 'Hosting',
    links: ['Try hosting', 'AirCover for Hosts', 'Explore hosting resources', 'Visit our community forum', 'How to host responsibly'],
  },
  {
    heading: 'Airbnb',
    links: ['Newsroom', 'Learn about new features', 'Letter from our founders', 'Careers', 'Investors', 'Gift cards'],
  },
];

const Footer = () => (
  <footer className="footer" aria-label="Footer">
    {/* Links grid */}
    <div className="footer-grid container">
      {footerLinks.map((col) => (
        <div key={col.heading} className="footer-col">
          <h3 className="footer-heading">{col.heading}</h3>
          <ul>
            {col.links.map((link) => (
              <li key={link}>
                <a href="#!" className="footer-link">{link}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    {/* Copyright bar */}
    <div className="footer-bottom">
      <div className="footer-bottom-inner container">
        <div className="footer-copyright">
          <span>© 2024 Airbnb Clone, Inc.</span>
          <a href="#!">Privacy</a>
          <span>·</span>
          <a href="#!">Terms</a>
          <span>·</span>
          <a href="#!">Sitemap</a>
          <span>·</span>
          <a href="#!">Company details</a>
        </div>
        <div className="footer-right">
          <div className="footer-lang">
            <span>🌐</span>
            <a href="#!">English (ZA)</a>
          </div>
          <div className="footer-currency">
            <a href="#!">R ZAR</a>
          </div>
          <div className="footer-social">
            <a href="#!" aria-label="Facebook">📘</a>
            <a href="#!" aria-label="Twitter">🐦</a>
            <a href="#!" aria-label="Instagram">📷</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
