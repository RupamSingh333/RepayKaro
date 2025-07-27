import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetToLogin } from '../navigation/NavigationService';

const BASE_URL = 'https://api.repaykaro.com/api/v1/';

type RequestOptions = Partial<RequestInit> & { body?: BodyInit | null };

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem('liveCustomerToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const fetchWithAuth = async (endpoint: string, options: RequestOptions = {}) => {
  const headers = await getAuthHeaders();

  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(BASE_URL + endpoint, config);
    const json = await response.json();
    // console.log(`📦 API Response [${options.method || 'GET'} ${endpoint}]:`, json);
    // console.log('📦 API Response:', response);

    if (
      response.status == 401 ||
      json?.message?.toLowerCase()?.includes('unauthorized') ||
      json?.message?.toLowerCase()?.includes('jwt token')
    ) {
      console.warn('🚫 Unauthorized - token invalid or expired, redirecting to login');
      await AsyncStorage.removeItem('liveCustomerToken');
      resetToLogin();
      throw new Error('Session expired. Please login again.');
    }

    if (json?.jwtToken) {
      await AsyncStorage.setItem('liveCustomerToken', json.jwtToken);
      console.log('🔐 New JWT saved:', json.jwtToken);
    }

    return json;
  } catch (error) {
    console.log('🚫 API Error=======>>>:', error);
    return Promise.reject(error);
    console.error(`❌ API Error [${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
  }
};

// ✅ Typed API Calls

export const apiGet = async <T = any>(endpoint: string): Promise<T> =>
  fetchWithAuth(endpoint, { method: 'GET' });

export const apiPost = async <T = any>(
  endpoint: string,
  body: Record<string, any>
): Promise<T> =>
  fetchWithAuth(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const apiPostMultipart = async <T = any>(
  endpoint: string,
  formData: FormData
): Promise<T> => {
  const token = await AsyncStorage.getItem('liveCustomerToken');

  try {
    const response = await fetch(BASE_URL + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const json = await response.json();

    if (
      response.status == 401 ||
      json?.message?.toLowerCase()?.includes('unauthorized') ||
      json?.message?.toLowerCase()?.includes('jwt token')
    ) {
      console.warn('🚫 Unauthorized - token invalid or expired, redirecting to login');
      await AsyncStorage.removeItem('liveCustomerToken');
      resetToLogin();
      throw new Error('Session expired. Please login again.');
    }

    return json;
  } catch (error) {
    console.error('❌ Multipart POST Error:', error);
    throw error;
  }
};

export const apiDelete = async <T = any>(endpoint: string): Promise<T> => {
  const token = await AsyncStorage.getItem('liveCustomerToken');

  try {
    const response = await fetch(BASE_URL + endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const json = await response.json();

    if (
      response.status === 401 ||
      json?.message?.toLowerCase()?.includes('unauthorized') ||
      json?.message?.toLowerCase()?.includes('jwt token')
    ) {
      console.warn('🚫 Unauthorized - token invalid or expired, redirecting to login');
      await AsyncStorage.removeItem('liveCustomerToken');
      resetToLogin();
      throw new Error('Session expired. Please login again.');
    }

    return json;
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    throw error;
  }
};
