import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Navigation from './components/Navigation';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import ObjectsListPage from './pages/ObjectsListPage';
import AddObjectPage from './pages/AddObjectPage';
import ObjectDetailsPage from './pages/ObjectDetailsPage';
import ReservationsPage from './pages/ReservationsPage';
import SchedulesPage from './pages/SchedulesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ObjectReservationPage from './pages/ObjectReservationPage';
import MyObjectsPage from './pages/MyObjectsPage';
import AboutPage from './pages/AboutPage';
import EditObjectPage from './pages/EditObjectPage';
import ProfilePage from './pages/ProfilePage';

import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navigation />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/objects" element={<ObjectsListPage />} />
              <Route path="/objects/my" element={<MyObjectsPage />} />
              <Route path="/objects/add" element={<AddObjectPage />} />
              <Route path="/objects/:id" element={<ObjectDetailsPage />} />
              <Route path="/objects/:id/edit" element={<EditObjectPage />} />
              <Route path="/objects/:id/reserve" element={<ObjectReservationPage />} />
              <Route path="/reservations" element={<ReservationsPage />} />
              <Route path="/schedules" element={<SchedulesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
