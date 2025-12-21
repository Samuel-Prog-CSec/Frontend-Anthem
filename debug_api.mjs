
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

async function debug() {
  try {
    console.log('Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      identifier: 'z3r0',
      password: 'Str0ngP@ssw0rd!2025'
    });

    const token = loginRes.data.token || loginRes.data.accessToken || loginRes.data.data?.accessToken;
    console.log('Login success. Token obtained.');

    const headers = { Authorization: `Bearer ${token}` };

    console.log('\n--- Testing Locations ---');
    try {
        const locRes = await axios.get(`${API_URL}/locations?page=1&limit=1`, { headers });
        console.log('Status:', locRes.status);
        console.log('Full Response Data:', JSON.stringify(locRes.data, null, 2));
    } catch (e) {
        console.error('Locations Error:', e.message);
    }

    console.log('\n--- Testing Air Quality ---');
    try {
        const airRes = await axios.get(`${API_URL}/air-quality?page=1&limit=1`, { headers });
        console.log('Status:', airRes.status);
        console.log('Full Response Data:', JSON.stringify(airRes.data, null, 2));
    } catch (e) {
        console.error('Air Quality Error:', e.message);
    }

    console.log('\n--- Testing Noise ---');
    try {
        const noiseRes = await axios.get(`${API_URL}/noise-monitoring?page=1&limit=1`, { headers });
        console.log('Status:', noiseRes.status);
        console.log('Full Response Data:', JSON.stringify(noiseRes.data, null, 2));
    } catch (e) {
        console.error('Noise Error:', e.message);
    }

  } catch (error) {
    console.error('Fatal Error:', error.response?.data || error.message);
  }
}

debug();
