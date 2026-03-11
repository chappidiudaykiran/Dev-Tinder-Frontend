import { createSlice } from "@reduxjs/toolkit";

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("loggedInUser");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};


const userSlice = createSlice({
  name: "user",
  initialState: {
    userInfo: getStoredUser(),
  },
  reducers: {
    addUser: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem("loggedInUser", JSON.stringify(action.payload));
    },
    removeUser: () => {
      localStorage.removeItem("loggedInUser");
      return { userInfo: null };
    }
  },
});

export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;