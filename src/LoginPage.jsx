// LoginPage.js
import React, { useEffect } from 'react';

const CLIENT_ID = '162286878579-18tdrea3mfvq51p0k98tm46uq3kj54ve.apps.googleusercontent.com'; // Replace with your OAuth client ID
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets'; // Scope for Google Sheets API

const LoginPage = () => {
  useEffect(() => {
    // Function to initiate OAuth flow
    const handleOAuthLogin = async () => {
      // Check if already authenticated
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        const { expiry, token } = JSON.parse(storedToken);
        // Check if token is still valid (expiry is in seconds)
        if (expiry > Date.now()) {
          // Redirect to upload page if token is valid
          window.location.href = '/upload';
          return;
        }
      }

      // If not authenticated or token expired, initiate OAuth flow
      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=https://generate-bill-fit90ugro-gaurav29502s-projects.vercel.app/upload&scope=${encodeURIComponent(SCOPES)}&response_type=token`;
      window.location.href = authUrl;
    };

    handleOAuthLogin();
  }, []);

  return <div>Loading...</div>; // Optional: Add a loading indicator
};

export default LoginPage;
