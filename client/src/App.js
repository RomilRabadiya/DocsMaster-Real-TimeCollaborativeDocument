import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard";
import DocsBoard from "./pages/DocsBoard";
import SharedDocuments from "./pages/SharedDocuments";

//Main component of the application

//We can define Router for different pages in this component
//Path is our API endpoint which is define in noteApis.js file

function App() {
  //Check User Login in local storage or not
  const isAuthenticated = !!localStorage.getItem("token");
//If user Login then Navigate to /login
const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to="/login" />}
        />

        {/* Public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/documents" element={<ProtectedRoute><DocsBoard /></ProtectedRoute>}
        />
        //Protected Route for Shared Documents
        //ProtectedRoute mean user must be logged in to access this route
        
        <Route path="/shared" element={<ProtectedRoute><SharedDocuments /></ProtectedRoute>}
        />
      </Routes>
    </Router>
  );
}

export default App;