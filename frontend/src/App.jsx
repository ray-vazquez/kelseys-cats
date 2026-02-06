import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import CatsPage from './pages/CatsPage.jsx';
import CatDetailPage from './pages/CatDetailPage.jsx';
import AlumniPage from './pages/AlumniPage.jsx';
import AlumniDetailPage from './pages/AlumniDetailPage.jsx';
import AdoptionPage from './pages/AdoptionPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminCatsPage from './pages/AdminCatsPage.jsx';
import AdminCatEditPage from './pages/AdminCatEditPage.jsx';
import PublicNavbar from './components/Layout/PublicNavbar.jsx';
import AdminNavbar from './components/Layout/AdminNavbar.jsx';
import Footer from './components/Layout/Footer.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

function AdminLayout({ children }) {
  const { isAuthenticated } = useAuth();
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
      </Routes>
    </AuthProvider>
  );
}
