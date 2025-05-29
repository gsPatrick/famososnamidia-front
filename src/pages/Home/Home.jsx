// src/pages/Home/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Typography, Spin, Pagination, Tag, Divider, Alert } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { get } from '../../services/api'; // <<< IMPORTAR 'get' DA API
import './Home.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const postsPerPage = 6; // Ou pegar do backend se ele retornar 'limit'

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // O backend espera 'page' e 'limit'.
        // O status 'published' é o padrão para esta rota no backend.
        const params = {
          page: currentPage,
          limit: postsPerPage,
          sortBy: 'publishedAt', // Ordenar pelos mais recentes publicados
          sortOrder: 'DESC',
        };
        const response = await get('/posts', params);
        // console.log('Posts da API:', response);
        // A API retorna { totalItems, posts, totalPages, currentPage }
        setPosts(response.posts || []);
        setTotalItems(response.totalItems || 0);
        // Poderíamos usar response.currentPage para setar currentPage se quiséssemos que o backend ditasse.
      } catch (err) {
        console.error("Erro ao buscar posts:", err);
        setError(err.message || "Não foi possível carregar os posts. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    window.scrollTo(0, 0); // Rola para o topo ao mudar de página/carregar
  }, [currentPage]); // Re-executa quando currentPage muda

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // O useEffect cuidará de buscar os posts para a nova página
  };

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
          <Row gutter={[24, 24]}>
            {posts.map((post) => (
              <Col key={post.id} xs={24} sm={12} md={8}>
                {/* Link para o post usa o slug se disponível, senão o ID */}
                <Link to={`/post/${post.slug || post.id}`} className="post-card-link">
                  <Card
                    className="post-card"
                    hoverable
                    cover={
                      <img
                        alt={post.title}
                        src={post.imageUrl || "https://placehold.co/600x400/E0E0E0/BDBDBD.png?text=Sem+Imagem"} // Fallback image
                        className="post-card-image"
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/E0E0E0/BDBDBD.png?text=Erro+Img"; }}
                      />
                    }
                    actions={[
                      post.category ? (
                        <Link
                          to={`/categoria/${post.category.slug}`} // Link para slug da categoria
                          key={`cat-link-${post.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="action-category-link"
                        >
                          <Tag color="blue" style={{ cursor: 'pointer' }}>
                            {post.category.name} {/* Nome da categoria */}
                          </Tag>
                        </Link>
                      ) : (
                        <Tag key={`cat-none-${post.id}`}>Sem Categoria</Tag>
                      ),
                      <Text type="secondary" key={`date-${post.id}`}>
                        <ClockCircleOutlined /> {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}
                      </Text>,
                    ]}
                  >
                    <Meta
                      title={<Title level={4} className="post-card-title" title={post.title}>{post.title}</Title>}
                      description={
                        <Paragraph className="post-card-excerpt" ellipsis={{ rows: 3, expandable: false }}>
                          {post.excerpt}
                        </Paragraph>
                      }
                    />
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>

          {totalItems > postsPerPage && (
            <Pagination
              className="home-pagination"
              current={currentPage}
              total={totalItems}
              pageSize={postsPerPage}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          )}
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