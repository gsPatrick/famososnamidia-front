// src/components/Header/Header.jsx
import React,  { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Input, Button, Drawer, Space, Typography, Tooltip, Avatar, Divider, Dropdown } from 'antd';
import {
  MenuOutlined, SearchOutlined, DownOutlined, InfoCircleOutlined,
  LoginOutlined, UserAddOutlined, LogoutOutlined, DashboardOutlined, UserOutlined, BookOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const { Header: AntHeader } = Layout;
const { Search } = Input;
const { Text } = Typography;

const availableCategories = [
  { key: 'cinema', label: 'Cinema', slug: 'cinema' },
  { key: 'celebridades', label: 'Celebridades', slug: 'celebridades' },
  { key: 'musica', label: 'Música', slug: 'musica' },
  { key: 'tv-reality', label: 'TV & Reality', slug: 'tv-&-reality' },
];

const Header = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentSelectedKey, setCurrentSelectedKey] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoggedIn, isAdmin, isAuthor, logout, loadingAuth } = useAuth();

  useEffect(() => {
    const path = location.pathname;
    const pathKey = path.split('/')[2]; // ex: /categoria/cinema -> cinema

    if (path === '/') setCurrentSelectedKey('home');
    else if (path.startsWith('/categoria/')) setCurrentSelectedKey(`categoria-${pathKey}`);
    else if (path === '/sobre') setCurrentSelectedKey('sobre-nos');
    else setCurrentSelectedKey(''); // Nenhuma seleção para outras rotas como login, etc.
  }, [location]);

  const showDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  const handleNavigate = (path) => {
    navigate(path);
    if (drawerVisible) {
      closeDrawer();
    }
  };

  const onSearch = (value) => {
    if (value?.trim()) {
      handleNavigate(`/busca?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const categoryDropdownItems = availableCategories.map(category => ({
    key: `categoria-${category.key}`,
    label: <Link to={`/categoria/${category.slug}`}>{category.label}</Link>,
  }));

  const desktopMenuItems = [
    { key: 'home', label: <Link to="/">Início</Link> },
    {
      key: 'categories-dropdown',
      label: (
        <Dropdown menu={{ items: categoryDropdownItems, selectedKeys: [currentSelectedKey] }} overlayClassName="category-dropdown-overlay">
          <a onClick={(e) => e.preventDefault()} className="ant-dropdown-link category-dropdown-trigger">
            Categorias <DownOutlined />
          </a>
        </Dropdown>
      ),
    },
    { key: 'sobre-nos', icon: <InfoCircleOutlined />, label: <Link to="/sobre">Sobre Nós</Link> },
  ];

  const drawerMenuItems = [
    { key: 'home', label: 'Início', onClick: () => handleNavigate('/') },
    {
      key: 'categorias',
      label: 'Categorias',
      icon: <BookOutlined />,
      children: availableCategories.map(cat => ({
        key: `categoria-${cat.slug}`,
        label: cat.label,
        onClick: () => handleNavigate(`/categoria/${cat.slug}`)
      }))
    },
    { key: 'sobre-nos', icon: <InfoCircleOutlined />, label: 'Sobre Nós', onClick: () => handleNavigate('/sobre') },
  ];

  const UserActions = ({ isMobile = false }) => {
    if (loadingAuth) return <div style={{ width: '150px', height: '32px' }} />;

    if (isLoggedIn) {
      if (isMobile) {
        return (
          <div className="drawer-user-section">
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <Avatar size={64} src={currentUser?.profileImageUrl} icon={<UserOutlined />} />
              <Text strong>{currentUser?.name}</Text>
            </Space>
            <Divider style={{margin: '12px 0'}}/>
            {(isAdmin || isAuthor) && (
              <Button block icon={<DashboardOutlined />} onClick={() => handleNavigate('/dashboard')} style={{ marginBottom: 8 }}>Dashboard</Button>
            )}
            <Button block danger icon={<LogoutOutlined />} onClick={() => { logout(); closeDrawer(); }}>Sair</Button>
          </div>
        );
      }
      return (
        <Space align="center" size="middle">
          {(isAdmin || isAuthor) && (
            <Tooltip title="Dashboard">
              <Button shape="circle" icon={<DashboardOutlined />} onClick={() => handleNavigate('/dashboard')} />
            </Tooltip>
          )}
          <Tooltip title={`Logado como: ${currentUser?.name}`}>
            <Avatar src={currentUser?.profileImageUrl} icon={<UserOutlined />} className="user-avatar" />
          </Tooltip>
          <Button type="primary" danger icon={<LogoutOutlined />} onClick={logout} />
        </Space>
      );
    }

    // Usuário deslogado
    if (isMobile) {
      return (
        <div className="drawer-user-section">
          <Button block type="default" icon={<LoginOutlined />} onClick={() => handleNavigate('/login')} style={{ marginBottom: 8 }}>Login</Button>
          <Button block type="primary" icon={<UserAddOutlined />} onClick={() => handleNavigate('/cadastro')}>Cadastre-se</Button>
        </div>
      );
    }
    return (
      <Space size="small">
        <Button onClick={() => handleNavigate('/login')}>Login</Button>
        <Button type="primary" onClick={() => handleNavigate('/cadastro')}>Cadastre-se</Button>
      </Space>
    );
  };

  return (
    <AntHeader className="app-header">
      <div className="header-content">
        <div className="header-left">
          <Button className="menu-toggle-button" type="text" icon={<MenuOutlined />} onClick={showDrawer} />
          <div className="logo"><Link to="/">Famosos na Mídia</Link></div>
        </div>

        <div className="header-center">
          <Search placeholder="Buscar celebridades, notícias, músicas..." onSearch={onSearch} className="header-search" />
        </div>

        <div className="header-right">
          <Menu className="desktop-menu" mode="horizontal" selectedKeys={[currentSelectedKey]} items={desktopMenuItems} />
          <UserActions />
        </div>
      </div>

      <Drawer
        title={<Link to="/" onClick={closeDrawer}>Famosos na Mídia</Link>}
        placement="left"
        onClose={closeDrawer}
        open={drawerVisible}
        className="mobile-drawer"
        styles={{ body: { padding: '0', display: 'flex', flexDirection: 'column' } }}
      >
        <div className="drawer-content-wrapper">
          <div className="drawer-search-wrapper">
            <Search placeholder="Buscar no site..." onSearch={onSearch} />
          </div>
          <Menu
            mode="inline"
            selectedKeys={[currentSelectedKey]}
            items={drawerMenuItems}
            className="drawer-menu"
            defaultOpenKeys={['categorias']}
          />
        </div>
        <UserActions isMobile={true} />
      </Drawer>
    </AntHeader>
  );
};

export default Header;