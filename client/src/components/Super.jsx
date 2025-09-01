// src/components/Super.jsx
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import httpAction from "../utils/httpAction";
import apis from "../utils/apis";
import { useSelector } from "react-redux";

const Super = () => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const user = useSelector((state)=>state.user.value);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        
        // If user exists in store, allow access
        if (user) {
          setIsAuth(true);
          setLoading(false);
          return;
        }
        
        // If no user in store, check with server
        const result = await httpAction({ url: apis().getAccess, method: "GET" });
        if (result?.status) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err.message);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    // Only check access if we don't have a user
    if (!user) {
      checkAccess();
    } else {
      setIsAuth(true);
      setLoading(false);
    }
  }, [user]);

  if (loading && !isAuth) return <p>Loading...</p>;
  if (!isAuth) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default Super;
