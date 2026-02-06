import logo from "./logo.svg";
import "./App.css";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import SummaryApi from "./common";
import Context from "./context";
import { useDispatch, useSelector } from "react-redux";
import { setUserDetails } from "./store/userSlice";
import Sidebar from "./components/Sidebar";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user?.user);
  const location = useLocation(); // Get current path

  const fetchUserDetails = async () => {
    const dataResponse = await fetch(SummaryApi.current_user.url, {
      method: SummaryApi.current_user.method,
      credentials: "include",
    });
    const dataApi = await dataResponse.json();

    if (dataApi.success) {
      dispatch(setUserDetails(dataApi.data));
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  
const isAdminPanel = location.pathname.startsWith("/admin-panel");

return (
  <ThemeProvider>
    <Context.Provider value={{ fetchUserDetails }}>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        className="dark:bg-slate-800"
      />
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
        {/* Sidebar only when logged in and not admin-panel route */}
        {user && !isAdminPanel && <Sidebar />}

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="min-h-[calc(100vh-120px)] p-4 lg:p-6 transition-colors duration-300">
            <Outlet />
          </main>
          {/* Footer only if not in admin-panel route */}
          {!isAdminPanel && <Footer />}
        </div>
      </div>
    </Context.Provider>
  </ThemeProvider>
);
}

export default App;
