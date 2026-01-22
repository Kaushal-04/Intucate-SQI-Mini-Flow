
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import AdminConsole from './pages/AdminConsole';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminConsole />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
