// src/components/Header/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Input, Button, Drawer, Row, Col, Dropdown, Space, Typography, message, Tooltip } from 'antd';
import {
  MenuOutlined, SearchOutlined, DownOutlined, AppstoreOutlined, InfoCircleOutlined,
  LoginOutlined, UserAddOutlined, LogoutOutlined, DashboardOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const { Header: AntHeader } = Layout;
const { Search } = Input;
const { Text } = Typography;

// Lista de categorias (pode vir de uma API no futuro ou contexto)
const availableCategories = [
  { key: 'cinema', label: 'Cinema', slug: 'cinema' },
  { key: 'celebridades', label: 'Celebridades', slug: 'celebridades' },
  { key: 'musica', label: 'Música', slug: 'musica' },
  { key: 'tv-reality', label: 'TV & Reality', slug: 'tv-&-reality' },
  { key: 'esportes', label: 'Esportes', slug: 'esportes' },
  { key: 'internet', label: 'Internet', slug: 'internet' },
];

const categoryDropdownItems = availableCategories.map(category => ({
  key: `categoria-${category.key}`,
  label: <Link to={`/categoria/${category.slug}`}>{category.label}</Link>,
}));

const Header = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentSelectedKey, setCurrentSelectedKey] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoggedIn, isAdmin, isAuthor, logout, loadingAuth } = useAuth();

  useEffect(() => {
    // Lógica de seleção de item de menu ativo
    const path = location.pathname;
    if (path === '/') {
      setCurrentSelectedKey('home');
    } else if (path === '/categorias') {
      setCurrentSelectedKey('all-categories');
    } else if (path.startsWith('/categoria/')) {
      setCurrentSelectedKey('categories-dropdown');
    } else if (path === '/sobre') {
      setCurrentSelectedKey('sobre-nos');
    } else if (path === '/dashboard' && (isAdmin || isAuthor)) { // Só marca dashboard se for admin/author
      setCurrentSelectedKey('dashboard-header'); // Usado se houver um link explícito "Dashboard" no menu principal
    } else {
      setCurrentSelectedKey(''); // Nenhuma seleção para login, cadastro, post, busca, etc.
    }
  }, [location, isAdmin, isAuthor]); // Depende de isAdmin/isAuthor para lógica do dashboard

  const showDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  const onSearch = (value) => {
    if (value && value.trim() !== '') {
      if (drawerVisible) closeDrawer();
      navigate(`/busca?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleLogout = () => {
    logout(); // AuthContext cuida de limpar localStorage e atualizar currentUser
    // message.success('Logout realizado com sucesso!'); // Pode ser mostrado aqui ou no AuthContext
    // Navegação é feita pelo AuthContext
    if (drawerVisible) closeDrawer();
  };

  const mainMenuItems = [
    { key: 'home', label: <Link to="/">Início</Link> },
    { key: 'all-categories', icon: <AppstoreOutlined />, label: <Link to="/categorias">Todas as Categorias</Link> },
    {
      key: 'categories-dropdown',
      label: (
        <Dropdown menu={{ items: categoryDropdownItems }} overlayClassName="category-dropdown-overlay">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a onClick={(e) => e.preventDefault()} className="ant-dropdown-link category-dropdown-trigger">
            Categorias por Tema <DownOutlined />
          </a>
        </Dropdown>
      ),
    },
    { key: 'sobre-nos', icon: <InfoCircleOutlined />, label: <Link to="/sobre">Sobre Nós</Link> },
    // Opcional: Adicionar link para Dashboard no menu principal se logado como admin/author
    // ...(isLoggedIn && (isAdmin || isAuthor) ? [{ key: 'dashboard-header', icon: <DashboardOutlined />, label: <Link to="/dashboard">Dashboard</Link> }] : []),
  ];

  // Itens para o Drawer (incluindo Auth)
  let drawerFinalItems = mainMenuItems
    .filter(item => !(isLoggedIn && (isAdmin || isAuthor) && item.key === 'dashboard-header')) // Evita duplicar Dashboard se já estiver no main
    .map(item => {
    if (item.key === 'categories-dropdown') {
      return {
        key: 'drawer-categories-submenu',
        label: 'Categorias por Tema',
        icon: <AppstoreOutlined />,
        children: categoryDropdownItems.map(catItem => ({
          key: `drawer-${catItem.key}`,
          label: React.cloneElement(catItem.label, { onClick: closeDrawer })
        }))
      };
    }
    if (React.isValidElement(item.label) && item.label.type === Link) {
      return { ...item, label: React.cloneElement(item.label, { onClick: closeDrawer }) };
    }
    return { ...item };
  });

  // Adiciona itens de autenticação/usuário ao Drawer dinamicamente
  if (!loadingAuth) { // Garante que o estado de auth esteja resolvido
    if (isLoggedIn) {
      if (isAdmin || isAuthor) {
        drawerFinalItems.push({ type: 'divider' });
        drawerFinalItems.push({
          key: 'dashboard-drawer', icon: <DashboardOutlined />,
          label: <Link to="/dashboard" onClick={closeDrawer}>Dashboard</Link>
        });
      }
      drawerFinalItems.push({ type: 'divider' });
      drawerFinalItems.push({
        key: 'user-greeting-drawer',
        // Não é um item de menu clicável, apenas texto informativo
        label: <Text style={{ padding: '12px 24px', color: 'rgba(0, 0, 0, 0.45)', display: 'block', cursor: 'default' }}>Olá, {currentUser?.name}!</Text>,
        className: 'drawer-user-greeting-item', // Para estilização se necessário
        disabled: true, // Ajuda a AntD a não tratar como item de menu normal
      });
      drawerFinalItems.push({
        key: 'logout-drawer', icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />,
        label: (
          <Button type="text" onClick={handleLogout} style={{ width: '100%', textAlign: 'left', paddingLeft: '24px', color: '#ff4d4f' }}>
            Sair
          </Button>
        )
      });
    } else {
      drawerFinalItems.push({ type: 'divider' });
      drawerFinalItems.push({
        key: 'login-drawer', icon: <LoginOutlined />,
        label: <Link to="/login" onClick={closeDrawer}>Login</Link>
      });
      drawerFinalItems.push({
        key: 'register-drawer', icon: <UserAddOutlined />,
        label: <Link to="/cadastro" onClick={closeDrawer}>Cadastre-se</Link>
      });
    }
  }


  return (
    <AntHeader className="app-header modern-header">
      <Row justify="space-between" align="middle" className="header-content-row" wrap={false}>
        <Col flex="none" className="header-left">
           <Button className="menu-toggle-button" type="text" icon={<MenuOutlined />} onClick={showDrawer} />
          <div className="logo modern-logo"><Link to="/">Famosos na Mídia</Link></div>
        </Col>

        <Col flex="auto" className="header-center">
          <Menu
            className="header-menu modern-menu"
            theme="light" mode="horizontal"
            selectedKeys={[currentSelectedKey]}
            items={mainMenuItems} // Menu principal não muda com base no login aqui, apenas o drawer
          />
        </Col>

        <Col flex="none" className="header-right-combined">
          {/* Renderiza a seção de usuário/login apenas quando o estado de autenticação não está carregando */}
          {!loadingAuth && (
            <Space size="middle" align="center" className="user-actions-and-search">
              {isLoggedIn ? (
                <Space size="small" className="user-actions-logged-in">
                  <Text className="user-greeting-text" title={currentUser?.email}>Olá, {currentUser?.name}!</Text>
                  {(isAdmin || isAuthor) && (
                    <Link to="/dashboard">
                      <Button type="default" icon={<DashboardOutlined />} className="dashboard-button-header">Dashboard</Button>
                    </Link>
                  )}
                  <Tooltip title="Sair">
                      <Button type="primary" danger onClick={handleLogout} icon={<LogoutOutlined />} className="logout-button-header" />
                  </Tooltip>
                </Space>
              ) : (
                <Space size="small" className="user-actions-logged-out">
                  <Link to="/login"><Button type="default" icon={<LoginOutlined />} className="login-button-header">Login</Button></Link>
                  <Link to="/cadastro"><Button type="primary" icon={<UserAddOutlined />} className="register-button-header">Cadastre-se</Button></Link>
                </Space>
              )}
              <Search
                placeholder="Buscar no site..."
                onSearch={onSearch}
                className="header-search-standalone"
                enterButton={<SearchOutlined />}
              />
            </Space>
          )}
           {/* Mostra um placeholder ou nada enquanto o auth está carregando para evitar "pulos" na UI */}
           {loadingAuth && <div style={{width: '280px', height: '32px'}}>{/* Placeholder de espaço */}</div>}
        </Col>
      </Row>

      <Drawer
        title={<Link to="/" onClick={closeDrawer} className="drawer-title-link">Famosos na Mídia</Link>}
        placement="left"
        onClose={closeDrawer}
        open={drawerVisible}
        className="mobile-drawer"
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          selectedKeys={[currentSelectedKey]} // A chave selecionada será atualizada pelo useEffect
          items={drawerFinalItems}
          className="drawer-menu"
        />
      </Drawer>
    </AntHeader>
  );
};

export default Header;