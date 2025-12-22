import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';


const SocialCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}${location.pathname}${location.search}`);
        const { access, refresh, tenant_id, tenant_schema } = response.data;
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('tenantId', tenant_id);
        localStorage.setItem('tenantSchema', tenant_schema);
        navigate('/dashboard');
      } catch (error) {
        console.error('Social callback error:', error);
        navigate('/login', { state: { error: 'Social login failed. Please try again.' } });
      }
    };
    fetchToken();
  }, [location, navigate]);

  return  <div className="Alll_OOo_LODer">
        <div className="loader"></div>
          <p>Loading...</p>
      </div>;
};

export default SocialCallback;