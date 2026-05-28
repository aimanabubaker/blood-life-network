import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 
import './FindDonor.css';

function FindDonor({ initialBlood = '', initialCity = '', onBackToHome }) {
  const [bloodGroup, setBloodGroup] = useState(initialBlood);
  const [city, setCity] = useState(initialCity);
  const [donors, setDonors] = useState([]); // Database raw records are saved here
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true); 

  // Pakistan ke main cities ki list - Dropdown mein sirf clean city name aayega
  const pakistanCities = [
    "Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", 
    "Hyderabad", "Multan", "Peshawar", "Quetta", "Islamabad", 
    "Sargodha", "Sialkot", "Bahawalpur", "Sukkur", "Jhang", 
    "Sheikhupura", "Larkana", "Gujrat", "Mardan", "Kasur", 
    "Rahim Yar Khan", "Sahiwal", "Okara", "Wah Cantonment", "Mirpur Khas", 
    "Nawabshah", "Chiniot", "Kamoke", "Burewala", "Jhelum", 
    "Sadiqabad", "Khanewal", "Hafizabad", "Kohat", "Jacobabad", 
    "Muzaffargarh", "Muridke", "Abbottabad", "Dera Ghazi Khan", "Dera Ismail Khan"
  ].sort(); // Is se list alphabetically (A to Z) arrange ho jayegi

  // 1. Fetching Real Data from Supabase
  const fetchDonors = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('donors') 
        .select('*'); // Fetches all records

      if (error) throw error;

      if (data) {
        setDonors(data);
        // Page loads with filters applied if values came from Home search bar
        applyFilters(data, initialBlood, initialCity);
      }
    } catch (error) {
      console.error('Error fetching donors:', error.message);
      alert('Failed to load donors from database!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  // 2. Client-side Real-time Search and Filtering Logic (Blood + City)
  const applyFilters = (allDonors, selectedBlood, selectedCity) => {
    const results = allDonors.filter(donor => {
      // Matching database column name 'blood_group'
      const matchBlood = selectedBlood === "" || donor.blood_group === selectedBlood;
      
      // Matching database column name 'city'
      const donorCity = donor.city ? donor.city.toLowerCase().trim() : "";
      const searchStr = selectedCity.toLowerCase().trim();
      
      const matchCity = selectedCity === "" || donorCity === searchStr;
      
      return matchBlood && matchCity;
    });
    setFilteredDonors(results);
  };

  const handleFilterSearch = (e) => {
    e.preventDefault();
    applyFilters(donors, bloodGroup, city);
  };

  return (
    <div className="find-donor-page">
      {/* Page Header banner */}
      <div className="page-banner">
        <button className="back-home-btn" onClick={onBackToHome}>
          ← Back to Home
        </button>
        <h1>Search Live Blood Donors</h1>
        <p>Directly contact available volunteers in emergency situations</p>
      </div>

      <div className="page-container">
        {/* Advanced Filters Sidebar */}
        <div className="filter-sidebar-card">
          <h3>Filter Options</h3>
          <form onSubmit={handleFilterSearch}>
            
            {/* ================= 1. BLOOD GROUP FILTER ================= */}
            <div className="filter-group">
              <label>Blood Group</label>
              <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                <option value="">All Groups</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
              </select>
            </div>

            {/* ================= 2. CLEAN CITY DROPDOWN FILTER ================= */}
            <div className="filter-group">
              <label>Select City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">All Cities</option>
                {pakistanCities.map((cityName, index) => (
                  <option key={index} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="filter-apply-btn">Apply Filters 🔍</button>
          </form>
        </div>

        {/* Donors Listing Display */}
        <div className="results-content">
          <h3>Matching Donors Found ({filteredDonors.length})</h3>
          
          {loading ? (
            <div className="loading-box" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
              🔄 Fetching Registered Donors from Supabase...
            </div>
          ) : filteredDonors.length === 0 ? (
            <div className="no-results-box">
              😞 No donors found matching your exact criteria. Try searching a wider area.
            </div>
          ) : (
            <div className="donor-grid">
              {filteredDonors.map(donor => (
                <div key={donor.id} className="donor-list-card">
                  <div className="card-top-info">
                    
                    {/* Displaying 'blood_group' safely */}
                    <span className="donor-blood-badge">{donor.blood_group}</span>
                    
                    <div>
                      {/* Displaying 'full_name' from your registry database table */}
                      <h4>{donor.full_name}</h4>
                      
                      {/* Clean City Display on Card */}
                      <p className="donor-location-text">📍 {donor.city}</p>
                      
                      {/* Phone Number Text Display */}
                      <p className="donor-phone-text" style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>
                        📞 {donor.phone ? donor.phone : 'No Phone'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="card-bottom-info">
                    {/* Checking 'is_available' boolean to display status */}
                    <span className={`status-tag ${donor.is_available ? 'available' : 'busy'}`}>
                      {donor.is_available ? 'Available' : 'Unavailable'}
                    </span>
                    
                    {/* Displaying dynamic phone numbers from 'phone' column */}
                    {donor.phone ? (
                      <a href={`tel:${donor.phone}`} className="call-donor-btn">
                        Call Now 📞
                      </a>
                    ) : (
                      <button className="call-donor-btn" style={{ backgroundColor: '#cbd5e1', cursor: 'not-allowed' }} disabled>
                        No Number ❌
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FindDonor;