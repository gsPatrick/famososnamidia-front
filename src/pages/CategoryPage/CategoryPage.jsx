// src/pages/CategoryPage/CategoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Layout, Row, Col, Card, Typography, Spin, Pagination, Tag, Divider, Breadcrumb, Empty, Button, Alert
} from 'antd';
import { ClockCircleOutlined, HomeOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { get } from '../../services/api'; // <<< IMPORTAR 'get'
import './CategoryPage.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const [categoryName, setCategoryName] = useState(''); // Pode ser obtido da API também
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
        // Primeiro, tentamos buscar a categoria para obter o nome dela, se necessário.
        // Ou podemos apenas confiar que o slug é suficiente para o título.
        // Para obter o nome "bonito" da categoria, precisaríamos de um endpoint /categories/:slug
        // ou que a API de posts retorne o nome da categoria junto.
        // No Post.service.js, getAllPosts já inclui a categoria.
        
        const params = {
          page: currentPage,
          limit: postsPerPage,
          categorySlug: categorySlug,
          status: 'published', // Garantir que apenas publicados sejam mostrados
          sortBy: 'publishedAt',
          sortOrder: 'DESC',
        };
        const response = await get('/posts', params);
        // console.log(`Posts da categoria ${categorySlug}:`, response);
        
        setPosts(response.posts || []);
        setTotalItems(response.totalItems || 0);

        // Definir o nome da categoria para o título da página.
        // Se a API de posts não retornar o nome da categoria diretamente na listagem
        // e você quiser o nome exato (não apenas o slug), você faria uma segunda chamada
        // para /categories/:slug. No nosso caso, o Post.service.js já inclui
        // a categoria nos posts, então podemos pegar do primeiro post.
        if (response.posts && response.posts.length > 0 && response.posts[0].category) {
          setCategoryName(response.posts[0].category.name);
        } else {
          // Fallback: "des-slugificar" o nome (pode não ser 100% preciso)
          setCategoryName(categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
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
    { title: <Link to="/categorias"><FolderOpenOutlined /> Categorias</Link> }, // Link para a página de todas as categorias
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
          <Spin size="large" />
          <Text style={{ display: 'block', marginTop: '10px' }}>
            {`Carregando posts de ${categoryName || categorySlug}...`}
          </Text>
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
        <>
          <Row gutter={[24, 24]}>
            {posts.map((post) => (
              <Col key={post.id} xs={24} sm={12} md={8}>
                <Link to={`/post/${post.slug || post.id}`} className="post-card-link">
                  <Card
                    className="post-card" // Reutiliza estilos do post-card
                    hoverable
                    cover={
                      <img
                        alt={post.title}
                        src={post.imageUrl || "https://placehold.co/600x400/E0E0E0/BDBDBD.png?text=Sem+Imagem"}
                        className="post-card-image"
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/E0E0E0/BDBDBD.png?text=Erro+Img"; }}
                      />
                    }
                    actions={[
                      // A categoria do post já é a atual, então podemos mostrar algo diferente ou a data.
                      // O backend de /posts já inclui o nome da categoria.
                      <Tag color="default" key={`cat-info-${post.id}`}>{post.category.name}</Tag>,
                      <Text type="secondary" key={`date-${post.id}`}><ClockCircleOutlined /> {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}</Text>,
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
              className="category-pagination" // Reutiliza estilos de paginacao
              current={currentPage}
              total={totalItems}
              pageSize={postsPerPage}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          )}
        </>
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