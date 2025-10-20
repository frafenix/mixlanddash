import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DarkModeState {
  isEnabled: boolean;
}

// Funzione per leggere il tema dal localStorage
const getInitialDarkMode = (): boolean => {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === '1';
    }
    // Se non c'è un valore salvato, usa la preferenza del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

const initialState: DarkModeState = {
  isEnabled: getInitialDarkMode(),
};

export const styleSlice = createSlice({
  name: "darkMode",
  initialState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean | null>) => {
      state.isEnabled =
        action.payload !== null ? action.payload : !state.isEnabled;

      if (typeof document !== "undefined") {
        document.body.classList[state.isEnabled ? "add" : "remove"](
          "dark-scrollbars",
        );

        document.documentElement.classList[state.isEnabled ? "add" : "remove"](
          "dark",
          "dark-scrollbars-compat",
        );
      }

      // Persisti la preferenza del tema nel localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('darkMode', state.isEnabled ? '1' : '0');
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const { setDarkMode } = styleSlice.actions;

export default styleSlice.reducer;
