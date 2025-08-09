import React from 'react';
import { Link } from 'react-router-dom';
import { BiEnvelope, BiPhone, BiMap } from 'react-icons/bi';
import { FaFacebookF, FaInstagram, FaTwitter, FaPinterestP, FaCcVisa, FaCcMastercard, FaCcPaypal } from 'react-icons/fa';
import './../styles/footer.css';


const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-5">
          {/* About Column */}
          <div className="col-lg-4 col-md-12">
            <h5 className="footer-brand mb-3">لمسة روز</h5>
            <p className="footer-text mb-4">
              متجرك الشامل لأدوات التجميل عالية الجودة. نحن ملتزمون بتقديم الأفضل لك في مستحضرات التجميل والعناية بالبشرة.
            </p>
            <div className="social-icons">
              <a href="#" className="social-icon"><FaFacebookF /></a>
              <a href="#" className="social-icon"><FaInstagram /></a>
              <a href="#" className="social-icon"><FaTwitter /></a>
              <a href="#" className="social-icon"><FaPinterestP /></a>
            </div>
          </div>

          {/* Links Column */}
          <div className="col-lg-2 col-md-6">
            <h5 className="footer-title">روابط سريعة</h5>
            <ul className="list-unstyled footer-links">
              <li><Link to="/">الرئيسية</Link></li>
              <li><Link to="/products">المنتجات</Link></li>
              <li><Link to="/pages/about-us">عن المتجر</Link></li> {/* ****** تصحيح الرابط ****** */}
              <li><Link to="/pages/contact-us">اتصل بنا</Link></li> {/* ****** تصحيح الرابط ****** */}
              <li><Link to="/faq">الأسئلة الشائعة</Link></li>
            </ul>
          </div>

          {/* Customer Service Column */}
          <div className="col-lg-2 col-md-6">
            <h5 className="footer-title">خدمة العملاء</h5>
            <ul className="list-unstyled footer-links">
              <li><Link to="/my-account">حسابي</Link></li>
              <li><Link to="/orders">تتبع الطلب</Link></li>
              <li><Link to="/return-policy">سياسة الإرجاع</Link></li>
              <li><Link to="/pages/privacy-policy">سياسة الخصوصية</Link></li> {/* ****** تصحيح الرابط ****** */}
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
