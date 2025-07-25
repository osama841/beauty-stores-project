import React from 'react';
import { Link } from 'react-router-dom';
import { BiEnvelope, BiPhone, BiMap, BiLogoFacebook, BiLogoInstagram, BiLogoTwitter, BiLogoPinterest } from 'react-icons/bi';
import './../styles/Footer.css'; // استيراد ملف CSS الخاص بالتذييل
const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-5">
      <div className="container">
        <div className="row g-4">
          {/* About Column */}
          <div className="col-lg-4 col-md-6">
            <div className="footer-brand d-flex align-items-center mb-3">
              <i className="bi bi-flower1 fs-3 me-2 text-purple"></i>
              <span className="fs-4 fw-bold" style={{ color: '#6f42c1' }}>لمسة روز</span>
            </div>
            <p className="text-muted mb-4">
              متجرك الشامل لأدوات التجميل عالية الجودة. نحن ملتزمون بتقديم الأفضل لك في مستحضرات التجميل والعناية بالبشرة.
            </p>
            <div className="social-icons d-flex gap-3">
              <a href="#" className="text-white bg-purple rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                <BiLogoFacebook size={18} />
              </a>
              <a href="#" className="text-white bg-purple rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                <BiLogoInstagram size={18} />
              </a>
              <a href="#" className="text-white bg-purple rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                <BiLogoTwitter size={18} />
              </a>
              <a href="#" className="text-white bg-purple rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                <BiLogoPinterest size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="col-lg-2 col-md-6">
            <h5 className="text-purple mb-4 fw-bold">روابط سريعة</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none hover-text-purple d-flex align-items-center gap-2">
                  <i className="bi bi-chevron-left small"></i> الرئيسية
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products" className="text-muted text-decoration-none hover-text-purple d-flex align-items-center gap-2">
                  <i className="bi bi-chevron-left small"></i> المنتجات
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-muted text-decoration-none hover-text-purple d-flex align-items-center gap-2">
                  <i className="bi bi-chevron-left small"></i> عن المتجر
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-muted text-decoration-none hover-text-purple d-flex align-items-center gap-2">
                  <i className="bi bi-chevron-left small"></i> اتصل بنا
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/faq" className="text-muted text-decoration-none hover-text-purple d-flex align-items-center gap-2">
                  <i className="bi bi-chevron-left small"></i> الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service Column */}
          <div className="col-lg-2 col-md-6">
            <h5 className="text-purple mb-4 fw-bold">خدمة العملاء</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/my-account" className="text-muted text-decoration-none hover-text-purple d-flex align-items-center gap-2">
                  <i className="bi bi-chevron-left small"></i> حسابي
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/track-order" className="text-muted text-decoration-none hover-text-purple d-flex align-items-center gap-2">
                  <i className="bi bi-chevron-left small"></i> تتبع الطلب
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/return-policy" className="text-muted text-decoration-none hover-text-purple d-flex align-items-center gap-2">
                  <i className="bi bi-chevron-left small"></i> سياسة الإرجاع
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/privacy-policy" className="text-muted text-decoration-none hover-text-purple d-flex align-items-center gap-2">
                  <i className="bi bi-chevron-left small"></i> سياسة الخصوصية
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/terms" className="text-muted text-decoration-none hover-text-purple d-flex align-items-center gap-2">
                  <i className="bi bi-chevron-left small"></i> شروط الاستخدام
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info Column */}
          <div className="col-lg-4 col-md-6">
            <h5 className="text-purple mb-4 fw-bold">تواصل معنا</h5>
            <ul className="list-unstyled text-muted">
              <li className="mb-3 d-flex align-items-start gap-3">
                <div className="mt-1">
                  <BiMap size={18} className="text-purple" />
                </div>
                <div>
                  <h6 className="mb-1 text-white">العنوان</h6>
                  <p className="mb-0 small">123 شارع الجمال، الرياض، المملكة العربية السعودية</p>
                </div>
              </li>
              <li className="mb-3 d-flex align-items-start gap-3">
                <div className="mt-1">
                  <BiPhone size={18} className="text-purple" />
                </div>
                <div>
                  <h6 className="mb-1 text-white">الهاتف</h6>
                  <p className="mb-0 small">
                    <a href="tel:+966123456789" className="text-muted text-decoration-none">+966 12 345 6789</a>
                  </p>
                </div>
              </li>
              <li className="mb-3 d-flex align-items-start gap-3">
                <div className="mt-1">
                  <BiEnvelope size={18} className="text-purple" />
                </div>
                <div>
                  <h6 className="mb-1 text-white">البريد الإلكتروني</h6>
                  <p className="mb-0 small">
                    <a href="mailto:info@lamasarose.com" className="text-muted text-decoration-none">info@lamasarose.com</a>
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-top border-secondary pt-4 mt-4">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <p className="mb-0 small text-muted">
                &copy; {new Date().getFullYear()} لمسة روز. جميع الحقوق محفوظة.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <img 
                src="https://via.placeholder.com/300x50?text=Payment+Methods" 
                alt="Payment Methods" 
                className="img-fluid" 
                style={{ maxHeight: '30px' }}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;