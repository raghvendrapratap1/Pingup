import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASEURL,
  withCredentials: true, // ✅ cookie send/receive ke liye
//   headers: {
//     "Content-Type": "application/json",
//   },
});

export default api;


