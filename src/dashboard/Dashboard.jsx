import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';

function Dashboard({ userEmail, onLogout, onBackToHome }) {
  const [donorData, setDonorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Edit form ki state
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    bloodGroup: '',
    city: '',
    lastDonationDate: '',
    isAvailable: true
  });

  // Database se profile fetch karne ka function
  async function fetchDonorProfile() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('donors')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle(); // single() ki jagah maybeSingle() behtar ha takay error crash na kare

      if (error) throw error;

      if (data) {
        setDonorData(data);
        // Edit form fields ko populate karna
        setEditForm({
          fullName: data.full_name || '',
          phone: data.phone || '',
          bloodGroup: data.blood_group || '',
          city: data.city || '',
          lastDonationDate: data.last_donation_date || '',
          isAvailable: data.is_available ?? true
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userEmail) fetchDonorProfile();
  }, [userEmail]);

  // Input fields handle karne k liye
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'phone') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length > 11) return; // 11 Digits restriction
      setEditForm(prev => ({ ...prev, [name]: onlyNums }));
      return;
    }

    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Profile data update karne ka handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // Front-end check for phone number
    if (editForm.phone.trim() && editForm.phone.length !== 11) {
      Swal.fire({
        title: 'Invalid Phone ❌',
        text: 'Phone number must be exactly 11 digits',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    setUpdateLoading(true);
    try {
      const { error } = await supabase
        .from('donors')
        .update({
          full_name: editForm.fullName,
          phone: editForm.phone,
          blood_group: editForm.bloodGroup,
          city: editForm.city,
          last_donation_date: editForm.lastDonationDate || null,
          is_available: editForm.isAvailable
        })
        .eq('email', userEmail);

      if (error) throw error;

      Swal.fire({
        title: 'Profile Updated! 🎉',
        text: 'Your updated details are now live for Find Donor search.',
        icon: 'success',
        confirmButtonColor: '#dc2626'
      });

      setIsEditing(false);
      fetchDonorProfile(); // Fresh data pull karna
    } catch (error) {
      console.error("Update Error:", error.message);
      Swal.fire({
        title: 'Update Failed ❌',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#475569'
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <nav className="dashboard-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
        <h2 style={{ color: '#dc2626', margin: 0 }}>Donor Dashboard 🖥️</h2>
        <div>
          <button onClick={onBackToHome} style={{ marginRight: '10px', padding: '8px 16px', background: '#475569', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Back to Home</button>
          <button onClick={onLogout} style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content" style={{ background: '#f8fafc', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0' }}>Welcome, <span style={{ color: '#2563eb' }}>{userEmail}</span> 👋</h3>
            <p style={{ color: '#64748b', margin: 0 }}>Manage your blood donation profile and availability status here.</p>
          </div>
          {donorData && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Edit Profile ⚙️
            </button>
          )}
        </div>
        
        {loading ? (
          <p style={{ marginTop: '20px' }}>Loading your profile details... 🔄</p>
        ) : donorData ? (
          <div>
            {/* 1. VIEW MODE */}
            {!isEditing ? (
              <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#64748b', fontSize: '0.85rem', display: 'block' }}>Name</strong>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>{donorData.full_name}</span>
                </div>
                <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#64748b', fontSize: '0.85rem', display: 'block' }}>Blood Group</strong>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc2626' }}>{donorData.blood_group}</span>
                </div>
                <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#64748b', fontSize: '0.85rem', display: 'block' }}>City</strong>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>{donorData.city}</span>
                </div>
                <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#64748b', fontSize: '0.85rem', display: 'block' }}>Phone Number</strong>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>{donorData.phone}</span>
                </div>
                <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#64748b', fontSize: '0.85rem', display: 'block' }}>Last Donation Date</strong>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#475569' }}>
                    {donorData.last_donation_date ? donorData.last_donation_date : 'No donation recorded yet'}
                  </span>
                </div>
                <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#64748b', fontSize: '0.85rem', display: 'block' }}>Availability Status</strong>
                  <span style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 'bold', 
                    color: donorData.is_available ? '#16a34a' : '#d97706',
                    display: 'inline-block',
                    marginTop: '4px'
                  }}>
                    {donorData.is_available ? '● Available' : '○ Not Available'}
                  </span>
                </div>
              </div>
            ) : (
              
              /* 2. EDIT MODE FORM */
              <form onSubmit={handleUpdateProfile} style={{ marginTop: '25px', background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 20px 0', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>Modify Profile Information</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Full Name</label>
                    <input type="text" name="fullName" value={editForm.fullName} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Phone Number (11 Digits)</label>
                    <input type="text" name="phone" value={editForm.phone} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Blood Group</label>
                    <select name="bloodGroup" value={editForm.bloodGroup} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                      <option value="A+">A+</option><option value="A-">A-</option>
                      <option value="B+">B+</option><option value="B-">B-</option>
                      <option value="O+">O+</option><option value="O-">O-</option>
                      <option value="AB+">AB+</option><option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>City</label>
                    <select name="city" value={editForm.city} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
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
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Last Donation Date</label>
                  <input type="date" name="lastDonationDate" value={editForm.lastDonationDate} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <input type="checkbox" name="isAvailable" id="editIsAvailable" checked={editForm.isAvailable} onChange={handleInputChange} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <label htmlFor="editIsAvailable" style={{ fontSize: '0.9rem', color: '#334155', cursor: 'pointer' }}>I am available for urgent blood queries</label>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '10px 18px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                  <button type="submit" disabled={updateLoading} style={{ padding: '10px 18px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {updateLoading ? 'Saving... 🔄' : 'Save Changes 💾'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <p style={{ color: '#ea580c', fontWeight: '500', marginTop: '20px' }}>⚠️ Complete profile details not found in database. Please contact support.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;