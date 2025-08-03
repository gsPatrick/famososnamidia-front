// src/App.jsx
import React from 'react';
// <<< REMOVA o import do Router daqui >>>
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
// <<< REMOVA os imports dos Providers daqui >>>

// Componentes
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Páginas
import HomePage from './pages/Home/Home';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import PostDetailPage from './pages/PostDetailPage/PostDetailPage';
import CategoryPage from './pages/CategoryPage/CategoryPage';
import AllCategoriesPage from './pages/AllCategoriesPage/AllCategoriesPage';
import SearchPage from './pages/SearchPage/SearchPage';
import SobrePage from './pages/SobrePage/SobrePage';
import AuthorPage from './pages/AuthorPage/AuthorPage';

const { Content } = Layout;

function App() {
  return (
    // <<< O <Router> e os <Providers> foram REMOVIDOS daqui >>>
    <Layout className="app-layout">
      <Header />
      <Content className="main-content">
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/post/:postId" element={<PostDetailPage />} />
          <Route path="/categoria/:categorySlug" element={<CategoryPage />} />
          <Route path="/categorias" element={<AllCategoriesPage />} />
          <Route path="/busca" element={<SearchPage />} />
          <Route path="/sobre" element={<SobrePage />} />
          <Route path="/autor/:authorId" element={<AuthorPage />} />

          {/* Rotas Protegidas */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'author']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Rota para Not Found (Opcional) */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </Content>
      <Footer />
    </Layout>
  );
}

export default App;