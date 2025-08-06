import React from 'react';
import { Link } from 'react-router-dom';
import { BiEnvelope, BiPhone, BiMap } from 'react-icons/bi';
import { FaFacebookF, FaInstagram, FaTwitter, FaPinterestP, FaCcVisa, FaCcMastercard, FaCcPaypal } from 'react-icons/fa';
import './../styles/Footer.css';


const Footer = () => {
  return (
    <footer className="site-footer" style={{ fontFamily: 'Tajawal, Cairo, sans-serif', backgroundColor: '#23272f', color: '#f8f9fa', padding: '2rem 0' }}>
      <div className="container">
        <div className="row g-5">
          {/* About Column */}
          <div className="col-lg-4 col-md-12">
            <h5 className="footer-brand mb-3" style={{ fontSize: '1.5rem', fontWeight: '700', color: '#007bff' }}>لمسة روز</h5>
            <p className="footer-text mb-4" style={{ fontSize: '1rem', lineHeight: '1.6', color: '#e0e6ed' }}>
              متجرك الشامل لأدوات التجميل عالية الجودة. نحن ملتزمون بتقديم الأفضل لك في مستحضرات التجميل والعناية بالبشرة.
            </p>
            <div className="social-icons" style={{ display: 'flex', gap: '1rem' }}>
              <a href="#" className="social-icon" style={{ color: '#007bff', fontSize: '1.2rem' }}><FaFacebookF /></a>
              <a href="#" className="social-icon" style={{ color: '#007bff', fontSize: '1.2rem' }}><FaInstagram /></a>
              <a href="#" className="social-icon" style={{ color: '#007bff', fontSize: '1.2rem' }}><FaTwitter /></a>
              <a href="#" className="social-icon" style={{ color: '#007bff', fontSize: '1.2rem' }}><FaPinterestP /></a>
            </div>
          </div>

          {/* Links Column */}
          <div className="col-lg-2 col-md-6">
            <h5 className="footer-title">روابط سريعة</h5>
            <ul className="list-unstyled footer-links">
              <li><Link to="/">الرئيسية</Link></li>
              <li><Link to="/products">المنتجات</Link></li>
              <li><Link to="/about">عن المتجر</Link></li>
              <li><Link to="/contact">اتصل بنا</Link></li>
              <li><Link to="/faq">الأسئلة الشائعة</Link></li>
            </ul>
          </div>

          {/* Customer Service Column */}
          <div className="col-lg-2 col-md-6">
            <h5 className="footer-title">خدمة العملاء</h5>
            <ul className="list-unstyled footer-links">
              <li><Link to="/my-account">حسابي</Link></li>
              <li><Link to="/track-order">تتبع الطلب</Link></li>
              <li><Link to="/return-policy">سياسة الإرجاع</Link></li>
              <li><Link to="/privacy-policy">سياسة الخصوصية</Link></li>
            </ul>
          </div>

          {/* Contact Info Column */}
          <div className="col-lg-4 col-md-12">
            <h5 className="footer-title">تواصل معنا</h5>
            <ul className="list-unstyled contact-info">
              <li>
                <BiMap className="icon" />
                <span>123 شارع الجمال، الرياض، المملكة العربية السعودية</span>
              </li>
              <li>
                <BiPhone className="icon" />
                <a href="tel:+966123456789">+966 12 345 6789</a>
              </li>
              <li>
                <BiEnvelope className="icon" />
                <a href="mailto:info@lamasarose.com">info@lamasarose.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} لمسة روز. جميع الحقوق محفوظة.
          </p>
          <div className="payment-icons">
            <FaCcVisa size={28} title="Visa" />
            <FaCcMastercard size={28} title="Mastercard" />
            <FaCcPaypal size={28} title="PayPal" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;