// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout, Button } from 'antd';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'; // <<< IMPORTAR

// ... (imports das páginas)
import HomePage from './pages/Home/Home';
import PostDetailPage from './pages/PostDetail/PostDetailPage';
import CategoryPage from './pages/CategoryPage/CategoryPage';
import AllCategoriesPage from './pages/AllCategoriesPage/AllCategoriesPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import SobrePage from './pages/SobrePage/SobrePage';
import SearchPage from './pages/SearchPage/SearchPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';

import './index.css';

const { Content } = Layout;

function App() {
  return (
    // BrowserRouter agora está em AuthProvider ou main.jsx
    // Se AuthProvider não tiver BrowserRouter, mantenha aqui
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Content style={{ flex: '1 0 auto', backgroundColor: 'var(--bg-primary, #fff)' }}> {/* Usa variável de tema */}
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:postId" element={<PostDetailPage />} />
          <Route path="/categoria/:categorySlug" element={<CategoryPage />} />
          <Route path="/categorias" element={<AllCategoriesPage />} />
          <Route path="/busca" element={<SearchPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/sobre" element={<SobrePage />} />
          
          {/* Rotas Protegidas */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'author']} />}> {/* Protege rotas aninhadas */}
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Adicione outras rotas que precisam de login e roles específicas aqui dentro */}
            {/* Ex: <Route path="/dashboard/profile" element={<UserProfilePage />} /> */}
          </Route>

          {/* Páginas Placeholder */}
          <Route path="/noticias" element={<div>Página de Notícias (em breve)</div>} />
          <Route path="/contato" element={<div>Página de Contato (em breve)</div>} />
          <Route path="/politica-de-privacidade" element={<div>Página de Política de Privacidade (em breve)</div>} />

          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <h1>404 - Página Não Encontrada</h1>
              <p>O endereço que você tentou acessar não existe.</p>
              <Link to="/"><Button type="primary" style={{marginTop: '20px'}}>Voltar para Home</Button></Link>
            </div>
          } />
        </Routes>
      </Content>
      <Footer />
    </Layout>
  );
}

// Envolver App com BrowserRouter se não estiver em main.jsx ou AuthProvider
// const AppWithRouter = () => (
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>
// );
// export default AppWithRouter;

export default App; // Se BrowserRouter está em main.jsx ou AuthProvider