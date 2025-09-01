import React, { useState } from 'react';
import { RxUpdate } from "react-icons/rx";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import apis from '../utils/apis';
import httpAction from '../utils/httpAction';
import toast from 'react-hot-toast';

const UpdatePassword = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const initialState = {
        password: ''
    };

    const validationSchema = Yup.object({
        password: Yup.string().required('Password is required')
    });

    const submitHandler = async(values) => {
        const data = {
            url: apis().updatePassword,
            method: 'POST',
            body: { email: localStorage.getItem("email"), password: values.password }
        };

        const result = await httpAction(data);
        if (result?.status) {
            toast.success(result?.message);
            navigate('/');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 md:p-8">
                <Formik
                    onSubmit={submitHandler}
                    validationSchema={validationSchema}
                    initialValues={initialState}
                >
                    {({ handleBlur, handleChange, values, touched, errors }) => (
                        <Form>
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 shadow-md mb-3">
                                    <RxUpdate size={28} />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">Update Your Password</h2>
                                <p className="text-gray-500 text-sm">Create your new password</p>
                            </div>

                            <div className="mb-5">
                                <TextField
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    size="small"
                                    fullWidth
                                    error={touched.password && Boolean(errors.password)}
                                    helperText={touched.password && errors.password}
                                    label="New Password"
                                    // InputProps={{
                                    //     endAdornment: (
                                    //         <InputAdornment position="end">
                                    //             <IconButton
                                    //                 onClick={() => setShowPassword(!showPassword)}
                                    //             >
                                    //                 {showPassword ? <VisibilityOff /> : <Visibility />}
                                    //             </IconButton>
                                    //         </InputAdornment>
                                    //     )
                                    // }}
                                />
                            </div>

                            <div className="mb-4">
                                <Button 
                                    variant="contained" 
                                    fullWidth 
                                    type="submit" 
                                    className="!bg-indigo-600 hover:!bg-indigo-700 !py-2 !rounded-lg !normal-case !text-sm"
                                >
                                    Update Password
                                </Button>
                            </div>

                            <div>
                                <Button
                                    onClick={() => navigate('/')}
                                    startIcon={<ArrowBack />}
                                    variant="outlined"
                                    fullWidth
                                    className="!border-gray-400 !text-gray-700 hover:!bg-gray-50 !py-2 !rounded-lg !normal-case !text-sm"
                                >
                                    Back to Login
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default UpdatePassword;
