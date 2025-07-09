// src/pages/CategoryPage/CategoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Layout, Row, Col, List, Typography, Spin, Pagination, Tag, Divider, Breadcrumb, Empty, Button, Alert
} from 'antd';
import { ClockCircleOutlined, HomeOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { get } from '../../services/api';
import './CategoryPage.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const postsPerPage = 6;

  useEffect(() => {
    const fetchPostsByCategory = async () => {
      if (!categorySlug) return;

      setLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
          limit: postsPerPage,
          categorySlug: categorySlug,
          status: 'published',
          sortBy: 'publishedAt',
          sortOrder: 'DESC',
        };
        const response = await get('/posts', params);
        
        setPosts(response.posts || []);
        setTotalItems(response.totalItems || 0);

        if (response.posts && response.posts.length > 0 && response.posts[0].category) {
          setCategoryName(response.posts[0].category.name);
        } else {
          const categoryResponse = await get(`/categories/${categorySlug}`);
          setCategoryName(categoryResponse.name || categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
        }

      } catch (err) {
        console.error(`Erro ao buscar posts da categoria ${categorySlug}:`, err);
        setError(err.message || `Não foi possível carregar os posts da categoria ${categorySlug}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchPostsByCategory();
    window.scrollTo(0, 0);
  }, [categorySlug, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const breadcrumbItems = [
    { title: <Link to="/"><HomeOutlined /> Início</Link> },
    { title: <Link to="/categorias"><FolderOpenOutlined /> Categorias</Link> },
    { title: categoryName || categorySlug || 'Carregando...' },
  ];

  if (loading) {
    return (
      <Content className="category-page-content">
        <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} />
        <Title level={2} className="page-title">
          Notícias da Categoria: <span className="category-highlight">{categoryName || categorySlug}</span>
        </Title>
        <Divider className="title-divider" />
        <div className="loading-spinner" style={{ textAlign: 'center', minHeight: '300px' }}>
          <Spin size="large" tip={`Carregando posts de ${categoryName || categorySlug}...`} />
        </div>
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="category-page-content">
        <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} />
        <Title level={2} className="page-title">
          Erro ao Carregar Categoria
        </Title>
        <Divider className="title-divider" />
        <Alert message="Erro" description={error} type="error" showIcon />
        <Button type="primary" style={{marginTop: '20px'}} onClick={() => navigate('/')}>
            Voltar para Home
        </Button>
      </Content>
    );
  }
  
  return (
    <Content className="category-page-content">
      <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} />

      <Title level={2} className="page-title">
        Notícias da Categoria: <span className="category-highlight">{categoryName || categorySlug}</span>
      </Title>
      <Divider className="title-divider" />

      {posts.length > 0 ? (
        <List
          itemLayout="vertical"
          size="large"
          className="posts-list-container"
          dataSource={posts}
          pagination={ totalItems > postsPerPage && {
              onChange: handlePageChange,
              current: currentPage,
              pageSize: postsPerPage,
              total: totalItems,
              showSizeChanger: false,
              className: "category-pagination"
            }
          }
          renderItem={(post) => (
            <List.Item
              key={post.id}
              className="horizontal-post-list-item"
            >
              <Link to={`/post/${post.slug || post.id}`} className="post-list-item-link">
                <Row gutter={[24, 20]} align="top">
                  <Col xs={24} sm={8} md={7} lg={6}>
                    <div className="horizontal-post-image-wrapper">
                      <img
                        alt={post.title}
                        src={post.imageUrl || "https://placehold.co/800x450/EAEAEA/BDBDBD.png?text=Sem+Imagem"}
                        className="horizontal-post-image"
                        loading="lazy"
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/800x450/EAEAEA/BDBDBD.png?text=Erro+Img"; }}
                      />
                    </div>
                  </Col>

                  <Col xs={24} sm={16} md={17} lg={18}>
                    <div className="horizontal-post-content">
                      <Tag color="cyan" className="horizontal-post-category-tag">
                        {post.category.name}
                      </Tag>
                      
                      <Title level={3} className="horizontal-post-title" title={post.title}>
                        {post.title}
                      </Title>
                      
                      <Paragraph className="horizontal-post-excerpt" ellipsis={{ rows: 3, expandable: false }}>
                        {post.excerpt}
                      </Paragraph>

                      <Text type="secondary" className="horizontal-post-meta">
                        <ClockCircleOutlined /> {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}
                      </Text>
                    </div>
                  </Col>
                </Row>
              </Link>
            </List.Item>
          )}
        />
      ) : (
        <div className="no-posts-message">
             <Empty description={<Text>Nenhum post encontrado para a categoria "<strong>{categoryName || categorySlug}</strong>".</Text>} />
             <Button type="primary" style={{marginTop: '20px'}} onClick={() => navigate('/categorias')}>
                Ver Todas as Categorias
             </Button>
        </div>
      )}
    </Content>
  );
};

export default CategoryPage;