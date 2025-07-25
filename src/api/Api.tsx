// ✅ src/api/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.repaykaro.com/api/v1/';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('liveCustomerToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const fetchWithAuth = async (endpoint, options = {}) => {
  const headers = await getAuthHeaders();
  const config = {
    headers,
    ...options,
  };

  try {
    const response = await fetch(BASE_URL + endpoint, config);
    const json = await response.json();

    if (json?.jwtToken) {
      await AsyncStorage.setItem('liveCustomerToken', json.jwtToken);
      console.log('🔐 New JWT saved:', json.jwtToken);
    }

    return json;
  } catch (error) {
    console.error(`❌ API Error [${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
  }
};

export const apiPost = async (endpoint, body) =>
  fetchWithAuth(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const apiGet = async (endpoint) =>
  fetchWithAuth(endpoint, {
    method: 'GET',
  });
