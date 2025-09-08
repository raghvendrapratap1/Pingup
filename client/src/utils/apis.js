

const apis=()=>{
    const local = "https://pingup-back.vercel.app/api";

    const list={
        registerUser: `${local}/user/register`,
        loginUser: `${local}/user/login`,
        logoutUser: `${local}/user/logout`,
        userProfile:`${local}/user/profile`,
        logout:`${local}/user/logout`,
        getAccess:`${local}/user/access`,
        forgotPassword:`${local}/user/forgot-password`,
        verifyOtp:`${local}/user/otp-verify`,
        getTime:`${local}/user/otp/time`,
        updatePassword:`${local}/user/update-password`
    };

    return list;
}

export default apis;