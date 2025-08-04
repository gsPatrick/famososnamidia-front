// src/pages/Home/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Typography, Spin, Pagination, Tag, Divider, Alert, List } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { get } from '../../services/api'; 
import './Home.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const postsPerPage = 6;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
          limit: postsPerPage,
          // <<< MUDANÇA PRINCIPAL AQUI >>>
          sortBy: 'custom',
          sortOrder: 'ASC', // A ordem personalizada é geralmente ascendente (1, 2, 3...)
        };
        const response = await get('/posts', params);
        setPosts(response.posts || []);
        setTotalItems(response.totalItems || 0);
      } catch (err) {
        console.error("Erro ao buscar posts:", err);
        setError(err.message || "Não foi possível carregar os posts. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginationComponent = (
    <Pagination
      className="home-pagination"
      current={currentPage}
      total={totalItems}
      pageSize={postsPerPage}
      onChange={handlePageChange}
      showSizeChanger={false}
    />
  );

  if (loading) {
    return (
      <Content className="home-page-content">
        <Title level={2} className="page-title">Últimas Notícias</Title>
        <Divider className="title-divider" />
        <div className="loading-spinner">
          <Spin size="large" tip="Carregando notícias..." />
        </div>
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="home-page-content">
        <Title level={2} className="page-title">Últimas Notícias</Title>
        <Divider className="title-divider" />
        <Alert message="Erro ao carregar notícias" description={error} type="error" showIcon />
      </Content>
    );
  }

  return (
    <Content className="home-page-content">
      <Title level={2} className="page-title">Últimas Notícias</Title>
      <Divider className="title-divider" />

      {posts.length > 0 ? (
        <>
          {totalItems > postsPerPage && paginationComponent}

          <List
            itemLayout="vertical"
            size="large"
            className="posts-list-container"
            dataSource={posts}
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
                          style={{ objectPosition: `${parseFloat(post.focalPointX) || 50}% ${parseFloat(post.focalPointY) || 50}%` }}
                          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/800x450/EAEAEA/BDBDBD.png?text=Erro+Img"; }}
                        />
                      </div>
                    </Col>

                    <Col xs={24} sm={16} md={17} lg={18}>
                      <div className="horizontal-post-content">
                        {post.category ? (
                          <Link
                            to={`/categoria/${post.category.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="horizontal-post-category-link"
                          >
                            <Tag color="blue" className="horizontal-post-category-tag">
                              {post.category.name}
                            </Tag>
                          </Link>
                        ) : (
                          <Tag className="horizontal-post-category-tag">Sem Categoria</Tag>
                        )}
                        
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
          
          {totalItems > postsPerPage && paginationComponent}
        </>
      ) : (
        <Text style={{ textAlign: 'center', display: 'block', marginTop: '30px' }}>
            Nenhum post publicado encontrado.
        </Text>
      )}
    </Content>
  );
};

export default HomePage;