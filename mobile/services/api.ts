import axios from 'axios';

// Replace with your local machine's IP address if testing on a physical device
const API_BASE_URL = 'http://127.0.0.1:8000'; // Default for Android Emulator to localhost

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const fetchIncidents = async () => {
  try {
    const response = await api.get('/incidents');
    return response.data;
  } catch (error) {
    console.error('Error fetching incidents:', error);
    throw error;
  }
};

export const fetchSystemHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error fetching system health:', error);
    throw error;
  }
};

export const fetchIncidentAnalysis = async (index: number) => {
  try {
    const response = await api.get(`/incident-analysis/${index}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching incident analysis:', error);
    throw error;
  }
};

export const fetchIncidentTelemetry = async (unitId: string, startTime: string, endTime: string) => {
  try {
    const response = await api.get('/incidents/telemetry', {
      params: { unit_id: unitId, start_time: startTime, end_time: endTime }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching telemetry:', error);
    return [];
  }
};

export const fetchDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
};

export default api;
