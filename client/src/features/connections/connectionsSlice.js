import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import api from '../../api/axios.js';

const initialState = {
    connections:[],
    pendingConnections:[],
    followers:[],
    following:[]
}

export const fetchConnections = createAsyncThunk('connections/fetchConnections',
    async () => {
        try {
            const { data } = await api.get('/api/user/connections');
            if (data.success) {
                return data;
            } else {
                console.error('Failed to fetch connections:', data.message);
                return null;
            }
        } catch (error) {
            console.error('Error fetching connections:', error);
            return null;
        }
    }
)

const connectionsSlice = createSlice({
    name:'connections',
    initialState,
    reducers:{},

    extraReducers: (builder)=>{
        builder.addCase(fetchConnections.fulfilled, (state, action) => {
            if (action.payload) {
                state.connections = action.payload.connections || [];
                state.followers = action.payload.followers || [];
                state.following = action.payload.following || [];
                state.pendingConnections = action.payload.pendingConnections || [];
            }
        });
    }
})

export default connectionsSlice.reducer;
