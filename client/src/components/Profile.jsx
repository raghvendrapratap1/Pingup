// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Logout } from "lucide-react"; // using lucide icons
// import httpAction from "../utils/httpAction";
// import apis from "../utils/apis";

// const Profile = () => {
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const getUser = async () => {
//       const data = { url: apis().userProfile };
//       const result = await httpAction(data);
//       if (result?.status) {
//         setUser(result?.user);
//       }
//       console.log(result);
//     };
//     getUser();
//   }, []);

//   const logoutHandler = async () => {
//     const data = { 
//         url: apis().logout 
//     };
//     const result = await httpAction(data);
//     if (result?.status) {
//       navigate("/login");
//     }
//     console.log(result);
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 px-4">
//       <div className="w-full max-w-sm bg-white shadow-xl rounded-2xl p-6 text-center">
//         {/* Avatar */}
//         <div className="flex justify-center">
//           <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-3xl font-bold shadow-md">
//             {user?.name ? user?.name.charAt(0).toUpperCase() : "U"}
//           </div>
//         </div>

//         {/* Name & Email */}
//         <h2 className="mt-4 text-xl font-semibold text-gray-800">
//           {user?.name}
//         </h2>
//         <p className="text-gray-500 text-sm">{user?.email}</p>

//         {/* Divider */}
//         <div className="my-4 border-t border-gray-200" />

//         {/* Logout button */}
//         <button
//           onClick={logoutHandler}
//           className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg shadow-md transition duration-300"
//         >
//           <Logout size={18} /> Logout
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Profile;
