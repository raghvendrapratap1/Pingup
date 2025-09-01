// features/user/userSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios.js';
import { toast } from 'react-hot-toast';                  // ✅ MISSING import added

const initialState = {
  value: null
};

// ✅ token param हटाया; cookie-based request (axios withCredentials=true होना चाहिए)
export const fetchUser = createAsyncThunk('user/fetchUser', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('api/user/data');       // ✅ no headers; cookies auto-send
    return data.success ? data.user : null;
  } catch (error) {
    // Completely suppress 401 errors - user is just not logged in
    if (error.response?.status === 401) {
      return rejectWithValue(null);
    }
    // Only log other errors, don't show toasts
    console.error('Fetch user error:', error);
    return rejectWithValue(null);
  }
});

// ✅ updatehUser को भी cookie-based कर दिया; token optional हटा दिया
export const updateUser = createAsyncThunk('user/update', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('api/user/update', userData); // ✅ no headers
    if (data.success) {
      toast.success(data.message);
      return data.user;
    } else {
      toast.error(data.message);
      return rejectWithValue(null);
    }
  } catch (error) {
    console.error('Update user error:', error);
    toast.error('Failed to update user');
    return rejectWithValue(null);
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.value = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.value = action.payload;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.value = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.value = action.payload;
      })
      .addCase(updateUser.rejected, (state) => {
        // Keep existing user state on update failure
      });
  }
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;




// import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
// import api from '../../api/axios.js'
// const initialState = {
//     value:null   
// }

// export const fetchUser = createAsyncThunk('user/fetchUser',async(token)=>{
//     const {data} = await api.get('api/user/data',{
//         headers: {Authorization : `Bearer ${token}`}
//     })
//     return data.success ? data.user : null;
// })

// export const updatehUser = createAsyncThunk('user/update',async({userData,token})=>{
//     const {data} = await api.post('api/user/update',userData,{
//         headers: {Authorization : `Bearer ${token}`}
//     })
//     if(data.success){
//         toast.success(data.message)
//         return data.user
//     }
//     else{
//         toast.error(data.message);
//         return null
//     }
//     return data.success ? data.user : null;
// })

// const userSlice = createSlice({
//     name:'user',
//     initialState,
//     reducers:{

//     },
//     extraReducers: (builder)=>{
//         builder.addCase(fetchUser.fulfilled,(state,action)=>{
//             state.value = action.payload;
//         }).addCase(updatehUser.fulfilled,(state,action)=>{
//             state.value = action.payload
//         })
//     }
// })

// export default userSlice.reducer;
