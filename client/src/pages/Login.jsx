import React, { useState } from "react";
import {
  TextField,
  Button,
  Divider,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Google,
  Visibility,
  VisibilityOff,
  MailOutline,
  LockOutlined,
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchUser } from "../features/user/userSlice";
import { fetchConnections } from "../features/connections/connectionsSlice";
import httpAction from "../utils/httpAction";
import apis from "../utils/apis";
import toast from "react-hot-toast";
import { RiLoginCircleFill } from "react-icons/ri";


const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initialState = { email: "", password: "" };

  // ✅ Validation
  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "At least 6 characters")
      .required("Password is required"),
  });

  // ✅ Submit handler
  const handleSubmit = async (values) => {
    try {
      const data = {
        url: apis().loginUser,
        method: "POST",
        body: values,
      };

      const result = await httpAction(data);
      if (result?.status) {
        toast.success(result?.message || "Login successful");
        // Optimistically hydrate user and connections in background
        dispatch(fetchUser());
        dispatch(fetchConnections());
        navigate("/", { replace: true });
      } else {
        toast.error(result?.message || "Login failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };


  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };


  return (
    <div className="w-screen h-screen flex">
      {/* Left Branding */}
      <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-blue-400 via-blue-300 to-indigo-300 text-white p-12 relative">
        <img
          src={assets.logo}
          alt="Logo"
          className="w-28 h-28 mb-6 object-contain"
        />
        <h1 className="text-4xl font-bold">Welcome Back!</h1>
        <p className="mt-4 text-lg text-center max-w-sm opacity-90">
          Connect with your team, manage your work, and explore new opportunities.
        </p>
        <img
          src={assets.bgImage}
          alt="Background"
          className="absolute bottom-0 right-0 w-1/2 opacity-20"
        />
      </div>

      {/* Right Login Form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-10 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-xl p-8 shadow-lg">
            <div className="flex flex-col items-center text-center mb-6">
            <RiLoginCircleFill className="text-5xl text-blue-600 mb-2"/>
            <p className="text-2xl font-bold text-gray-800">Login Account</p>

          </div>

          <Formik
            initialValues={initialState}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur }) => (
              <Form className="flex flex-col gap-6">
                {/* Email */}
                <TextField
                  placeholder="Enter your email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  variant="standard"
                  fullWidth
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutline />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Password */}
                <TextField
                  placeholder="Enter your password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  variant="standard"
                  fullWidth
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Login Button */}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className="!py-3 !rounded-lg font-semibold"
                  fullWidth
                >
                  Login
                </Button>
              </Form>
            )}
          </Formik>

          <Divider className="!my-6">OR</Divider>

          {/* Google Login */}
          <Button
            variant="outlined"
            startIcon={<Google />}
            onClick={handleGoogleLogin}
            className="!py-3 !rounded-lg"
            fullWidth
          >
            Continue with Google
          </Button>

          {/* Extra Links */}
          <div className="flex justify-between items-center mt-6 text-sm text-blue-600 font-medium">
            <button
              onClick={() => navigate("/forgot-password")}
              className="hover:underline"
            >
              Forgot Password?
            </button>
            <button
              onClick={() => navigate("/register")}
              className="hover:underline"
            >
              Create New Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
