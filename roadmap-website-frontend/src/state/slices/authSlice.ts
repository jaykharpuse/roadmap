import type { authState } from "@/types/user/authSlice.types";
import { createSlice } from "@reduxjs/toolkit";

import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helper/axiosInstance";

export const registerUser = createAsyncThunk<
  any,
  { username: string; email: string; password: string; profileFile?: File },
  { rejectValue: string }
>("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("username", userData.username);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    if (userData.profileFile) {
      // backend expects the upload field name `profileUrl` (multer.single('profileUrl'))
      formData.append("profileUrl", userData.profileFile);
    }

    const { data } = await axiosInstance.post(`user/register`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

// Verify User
export const verifyUser = createAsyncThunk<
  any,
  { email: string; code: string },
  { rejectValue: string }
>("auth/verifyUser", async (verifyData, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post(`/user/verify-code`, verifyData, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

// Login User
export const loginUser = createAsyncThunk<
  any,
  { email: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async (loginData, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post(`/user/sign-in`, loginData, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true, // important for cookies
    });
    
    // Save token to localStorage for Authorization header backup
    if (data.token) {
      localStorage.setItem("authToken", data.token);
    }
    
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

// Logout User
export const logoutUser = createAsyncThunk<any, void, { rejectValue: string }>(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/user/logout`);
      localStorage.removeItem("authToken");
      return data;
    } catch (error: any) {
      localStorage.removeItem("authToken");
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Forgot Password
export const forgotPassword = createAsyncThunk<
  any,
  { email: string },
  { rejectValue: string }
>("auth/forgotPassword", async (emailData, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post(`/user/forgot-password`, emailData, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

// Reset Password
export const resetPassword = createAsyncThunk<
  any,
  { token: string; password: string },
  { rejectValue: string }
>("auth/resetPassword", async ({ token, password }, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.put(
      `/user/reset-password/${token}`,
      { password },
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

// Google Sign In / Sign Up
export const googleSignIn = createAsyncThunk<
  any,
  { access_token: string },
  { rejectValue: string }
>("auth/googleSignIn", async ({ access_token }, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post(
      `/user/auth/google`,
      { access_token },
      { withCredentials: true }
    );
    if (data.token) {
      localStorage.setItem("authToken", data.token);
    }
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

// Link Google Account
export const linkGoogleAccount = createAsyncThunk<
  any,
  { access_token: string },
  { rejectValue: string }
>("auth/linkGoogleAccount", async ({ access_token }, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post(
      `/user/auth/google/link`,
      { access_token },
      { withCredentials: true }
    );
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

// Unlink Google Account
export const unlinkGoogleAccount = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>("auth/unlinkGoogleAccount", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post(
      `/user/auth/google/unlink`,
      {},
      { withCredentials: true }
    );
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

// Set Password for Google-only users
export const setPasswordForGoogleUser = createAsyncThunk<
  any,
  { password: string },
  { rejectValue: string }
>("auth/setPasswordForGoogleUser", async ({ password }, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post(
      `/user/auth/google/set-password`,
      { password },
      { withCredentials: true }
    );
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

const initialState: authState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
      })

      // Verify
      .addCase(verifyUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyUser.rejected, (state) => {
        state.isLoading = false;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, () => {})

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state) => {
        state.isLoading = false;
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state) => {
        state.isLoading = false;
      })

      // Google Sign In
      .addCase(googleSignIn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(googleSignIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(googleSignIn.rejected, (state) => {
        state.isLoading = false;
      })

      // Link Google
      .addCase(linkGoogleAccount.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(linkGoogleAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.user) state.user = action.payload.user;
      })
      .addCase(linkGoogleAccount.rejected, (state) => {
        state.isLoading = false;
      })

      // Unlink Google
      .addCase(unlinkGoogleAccount.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(unlinkGoogleAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.user) state.user = action.payload.user;
      })
      .addCase(unlinkGoogleAccount.rejected, (state) => {
        state.isLoading = false;
      })

      // Set Password for Google user
      .addCase(setPasswordForGoogleUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(setPasswordForGoogleUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(setPasswordForGoogleUser.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {} = authSlice.actions;
export const authReducer = authSlice.reducer;
