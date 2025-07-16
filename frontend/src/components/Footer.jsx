    // src/components/Footer.jsx
    import React from 'react';
    import { Link } from 'react-router-dom';

    const Footer = () => {
      return (
        <footer className="bg-dark text-light py-5 mt-auto">
          <div className="container">
            <div className="row">
              <div className="col-md-4 mb-4 mb-md-0">
                <h5 className="text-primary mb-3">عن المتجر</h5>
                <p className="text-muted small">
                  متجرك الشامل لأدوات التجميل عالية الجودة. نحن ملتزمون بتقديم الأفضل لك في مستحضرات التجميل والعناية بالبشرة.
                </p>
              </div>
              <div className="col-md-4 mb-4 mb-md-0">
                <h5 className="text-primary mb-3">روابط سريعة</h5>
                <ul className="list-unstyled">
                  <li><Link to="/about-us" className="text-light text-decoration-none small">من نحن</Link></li>
                  <li><Link to="/privacy-policy" className="text-light text-decoration-none small">سياسة الخصوصية</Link></li>
                  <li><Link to="/terms-of-service" className="text-light text-decoration-none small">شروط الاستخدام</Link></li>
                  <li><Link to="/contact-us" className="text-light text-decoration-none small">اتصل بنا</Link></li>
                </ul>
              </div>
              <div className="col-md-4">
                <h5 className="text-primary mb-3">معلومات الاتصال</h5>
                <p className="mb-2 small">البريد الإلكتروني: <a href="mailto:info@beautystore.com" className="text-light text-decoration-none small">info@beautystore.com</a></p>
                <p className="mb-2 small">الهاتف: <a href="tel:+1234567890" className="text-light text-decoration-none small">+123 456 7890</a></p>
                <p className="mb-0 small">العنوان: 123 Beauty Lane, Makeup City, BM 12345</p>
              </div>
            </div>
            <div className="text-center border-top border-secondary pt-4 mt-4">
              <p className="mb-0 text-muted small">&copy; {new Date().getFullYear()} متجر الجمال. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </footer>
      );
    };

    export default Footer;
    