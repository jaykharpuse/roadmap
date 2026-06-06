import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./state/store.tsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/authContext.tsx";
import { ThemeProvider } from "next-themes";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster theme="dark" />
          <App />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </ThemeProvider>
);
