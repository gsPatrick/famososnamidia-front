// src/pages/AllCategoriesPage/AllCategoriesPage.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Typography, Breadcrumb, Spin, Alert, Empty } from 'antd';
import { Link } from 'react-router-dom';
import { FolderOpenOutlined, HomeOutlined } from '@ant-design/icons';
import { get } from '../../services/api';
import './AllCategoriesPage.css'; // Certifique-se que este CSS existe e está adequado

const { Content } = Layout;
const { Title, Text } = Typography;

// Função para gerar uma cor pastel aleatória ou baseada em string (hash simples)
const generateCategoryColor = (categoryName) => {
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    // eslint-disable-next-line no-bitwise
    hash &= hash; // Convert to 32bit integer
  }
  // Gera componentes HSL mais suaves (tons pastel)
  const hue = Math.abs(hash % 360);
  const saturation = 60 + Math.abs(hash % 15); // Saturação entre 60-75%
  const lightness = 70 + Math.abs(hash % 10);  // Luminosidade entre 70-80%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};


const AllCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { limit: 100, sortBy: 'name', sortOrder: 'ASC' };
        const response = await get('/categories', params);
        setCategories(response.categories || []);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
        setError(err.message || "Não foi possível carregar as categorias.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
    window.scrollTo(0, 0);
  }, []);

  const breadcrumbItems = [
    { title: <Link to="/"><HomeOutlined /> Início</Link> },
    { title: <><FolderOpenOutlined /><span> Todas as Categorias</span></> },
  ];

  if (loading) {
    return (
      <Content className="all-categories-page-content">
        <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} />
        <Title level={2} className="page-main-title">Todas as Categorias</Title>
        <Text className="page-subtitle">Explore nossos tópicos e encontre suas notícias preferidas.</Text>
        <div className="categories-loading-spinner"><Spin size="large" tip="Carregando categorias..." /></div>
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="all-categories-page-content">
        <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} />
        <Title level={2} className="page-main-title">Todas as Categorias</Title>
        <Alert message="Erro ao Carregar Categorias" description={error} type="error" showIcon className="categories-error-alert"/>
      </Content>
    );
  }

  return (
    <Content className="all-categories-page-content">
      <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} />
      <Title level={2} className="page-main-title">Todas as Categorias</Title>
      <Text className="page-subtitle">Explore nossos tópicos e encontre suas notícias preferidas.</Text>

      {categories.length > 0 ? (
        <Row gutter={[24, 24]} className="categories-grid">
          {categories.map((category) => {
            const backgroundColor = generateCategoryColor(category.name);
            // Tenta pegar as duas primeiras letras ou a primeira se for uma palavra só
            const nameParts = category.name.split(' ');
            const initials = nameParts.length > 1 
                ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
                : `${nameParts[0].substring(0, Math.min(2, nameParts[0].length))}`.toUpperCase();

            return (
              <Col key={category.id} xs={24} sm={12} md={8} lg={6}>
                <Link to={`/categoria/${category.slug}`} className="category-card-link">
                  <Card
                    hoverable
                    className="category-card"
                    cover={
                      <div 
                        className="category-card-image-placeholder-dynamic"
                        style={{ backgroundColor: backgroundColor }}
                      >
                        <span className="category-placeholder-initials">{initials}</span>
                        {/* Ou mostrar o nome completo se preferir: */}
                        {/* <span className="category-placeholder-name">{category.name}</span> */}
                      </div>
                    }
                  >
                    <Card.Meta
                      title={<Title level={4} className="category-card-title">{category.name}</Title>}
                      description={
                        <Text type="secondary" className="category-card-description">
                          {category.description || 'Veja todos os posts desta categoria.'}
                        </Text>
                      }
                    />
                  </Card>
                </Link>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Empty description="Nenhuma categoria encontrada." style={{marginTop: '50px'}} />
      )}
    </Content>
  );
};

export default AllCategoriesPage;