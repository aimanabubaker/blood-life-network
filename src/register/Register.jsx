import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';
import './Register.css'; 

function Register({ onDonorAdded }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bloodGroup: '',
    city: '',
    lastDonationDate: '',
    password: '',
    isAvailable: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.fullName.trim()) tempErrors.fullName = 'Full Name is required';
    if (!formData.email.trim()) tempErrors.email = 'Email is required';
    
    // Check if phone is empty OR not exactly 11 digits
    if (!formData.phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else if (formData.phone.length !== 11) {
      tempErrors.phone = 'Phone number must be exactly 11 digits';
    }

    if (!formData.bloodGroup) tempErrors.bloodGroup = 'Please select a blood group';
    if (!formData.city) tempErrors.city = 'Please select a city';
    if (!formData.password || formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters long';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special check for phone field
    if (name === 'phone') {
      // Sirf numbers allow karein (0-9)
      const onlyNums = value.replace(/[^0-9]/g, '');
      
      // Agar length 11 se zyada ho rahi hai to rok dein
      if (onlyNums.length > 11) return;
      
      setFormData((prev) => ({
        ...prev,
        [name]: onlyNums,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      // 1. Supabase Authentication SignUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (authError) throw authError;

      // 2. Database Insert into 'donors' table
      const { error: dbError } = await supabase
        .from('donors')
        .insert([
          {
            full_name: formData.fullName,
            email: formData.email.trim(),
            phone: formData.phone,
            blood_group: formData.bloodGroup,
            city: formData.city,
            last_donation_date: formData.lastDonationDate || null,
            is_available: formData.isAvailable,
          },
        ]);

      if (dbError) throw dbError;

      // Success Alerts
      Swal.fire({
        title: 'Registered Successfully! 🎉',
        text: 'Your donor profile has been saved securely.',
        icon: 'success',
        confirmButtonColor: '#dc2626',
      });

      // Clear values
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        bloodGroup: '',
        city: '',
        lastDonationDate: '',
        password: '',
        isAvailable: true,
      });

      if (onDonorAdded) onDonorAdded();

    } catch (error) {
      console.error("Registration Process Error:", error.message);
      Swal.fire({
        title: 'Registration Failed ❌',
        text: error.message || 'Something went wrong with the database connection.',
        icon: 'error',
        confirmButtonColor: '#475569',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form-container">
      <h3 className="register-title">Become a Lifesaver ❤️</h3>
      <p className="register-subtitle">Create your secure donor profile and start saving lives today.</p>
      
      <form onSubmit={handleSubmit} className="donor-registration-form">
        
        <div className="form-row-group">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={errors.fullName ? 'input-error' : ''}
            placeholder="e.g., Muhammad Ali"
          />
          {errors.fullName && <span className="err-msg">{errors.fullName}</span>}
        </div>

        <div className="form-row-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'input-error' : ''}
            placeholder="name@example.com"
          />
          {errors.email && <span className="err-msg">{errors.email}</span>}
        </div>

        <div className="form-row-group">
          <label>Password (Min 6 characters)</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'input-error' : ''}
            placeholder="Create a strong password"
          />
          {errors.password && <span className="err-msg">{errors.password}</span>}
        </div>

        <div className="form-row-group">
          <label>Phone Number (11 Digits)</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={errors.phone ? 'input-error' : ''}
            placeholder="e.g., 03001234567"
          />
          {errors.phone && <span className="err-msg">{errors.phone}</span>}
        </div>

        <div className="form-grid-2col">
          <div className="form-row-group">
            <label>Blood Group</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className={errors.bloodGroup ? 'input-error' : ''}
            >
              <option value="">Select</option>
              <option value="A+">A+</option><option value="A-">A-</option>
              <option value="B+">B+</option><option value="B-">B-</option>
              <option value="O+">O+</option><option value="O-">O-</option>
              <option value="AB+">AB+</option><option value="AB-">AB-</option>
            </select>
            {errors.bloodGroup && <span className="err-msg">{errors.bloodGroup}</span>}
          </div>

          <div className="form-row-group">
            <label>City</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={errors.city ? 'input-error' : ''}
            >
              <option value="">Select City</option>
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
            {errors.city && <span className="err-msg">{errors.city}</span>}
          </div>
        </div>

        <div className="form-row-group">
          <label>Last Donation Date (Optional)</label>
          <input
            type="date"
            name="lastDonationDate"
            value={formData.lastDonationDate}
            onChange={handleChange}
          />
        </div>

        <div className="checkbox-align">
          <input
            type="checkbox"
            name="isAvailable"
            id="isAvailable"
            checked={formData.isAvailable}
            onChange={handleChange}
          />
          <label htmlFor="isAvailable">Available for immediate emergency calls</label>
        </div>

        <button type="submit" className="register-submit-btn-main" disabled={loading}>
          {loading ? 'Processing... Please Wait 🔄' : 'Complete Registration 🩸'}
        </button>
      </form>
    </div>
  );
}

export default Register;