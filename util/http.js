import axios from "axios";
import { backendUrl } from "../secrets";


const BACKEND_URL =  backendUrl;

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Utility function to estimate size in KB
const getSizeInKB = (data) => {
  try {
    const size = JSON.stringify(data).length; // in characters ≈ bytes
    return (size / 1024).toFixed(2); // in KB
  } catch {
    return '0';
  }
};


// Request interceptor to log request details
apiClient.interceptors.request.use(
  (config) => {
    const method = config.method?.toUpperCase();
    const url = config.url;
    const dataSize = getSizeInKB(config.data || {});

    console.log(`[REQUEST] ${method} ${url} | Payload: ${dataSize} KB`);
    return config;
  },
  (error) => {
    console.error('[REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Response interceptor to log response size
apiClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase();
    const url = response.config.url;
    const responseSize = getSizeInKB(response.data || {});

    console.log(`[RESPONSE] ${method} ${url} | Response: ${responseSize} KB`);
    return response;
  },
  (error) => {
    console.error('[RESPONSE ERROR]', error);
    return Promise.reject(error);
  }
);

export const addClass = async (classData) => {
  try {
    console.log(classData);
    await apiClient.post("/classes.json", classData);
    console.log("Class added successfully");
  } catch (error) {
    console.error("Error adding class:", error);
  }
};


export const fetchClasses = async () => {
  try {
    const response = await apiClient.get("/classes.json");

    const classes = [];

    for (const key in response.data) {
      const classObj = {
        id: key,
        date: response.data[key].date,
        startTime: response.data[key].startTime,
        endTime: response.data[key].endTime,
        className: response.data[key].className,
        instructor: response.data[key].instructor,
        description: response.data[key].description,
      };
      classes.push(classObj);
    }

    return classes;
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error; // optional, in case caller wants to handle it
  }
};


export const updateClass = (classId, classData) => {
  return apiClient.put(`/classes/${classId}.json`, classData);
};

export const deleteClass = (classId) => {
  return apiClient.delete(`/classes/${classId}.json`);
};