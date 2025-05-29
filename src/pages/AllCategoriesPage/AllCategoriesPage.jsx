// src/pages/AllCategoriesPage/AllCategoriesPage.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Typography, Breadcrumb, Spin, Alert, Empty } from 'antd';
import { Link } from 'react-router-dom';
import { FolderOpenOutlined, HomeOutlined } from '@ant-design/icons';
import { get } from '../../services/api';
import './AllCategoriesPage.css';

const { Content } = Layout;
const { Title, Text } = Typography;

// Função para gerar uma cor pastel aleatória ou baseada em string
const generateCategoryColor = (categoryName) => {
  if (!categoryName) return 'hsl(0, 0%, 80%)';
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    // eslint-disable-next-line no-bitwise
    hash &= hash; 
  }
  const hue = Math.abs(hash % 360);
  const saturation = 60 + Math.abs(hash % 15); 
  const lightness = 70 + Math.abs(hash % 10);  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// REMOVEMOS getCategoryPlaceholderText ou a modificamos para apenas retornar o nome
// Para esta opção, vamos simplesmente usar category.name diretamente.

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

  if (loading) { /* ... (bloco de loading como antes) ... */ }
  if (error) { /* ... (bloco de error como antes) ... */ }

  return (
    <Content className="all-categories-page-content">
      <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} />
      <Title level={2} className="page-main-title">Todas as Categorias</Title>
      <Text className="page-subtitle">Explore nossos tópicos e encontre suas notícias preferidas.</Text>

      {categories.length > 0 ? (
        <Row gutter={[24, 24]} className="categories-grid">
          {categories.map((category) => {
            const backgroundColor = generateCategoryColor(category.name);
            // Usaremos category.name diretamente para o placeholder
            const placeholderText = category.name; 

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
                        title={category.name} 
                      >
                        {/* Exibindo o nome completo da categoria */}
                        <span className="category-placeholder-text-full-name">{placeholderText}</span>
                      </div>
                    }
                  >
                    <Card.Meta
                      title={<Title level={4} className="category-card-title" title={category.name}>{category.name}</Title>}
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