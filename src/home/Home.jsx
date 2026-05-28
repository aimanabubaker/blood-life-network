import React, { useState, useEffect } from 'react';
import Register from '../register/Register'; 
import FindDonor from './FindDonor'; 
import Login from '../login/Login'; 
import Dashboard from '../dashboard/Dashboard'; 
import { supabase } from '../supabaseClient'; 
import './Home.css';

function Home() {
  const [view, setView] = useState('landing'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false); 
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); 

  const [searchBlood, setSearchBlood] = useState('');
  const [searchCity, setSearchCity] = useState('');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  
  const openRegisterPopup = (e) => {
    if(e) e.preventDefault();
    setIsPopupOpen(true);
    setIsLoginOpen(false); 
    closeMenu(); 
  };

  const closeRegisterPopup = () => {
    setIsPopupOpen(false);
  };

  const openLoginPopup = (e) => {
    e.preventDefault();
    setIsLoginOpen(true);
    setIsPopupOpen(false); 
    closeMenu();
  };

  const closeLoginPopup = () => {
    setIsLoginOpen(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setCurrentUser(null); 
      setView('landing'); 
    } else {
      console.error('Error logging out:', error.message);
    }
  };

  const handleNavigateToFindDonor = (e) => {
    e.preventDefault();
    setView('find-donor');
    closeMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setView('find-donor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUser(session.user);
        setView('dashboard'); 
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setCurrentUser(session.user);
      } else {
        setCurrentUser(null);
      }
    });

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe(); 
    };
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setView('dashboard'); 
    closeLoginPopup();
  };

  if (view === 'find-donor') {
    return (
      <FindDonor 
        initialBlood={searchBlood} 
        initialCity={searchCity} 
        onBackToHome={() => { setView('landing'); setSearchBlood(''); setSearchCity(''); }} 
      />
    );
  }

  if (view === 'dashboard' && currentUser) {
    return (
      <Dashboard 
        userEmail={currentUser.email} 
        onLogout={handleLogout} 
        onBackToHome={() => setView('landing')} 
      />
    );
  }

  return (
    <div className="home-wrapper">
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-logo" onClick={() => setView('landing')} style={{cursor: 'pointer'}}>
          <span className="drop-icon">🩸</span> Blood Life
        </div>
        
        <div className={`navbar-toggle ${isMenuOpen ? 'toggle-active' : ''}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li><a href="#home" onClick={() => { setView('landing'); closeMenu(); }}>Home</a></li>
          <li><a href="#search-section" onClick={handleNavigateToFindDonor}>Find Donors</a></li>
          <li className="nav-actions-group">
            {currentUser ? (
              <>
                <span className="user-welcome-nav" style={{ color: '#475569', fontWeight: '600', marginRight: '12px', fontSize: '0.95rem' }}>
                  Hi, {currentUser.email.split('@')[0]} 👋
                </span>
                <button className="nav-register-btn" onClick={() => { setView('dashboard'); closeMenu(); }} style={{ marginRight: '10px', padding: '8px 15px' }}>
                  My Dashboard 🖥️
                </button>
                <button className="nav-login-link" onClick={handleLogout} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="nav-login-link" onClick={openLoginPopup} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  Login
                </button>
                <button className="nav-register-btn" onClick={openRegisterPopup}>
                  Register as Donor
                </button>
              </>
            )}
          </li>
        </ul>
      </nav>

      {/* HERO SECTION */}
      <section id="home" className="hero-clean">
        <div className="hero-overlay"></div>
        <div className="hero-content-box">
          <div className="hero-tagline">❤️ Save Lives, Donate Blood</div>
          <h1 className="hero-main-heading">Your Blood Can Give a <span className="highlight-text">Second Chance</span> at Life</h1>
          <p className="hero-subtext">Join our community of lifesavers. Find blood donors near you or register today to become a proud donor.</p>
          <div className="hero-action-buttons">
            <button className="btn-find-donor" onClick={handleNavigateToFindDonor}>Find Donor 🔍</button>
            <button className="btn-become-donor" onClick={openRegisterPopup}>Become Donor 🩸</button>
          </div>
        </div>
      </section>

      {/* STATS COUNTER SECTION */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <h3>2,500+</h3>
            <p>Registered Donors</p>
          </div>
          <div className="stat-card">
            <h3>1,800+</h3>
            <p>Requests Fulfilled</p>
          </div>
          <div className="stat-card">
            <h3>5,000+</h3>
            <p>Lives Saved</p>
          </div>
          <div className="stat-card">
            <h3>24/7</h3>
            <p>Emergency Support</p>
          </div>
        </div>
      </section>

      {/* SEARCH SECTION */}
      <section id="search-section" className="search-donors-section">
        <div className="section-header"><h2>Find Blood Donors Instantly</h2></div>
        <div className="search-box-card">
          <form onSubmit={handleSearch} className="search-form-layout">
            <div className="search-input-group">
              <label>Blood Group</label>
              <select value={searchBlood} onChange={(e) => setSearchBlood(e.target.value)}>
                <option value="">All Groups</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
              </select>
            </div>
            
            <div className="search-input-group">
              <label>City / Area</label>
              <select value={searchCity} onChange={(e) => setSearchCity(e.target.value)}>
                <option value="">All Cities</option>
                <option value="Faisalabad">Faisalabad</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Multan">Multan</option>
                <option value="Peshawar">Peshawar</option>
                <option value="Quetta">Quetta</option>
                <option value="Sialkot">Sialkot</option>
                <option value="Gujranwala">Gujranwala</option>
                <option value="Sargodha">Sargodha</option>
              </select>
            </div>
            
            <button type="submit" className="search-submit-btn">Search Matches 🔍</button>
          </form>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section id="benefits" className="benefits-section">
        <div className="section-header">
          <span className="section-subtitle">Making a Difference</span>
          <h2>Why Should You Donate?</h2>
          <div className="heading-line"></div>
        </div>

        <div className="benefits-grid">
          <div className="benefit-item">
            <span className="benefit-bullet">✓</span>
            <div>
              <h5>Save Up To 3 Lives</h5>
              <p>A single donation can be separated into red cells, plasma, and platelets to treat multiple patients.</p>
            </div>
          </div>
          <div className="benefit-item">
            <span className="benefit-bullet">✓</span>
            <div>
              <h5>Free Health Screenings</h5>
              <p>Every time you donate, your pulse, blood pressure, body temperature, and hemoglobin level are checked.</p>
            </div>
          </div>
          <div className="benefit-item">
            <span className="benefit-bullet">✓</span>
            <div>
              <h5>Enhance Heart Health</h5>
              <p>Regular donation helps balance iron storage levels in the body, which reduces cardiovascular risks.</p>
            </div>
          </div>
          <div className="benefit-item">
            <span className="benefit-bullet">✓</span>
            <div>
              <h5>Unite the Community</h5>
              <p>Be part of a compassionate human network standing ready to help strangers during emergency situations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER SECTION */}
      <footer id="contact" className="main-footer">
        <div className="footer-container">
          
          <div className="footer-brand-column">
            <div className="footer-logo">
              <span>🩸</span> Blood Life
            </div>
            <p className="footer-description">
              Connecting blood donors with those in need seamlessly. Every drop counts, every second matters. Join us today to make a real difference.
            </p>
          </div>

          <div className="footer-links-column">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home" onClick={() => setView('landing')}>Home</a></li>
              <li><a href="#search-section" onClick={handleNavigateToFindDonor}>Find Donors</a></li>
              <li><a href="#benefits">Why Donate</a></li>
              <li><a href="#" onClick={openRegisterPopup}>Become a Donor</a></li>
            </ul>
          </div>

          <div className="footer-contact-column">
            <h4>Emergency Contact</h4>
            <p><strong>📍 Address:</strong> Faisalabad, Punjab, Pakistan</p>
            <p><strong>📞 Phone:</strong> +92 300 1234567</p>
            <p><strong>✉ Email:</strong> support@bloodlife.com</p>
          </div>

        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Blood Life Network. All Rights Reserved.</p>
        </div>
      </footer>

      {/* POPUPS */}
      {isPopupOpen && (
        <div className="modal-overlay" onClick={closeRegisterPopup} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()} style={{ background: 'white', padding: '30px', borderRadius: '12px', position: 'relative', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={closeRegisterPopup} style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            <Register onDonorAdded={closeRegisterPopup} /> 
          </div>
        </div>
      )}

      {isLoginOpen && (
        <div className="modal-overlay" onClick={closeLoginPopup} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()} style={{ background: 'white', padding: '30px', borderRadius: '12px', position: 'relative', maxWidth: '400px', width: '90%' }}>
            <button onClick={closeLoginPopup} style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            <Login onClosePopup={closeLoginPopup} onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => openRegisterPopup(null)} /> 
          </div>
        </div>
      )}
    </div>
  );
}
   
export default Home;