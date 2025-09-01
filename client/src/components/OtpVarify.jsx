import React, { useEffect, useState } from 'react';
import { MdOutlineVerified } from "react-icons/md";
import { TextField, Button } from '@mui/material';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { ArrowBack } from '@mui/icons-material';
import Countdown from 'react-countdown';
import { useNavigate } from 'react-router-dom';
import apis from '../utils/apis';
import httpAction from '../utils/httpAction';
import toast from 'react-hot-toast';

const OtpVarify = () => {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(5 * 60 * 1000);

  const initialState = {
    otp1: '',
    otp2: '',
    otp3: '',
    otp4: '',
    otp5: '',
    otp6: ''
  };

  const validationSchema = Yup.object({
    otp1: Yup.string().required(''),
    otp2: Yup.string().required(''),
    otp3: Yup.string().required(''),
    otp4: Yup.string().required(''),
    otp5: Yup.string().required(''),
    otp6: Yup.string().required('')
  });

  const submitHandler = async (values) => {
    const otp =
      values.otp1 +
      values.otp2 +
      values.otp3 +
      values.otp4 +
      values.otp5 +
      values.otp6;

const data = {
  url: apis().verifyOtp,
  method: "POST",
  body: { otp: otp, email: localStorage.getItem("email") }
};

    console.log("🚀 Sending OTP to backend:", otp);
    const result = await httpAction(data);
    console.log("✅ Backend Response:", result);

    if (result?.status) {
      toast.success(result.message);
      navigate("/update-password");
    } else {
      toast.error(result?.message || "Something went wrong");
    }
  };

  const otpArray = ['otp1', 'otp2', 'otp3', 'otp4', 'otp5', 'otp6'];

  const inputChange = (value, setFieldValue, index, item) => {
    setFieldValue(item, value);

    if (value && index < 6) {
      const nextElement = document.getElementById(index + 1);
      nextElement?.focus();
    }
  };

  const getTimer = async () => {
    const data = {
      url: apis().getTime,
      method: "POST",
      body: { email: localStorage.getItem("email") },
    };

    const result = await httpAction(data);
    console.log("Raw result:", result);

    if (result?.status) {
      const serverTime = result?.time;
      const now = new Date().getTime();
      const diff = serverTime + 10 * 1000 - now;
      setTimer(diff > 0 ? diff : 0);
    }
  };

  useEffect(() => {
    getTimer();
  }, []);

  const resendOtp = async () => {
    const data = {
      url: apis().forgotPassword,
      method: "POST",
      body: { email: localStorage.getItem("email") },
    };

    const result = await httpAction(data);
    console.log(result);

    if (result?.status) {
      setTimer(10 * 1000);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <MdOutlineVerified className="text-5xl text-blue-600 mb-2" />
          <p className="text-2xl font-bold text-gray-800">Verify OTP</p>
          <span className="text-gray-500 text-sm mt-1">
            Enter the 6-digit OTP we just sent to your registered email
          </span>
        </div>

        {/* Form */}
        <Formik
          onSubmit={submitHandler}
          validationSchema={validationSchema}
          initialValues={initialState}
        >
          {({ handleBlur, values, touched, errors, setFieldValue }) => (
            <Form className="flex flex-col gap-5">
              
              {/* OTP Inputs */}
              <div className="grid grid-cols-6 gap-3">
                {otpArray.map((item, index) => (
                  <TextField
                    key={index}
                    value={values[item]}
                    onChange={(event) => {
                      const value = event.target.value.replace(/[^0-9]/g, "");
                      inputChange(value, setFieldValue, index + 1, item);
                    }}
                    inputProps={{
                      maxLength: 1,
                      pattern: "[0-9]*",
                      className: "text-center text-lg font-bold"
                    }}
                    id={index + 1}
                    type="text"
                    name={item}
                    size="small"
                    onBlur={handleBlur}
                    error={touched[item] && Boolean(errors[item])}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <Button
                disabled={Object.values(values).some(v => v === '')}
                variant="contained"
                fullWidth
                type="submit"
                className="!py-3 !rounded-lg font-semibold"
              >
                Verify
              </Button>

              {/* Back Button */}
              <Button
                onClick={() => navigate('/')}
                endIcon={<ArrowBack />}
                variant="outlined"
                fullWidth
                className="!py-3 !rounded-lg"
              >
                Back to Login
              </Button>


              {/* Countdown */}
              <div className="text-center text-gray-600 font-medium">
                <Countdown
                  key={timer}
                  date={Date.now() + timer}
                  renderer={({ minutes, seconds, completed }) => {
                    if (completed) {
                      return (
                        <Button onClick={resendOtp} variant="text">
                          Resend OTP
                        </Button>
                      );
                    } else {
                      return (
                        <span>
                          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                        </span>
                      );
                    }
                  }}
                />
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default OtpVarify;
