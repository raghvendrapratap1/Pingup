import React, { useState } from 'react';
import { IoPersonAddSharp } from "react-icons/io5";
import { TextField, Button, IconButton, InputAdornment, Divider } from '@mui/material';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { ArrowBack, Google, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import httpAction from '../utils/httpAction';
import apis from '../utils/apis';
import toast from 'react-hot-toast';

const Register = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  const visibleHandler = () => setVisible(!visible);

  const initialState = {
    full_name: '',
    email: '',
    password: ''
  };

  const validationSchema = Yup.object({
    full_name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required')
  });

  const submitHandler = async (values, { resetForm }) => {
    try {
      const data = {
        url: apis().registerUser,
        method: 'POST',
        body: values
      };

      const result = await httpAction(data);
      console.log(result);

      resetForm();

      if (result?.status) {
        toast.success(result?.message || "Registration successful");
        navigate('/login');
      } else {
        toast.error(result?.message || "Registration failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
      console.error(error);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <IoPersonAddSharp className="text-5xl text-blue-600 mb-2" />
          <p className="text-2xl font-bold text-gray-800">Register New Account</p>
          <span className="text-gray-500 text-sm mt-1">Sign up to continue</span>
        </div>

        <Formik
          initialValues={initialState}
          validationSchema={validationSchema}
          onSubmit={submitHandler}
        >
          {({ handleBlur, handleChange, values, touched, errors }) => (
            <Form className="flex flex-col gap-4">
              {/* Name */}
              <TextField
                name="full_name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
                label="Enter your name"
                fullWidth
                size="small"
              />

              {/* Email */}
              <TextField
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                label="Enter your email"
                fullWidth
                size="small"
              />

              {/* Password */}
              <TextField
                // InputProps={{
                //   endAdornment: (
                //     <InputAdornment position="end">
                //       <IconButton onClick={visibleHandler} edge="end">
                //         {visible ? <Visibility /> : <VisibilityOff />}
                //       </IconButton>
                //     </InputAdornment>
                //   )
                // }}
                name="password"
                type={visible ? 'text' : 'password'}
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                label="Create your password"
                fullWidth
                size="small"
              />

              {/* Register Button */}
              <Button type="submit" variant="contained" color="primary" fullWidth className="!py-3 !rounded-lg font-semibold">
                Register
              </Button>

              <Divider className="!my-4">OR</Divider>

              {/* Google Button */}
              <Button
                variant="outlined"
                fullWidth
                endIcon={<Google />}
                onClick={() => window.location.href = 'http://localhost:4000/auth/google'}
                className="!py-3 !rounded-lg"
              >
                Continue with Google
              </Button>

              {/* Back to login */}
              <Button
                onClick={() => navigate('/')}
                fullWidth
                startIcon={<ArrowBack />}
                variant="outlined"
                className="!py-3 !rounded-lg"
              >
                Back to Login
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Register;