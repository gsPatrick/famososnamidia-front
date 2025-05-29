// src/pages/SearchPage/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom'; // Adicionado useNavigate
import { Layout, Typography, Row, Col, Card, Empty, Spin, Breadcrumb, Divider, Pagination, Tag, Tooltip, Alert } from 'antd'; // Adicionado Alert
import { ClockCircleOutlined, HomeOutlined, SearchOutlined as SearchIcon } from '@ant-design/icons';
import { get } from '../../services/api'; // <<< IMPORTAR 'get'
import './SearchPage.css';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const postsPerPage = 6;
  const navigate = useNavigate();
  const currentPostsOnPage = searchResults.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);


  useEffect(() => {
    if (query && query.trim() !== '') {
      const fetchSearchResults = async () => {
        setLoading(true);
        setError(null);
        try {
          const params = {
            page: currentPage,
            limit: postsPerPage,
            search: query.trim(),
            status: 'published', // Busca apenas em posts publicados
            sortBy: 'publishedAt', // Ou 'relevance' se o backend suportar
            sortOrder: 'DESC',
          };
          const response = await get('/posts', params);
          // console.log(`Resultados da busca por "${query}":`, response);
          setSearchResults(response.posts || []);
          setTotalItems(response.totalItems || 0);
        } catch (err) {
          console.error(`Erro ao buscar por "${query}":`, err);
          setError(err.message || "Ocorreu um erro ao realizar a busca.");
        } finally {
          setLoading(false);
        }
      };
      fetchSearchResults();
      window.scrollTo(0, 0);
    } else {
      setSearchResults([]);
      setTotalItems(0);
      setLoading(false);
      // Opcional: redirecionar para home ou mostrar mensagem se a query for vazia
      // if (query === '') navigate('/'); // Exemplo de redirecionamento
    }
  }, [query, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const breadcrumbItems = [
    { title: <Link to="/"><HomeOutlined /> Início</Link> },
    { title: <><SearchIcon /> Resultados da Busca</> },
  ];

  if (loading) {
    return (
      <Content className="search-page-content">
        <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} />
        <Title level={2} className="page-main-title">
          Buscando por: <span className="search-query-highlight">"{query || ''}"</span>
        </Title>
        <Divider className="title-divider" />
        <div className="loading-spinner-search">
          <Spin size="large" tip="Buscando posts..." />
        </div>
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="search-page-content">
        <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} />
        <Title level={2} className="page-main-title">
          Busca por: <span className="search-query-highlight">"{query || ''}"</span>
        </Title>
        <Divider className="title-divider" />
        <Alert message="Erro na Busca" description={error} type="error" showIcon />
      </Content>
    );
  }

  return (
    <Content className="search-page-content">
      <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} />
      <Title level={2} className="page-main-title">
        Resultados da Busca por: <span className="search-query-highlight">"{query || ''}"</span>
      </Title>
      <Divider className="title-divider" />

      {query && query.trim() !== '' ? (
        currentPostsOnPage.length > 0 ? ( // Mudado de searchResults para currentPostsOnPage para consistência após loading
          <>
            <Text style={{ display: 'block', marginBottom: '20px', textAlign: 'center' }}>
              {totalItems} post(s) encontrado(s).
            </Text>
            <Row gutter={[24, 24]}>
              {currentPostsOnPage.map(post => (
                <Col key={post.id} xs={24} sm={12} md={8}>
                  <Link to={`/post/${post.slug || post.id}`} className="post-card-link">
                    <Card
                      className="search-result-card"
                      hoverable
                      cover={
                        <img
                          alt={post.title}
                          src={post.imageUrl || "https://placehold.co/600x400/E0E0E0/BDBDBD.png?text=Sem+Imagem"}
                          className="search-result-card-image"
                          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/E0E0E0/BDBDBD.png?text=Erro+Img"; }}
                        />
                      }
                      actions={[
                        post.category ? (
                            <Tag color="cyan" key={`cat-${post.id}`}>{post.category.name}</Tag>
                        ) : (
                            <Tag key={`cat-none-${post.id}`}>Indefinida</Tag>
                        ),
                        <Text type="secondary" key={`date-${post.id}`}><ClockCircleOutlined /> {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}</Text>,
                      ]}
                    >
                      <Meta
                        title={<Tooltip title={post.title}><Title level={4} className="search-result-card-title">{post.title}</Title></Tooltip>}
                        description={
                          <Paragraph className="search-result-card-excerpt" ellipsis={{ rows: 3 }}>
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
                className="search-pagination"
                current={currentPage}
                total={totalItems}
                pageSize={postsPerPage}
                onChange={handlePageChange}
                showSizeChanger={false}
                style={{ marginTop: '30px', textAlign: 'center' }}
              />
            )}
          </>
        ) : (
          <div className="no-results-message">
            <Empty description={
              <Text>
                Nenhum resultado encontrado para "<strong>{query}</strong>".<br/>
                Tente buscar por outros termos.
              </Text>
            }/>
          </div>
        )
      ) : (
        <div className="no-results-message">
            <Empty description={
              <Text>
                Por favor, digite um termo na barra de busca acima para começar.
              </Text>
            }/>
        </div>
      )}
    </Content>
  );
};

export default SearchPage;