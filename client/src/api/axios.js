import axios from "axios";

const baseURL = import.meta.env.VITE_BASEURL || "https://pingup-back.vercel.app";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;


