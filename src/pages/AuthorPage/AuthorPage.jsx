// src/pages/AuthorPage/AuthorPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Layout, Row, Col, Typography, Spin, Pagination, Tag, Divider, Breadcrumb, Empty, Alert, Avatar, List
} from 'antd';
import { ClockCircleOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';
import { get } from '../../services/api';
import './AuthorPage.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const AuthorPage = () => {
  const { authorId } = useParams();
  const navigate = useNavigate();

  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const postsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      if (!authorId) return;

      setLoading(true);
      setError(null);
      try {
        // Busca os detalhes do autor (só na primeira página) e os posts
        const authorDetailsPromise = currentPage === 1 ? get(`/users/${authorId}`) : Promise.resolve(author);
        const authorPostsPromise = get('/posts', {
          page: currentPage,
          limit: postsPerPage,
          authorId: authorId,
          status: 'published',
          sortBy: 'publishedAt',
          sortOrder: 'DESC',
        });

        const [authorDetails, authorPosts] = await Promise.all([authorDetailsPromise, authorPostsPromise]);

        if (currentPage === 1) {
          setAuthor(authorDetails);
        }
        setPosts(authorPosts.posts || []);
        setTotalItems(authorPosts.totalItems || 0);

      } catch (err) {
        console.error(`Erro ao buscar dados do autor ${authorId}:`, err);
        setError(err.message || `Não foi possível carregar o perfil do autor.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [authorId, currentPage]); // Adicionado currentPage na dependência

  // <<< FUNÇÃO PARA MUDAR DE PÁGINA >>>
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const breadcrumbItems = [
    { title: <Link to="/"><HomeOutlined /> Início</Link> },
    { title: <><UserOutlined /> Perfil do Autor</> },
    { title: author ? author.name : 'Carregando...' },
  ];

  if (loading && currentPage === 1) { // Mostra o spinner grande só no primeiro carregamento
    return (
      <Content className="author-page-content">
        <div className="loading-spinner" style={{ minHeight: '60vh' }}>
          <Spin size="large" tip="Carregando perfil do autor..." />
        </div>
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="author-page-content">
        <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} />
        <Alert message="Erro ao Carregar Perfil" description={error} type="error" showIcon />
      </Content>
    );
  }

  return (
    <Content className="author-page-content">
      <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} />

      {author && (
        <div className="author-profile-header">
          <Row gutter={[24, 24]} align="middle">
            <Col flex="none">
              <Avatar size={128} src={author.profileImageUrl} icon={<UserOutlined />} className="author-profile-avatar" />
            </Col>
            <Col flex="auto">
              <Title level={2} className="author-profile-name">{author.name}</Title>
              {author.bio && <Paragraph className="author-profile-bio">{author.bio}</Paragraph>}
              {author.profileUrl && (
                <a href={author.profileUrl} target="_blank" rel="noopener noreferrer" className="author-profile-link">
                  Visitar Website
                </a>
              )}
            </Col>
          </Row>
        </div>
      )}

      <Divider />

      <Title level={3} className="author-posts-title">
        Publicações de {author?.name || 'Autor'}
      </Title>

      {loading && currentPage > 1 ? <div className="loading-spinner"><Spin /></div> : (
        posts.length > 0 ? (
          <>
            <List
              itemLayout="vertical"
              size="large"
              className="posts-list-container"
              dataSource={posts}
              renderItem={(post) => (
                <List.Item key={post.id} className="horizontal-post-list-item">
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
                          {post.category && <Tag color="blue" className="horizontal-post-category-tag">{post.category.name}</Tag>}
                          <Title level={3} className="horizontal-post-title" title={post.title}>{post.title}</Title>
                          <Paragraph className="horizontal-post-excerpt" ellipsis={{ rows: 3 }}>{post.excerpt}</Paragraph>
                          <Text type="secondary" className="horizontal-post-meta"><ClockCircleOutlined /> {new Date(post.publishedAt).toLocaleDateString()}</Text>
                        </div>
                      </Col>
                    </Row>
                  </Link>
                </List.Item>
              )}
            />
            {/* <<< COMPONENTE DE PAGINAÇÃO ADICIONADO >>> */}
            {totalItems > postsPerPage && (
              <Pagination
                current={currentPage}
                total={totalItems}
                pageSize={postsPerPage}
                onChange={handlePageChange}
                showSizeChanger={false}
                style={{ textAlign: 'center', marginTop: '30px' }}
              />
            )}
          </>
        ) : (
          <Empty description={<Text>Este autor ainda não possui publicações.</Text>} />
        )
      )}
    </Content>
  );
};

export default AuthorPage;