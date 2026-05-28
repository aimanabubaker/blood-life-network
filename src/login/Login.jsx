import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';

function Login({ onClosePopup, onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Forgot Password ki screens manage karne ke liye state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // 1. Regular Login Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      if (data?.user) {
        onLoginSuccess(data.user); 
        if (onClosePopup) onClosePopup(); 
      }
    } catch (error) {
      console.error("Login Error:", error.message);
      setErrorMessage(error.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Forgot Password Handler
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // Is se user ke email par password reset karne ka official link chala jayega
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: window.location.origin, // Yeh user ko wapas aapki live web par le kar aayega
      });

      if (error) throw error;

      // Success Alert
      Swal.fire({
        title: 'Reset Link Sent! ✉️',
        text: 'Please check your email inbox (and spam folder) to reset your password.',
        icon: 'success',
        confirmButtonColor: '#dc2626',
      });

      setIsForgotPassword(false); // Wapas login screen par le jayein
      setResetEmail('');
    } catch (error) {
      console.error("Reset Error:", error.message);
      setErrorMessage(error.message || 'Could not send reset email.');
    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // SCREEN 1: FORGOT PASSWORD VIEW
  // ========================================================
  if (isForgotPassword) {
    return (
      <div className="login-box-inside" style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>Reset Password 🔑</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
          Enter your email address and we will send you a link to reset your password.
        </p>

        {errorMessage && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Registered Email</label>
            <input 
              type="email" 
              value={resetEmail} 
              onChange={(e) => setResetEmail(e.target.value)} 
              required 
              placeholder="name@example.com"
              style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} 
            />
          </div>
          
          <button type="submit" disabled={loading} style={{ background: '#dc2626', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            {loading ? 'Sending Link... 🔄' : 'Send Reset Link ✉️'}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#64748b' }}>
          Remember your password? <span onClick={() => { setIsForgotPassword(false); setErrorMessage(''); }} style={{ color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>Back to Login</span>
        </p>
      </div>
    );
  }

  // ========================================================
  // SCREEN 2: STANDARD LOGIN VIEW
  // ========================================================
  return (
    <div className="login-box-inside" style={{ textAlign: 'center' }}>
      <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>Welcome Back</h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>Login to your donor dashboard</p>

      {errorMessage && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <label style={{ fontWeight: '500', margin: 0 }}>Password</label>
            {/* Forgot Password Link Button */}
            <span 
              onClick={() => { setIsForgotPassword(true); setErrorMessage(''); }} 
              style={{ color: '#475569', fontSize: '0.82rem', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
            >
              Forgot Password?
            </span>
          </div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
        </div>

        <button type="submit" disabled={loading} style={{ background: '#dc2626', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
          {loading ? 'Logging in... 🔄' : 'Sign In 🚀'}
        </button>
      </form>
      
      <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#64748b' }}>
        Don't have an account? <span onClick={onSwitchToRegister} style={{ color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>Register</span>
      </p>
    </div>
  );
}

export default Login;