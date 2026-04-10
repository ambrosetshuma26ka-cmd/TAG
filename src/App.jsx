import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header        from './components/Header';
import Footer        from './components/Footer';
import ScrollToTop   from './components/ScrollToTop';
import CookieConsent from './components/CookieConsent';
import Seo           from './components/Seo';

import Home            from './pages/Home';
import About           from './pages/About';
import Services        from './pages/Services';
import Contact         from './pages/Contact';
import BookAppointment from './pages/bookAppointment';
import GetQuote        from './pages/getQuote';
import Terms           from './pages/Terms';
import Privacy         from './pages/Privacy';
import CookiePolicy    from './pages/cookiePolicy';

import AdminDashboard    from './pages/admin/adminDashboard';
import AdminAppointments from './pages/admin/adminAppointments';
import AdminQuotes       from './pages/admin/adminQuotes';
import AdminEnquiries    from './pages/admin/adminEnquiries';
import AdminCalendar     from './pages/admin/adminCalendar';
import AdminSlots           from './pages/admin/adminSlots';
import AdminForgotPassword from './pages/admin/adminForgotPassword';
import AdminProfile        from './pages/admin/adminProfile';

const SEO_MAP = {
  '/': {
    title: 'Vehicle Auction Representative Johannesburg',
    description: "The Auction Guy (TAG) bids, sources, and secures your ideal vehicle at Burchmores, WeBuyCars, Aucor, and SMA, expert auction representation in Johannesburg.",
  },
  '/about': {
    title: 'About The Auction Guy',
    description: "Meet The Auction Guy, The Auction Guy. Independent vehicle auction representative with hands-on experience at Johannesburg's top auction houses.",
  },
  '/services': {
    title: 'Our Services',
    description: "TAG offers vehicle inspection, auction attendance, bidding representation, fleet sourcing, export advisory, and full-service acquisition, all in one.",
  },
  '/contact': {
    title: 'Contact Us',
    description: "Get in touch with The Auction Guy. Call 071 169 6716 or email info@theauctionguyza.co.za to discuss your vehicle acquisition needs.",
  },
  '/book-appointment': {
    title: 'Book a Consultation',
    description: "Book a 30 or 60-minute strategy session with TAG. Expert guidance on buying at auction, budgeting, and vehicle selection.",
  },
  '/get-quote': {
    title: 'Get a Quote',
    description: "Request a personalised quote for auction representation, vehicle inspection, delivery, or full-service acquisition from The Auction Guy.",
  },
  '/terms': {
    title: 'Terms & Conditions',
    description: "Read the Terms and Conditions for The Auction Guy, covering services, fees, cancellation policy, and client obligations.",
  },
  '/privacy': {
    title: 'Privacy Policy',
    description: "The Auction Guy's Privacy Policy, how we collect, use, and protect your personal information in compliance with POPIA.",
  },
  '/cookies': {
    title: 'Cookie Policy',
    description: "Learn how The Auction Guy uses cookies on this website, what data is stored, and how to manage your preferences.",
  },
};

const PublicLayout = ({ children }) => {
  const { pathname } = useLocation();
  const seo = SEO_MAP[pathname] || {};
  return (
    <>
      <Seo title={seo.title} description={seo.description} canonical={pathname} />
      <Header />
      <CookieConsent />
      <main className="pt-[7rem]">{children}</main>
      <Footer />
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <ScrollToTop />
    <Routes>
      <Route path="/"                 element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/about"            element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/services"         element={<PublicLayout><Services /></PublicLayout>} />
      <Route path="/contact"          element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/book-appointment" element={<PublicLayout><BookAppointment /></PublicLayout>} />
      <Route path="/get-quote"        element={<PublicLayout><GetQuote /></PublicLayout>} />
      <Route path="/terms"            element={<PublicLayout><Terms /></PublicLayout>} />
      <Route path="/privacy"          element={<PublicLayout><Privacy /></PublicLayout>} />
      <Route path="/cookies"          element={<PublicLayout><CookiePolicy /></PublicLayout>} />

      <Route path="/admin"              element={<AdminDashboard />} />
      <Route path="/admin/appointments" element={<AdminAppointments />} />
      <Route path="/admin/quotes"       element={<AdminQuotes />} />
      <Route path="/admin/enquiries"    element={<AdminEnquiries />} />
      <Route path="/admin/calendar"     element={<AdminCalendar />} />
      <Route path="/admin/slots"           element={<AdminSlots />} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/admin/profile"         element={<AdminProfile />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;