import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import CatsPage from './pages/CatsPage.jsx';
import CatDetailPage from './pages/CatDetailPage.jsx';
import PartnerCatDetailPage from './pages/PartnerCatDetailPage.jsx';
import AlumniPage from './pages/AlumniPage.jsx';
import AlumniDetailPage from './pages/AlumniDetailPage.jsx';
import AdoptionPage from './pages/AdoptionPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminCatsPage from './pages/AdminCatsPage.jsx';
import AdminCatEditPage from './pages/AdminCatEditPage.jsx';
import AdminDeletedCatsPage from './pages/AdminDeletedCatsPage.jsx';
import AdminScraperPage from './pages/AdminScraperPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import AdminNotFoundPage from './pages/AdminNotFoundPage.jsx';
import PublicNavbar from './components/Layout/PublicNavbar.jsx';
import AdminNavbar from './components/Layout/AdminNavbar.jsx';
import Footer from './components/Layout/Footer.jsx';
import LoadingState from './components/Common/LoadingState.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

function AdminLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  // Wait for auth to initialize before deciding
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LoadingState message="Checking authentication..." />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return (
    <>
      <AdminNavbar />
      {children}
    </>
  );
}

// Special layout for admin 404 - shows different content based on auth
function AdminNotFoundLayout() {
  const { isAuthenticated, loading } = useAuth();
  
  // Wait for auth to initialize
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LoadingState message="Loading..." />
      </div>
    );
  }
  
  if (isAuthenticated) {
    // Logged in: show admin 404 with admin navbar
    return (
      <>
        <AdminNavbar />
        <AdminNotFoundPage />
      </>
    );
  }
  
  // Not logged in: show public 404 (they're trying to access admin area without auth)
  return (
    <>
      <PublicNavbar />
      <NotFoundPage />
      <Footer />
    </>
  );
}

function PublicLayout({ children }) {
  return (
    <>
      <PublicNavbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/"
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          }
        />
        <Route
          path="/cats"
          element={
            <PublicLayout>
              <CatsPage />
            </PublicLayout>
          }
        />
        {/* Partner cat detail - MUST come before /cats/:id */}
        <Route
          path="/cats/partner/:id"
          element={
            <PublicLayout>
              <PartnerCatDetailPage />
            </PublicLayout>
          }
        />
        <Route
          path="/cats/:id"
          element={
            <PublicLayout>
              <CatDetailPage />
            </PublicLayout>
          }
        />
        <Route
          path="/alumni"
          element={
            <PublicLayout>
              <AlumniPage />
            </PublicLayout>
          }
        />
        <Route
          path="/alumni/:id"
          element={
            <PublicLayout>
              <AlumniDetailPage />
            </PublicLayout>
          }
        />
        <Route
          path="/adoption"
          element={
            <PublicLayout>
              <AdoptionPage />
            </PublicLayout>
          }
        />
        <Route
          path="/about"
          element={
            <PublicLayout>
              <AboutPage />
            </PublicLayout>
          }
        />
        <Route
          path="/admin/login"
          element={
            <PublicLayout>
              <AdminLoginPage />
            </PublicLayout>
          }
        />
        <Route
          path="/admin/cats"
          element={
            <AdminLayout>
              <AdminCatsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/cats/deleted"
          element={
            <AdminLayout>
              <AdminDeletedCatsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/cats/new"
          element={
            <AdminLayout>
              <AdminCatEditPage mode="create" />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/cats/:id/edit"
          element={
            <AdminLayout>
              <AdminCatEditPage mode="edit" />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/scraper"
          element={
            <AdminLayout>
              <AdminScraperPage />
            </AdminLayout>
          }
        />
        {/* Admin catch-all - shows 404 without redirect */}
        <Route
          path="/admin/*"
          element={<AdminNotFoundLayout />}
        />
        {/* Public catch-all 404 route - MUST BE LAST */}
        <Route
          path="*"
          element={
            <PublicLayout>
              <NotFoundPage />
            </PublicLayout>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
