// src/pages/PostDetailPage/PostDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Layout, Typography, Spin, Breadcrumb, Tag, Divider, Row, Col, Alert,
  List, Form, Input, Button, Avatar, Tooltip, message, Space, Empty, Card, Radio, Switch, Slider, Modal
} from 'antd';
import {
  ClockCircleOutlined, UserOutlined, FolderOpenOutlined, MessageOutlined,
  QuestionCircleOutlined, HomeOutlined, UpOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { get, post as apiPost } from '../../services/api';
import './PostDetailPage.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Meta } = Card;

// --- HOOK CUSTOMIZADO PARA GERENCIAR E SALVAR PREFERÊNCIAS ---
const useReadingPreferences = () => {
  const DEFAULTS = {
    fontSize: 18, theme: 'light', fontFamily: 'serif',
    textAlign: 'left', contentWidth: 'standard', lineHeight: 1.8, isFocusMode: false,
  };

  const [preferences, setPreferences] = useState(() => {
    try {
      const savedPrefs = localStorage.getItem('readingPreferences');
      if (savedPrefs) return JSON.parse(savedPrefs);
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return { ...DEFAULTS, theme: 'slate' };
      }
      return DEFAULTS;
    } catch (error) { return DEFAULTS; }
  });

  useEffect(() => {
    localStorage.setItem('readingPreferences', JSON.stringify(preferences));
    document.body.className = ''; // Limpa classes anteriores
    document.body.classList.add(`theme-${preferences.theme}`); // Adiciona classe de tema ao body
    document.body.classList.toggle('focus-mode-active', preferences.isFocusMode);
    return () => document.body.classList.remove('focus-mode-active', `theme-${preferences.theme}`);
  }, [preferences]);

  return [preferences, setPreferences];
};


// --- COMPONENTES INTERNOS ---

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const handleScroll = () => setIsVisible(window.scrollY > 300);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return isVisible ? (
    <Button className="back-to-top-btn" shape="circle" icon={<UpOutlined />} onClick={scrollToTop} size="large" />
  ) : null;
};

const ReadingToolsPanel = ({ readingOptions, setReadingOptions }) => {
    const { fontSize, theme, fontFamily, lineHeight, isFocusMode } = readingOptions;
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleOptionChange = (key, value) => {
      if (key === 'isFocusMode' && value === true) {
        if (!localStorage.getItem('hasSeenFocusModeInfo')) {
          setIsModalVisible(true);
        }
      }
      setReadingOptions(prev => ({ ...prev, [key]: value }));
    };

    const handleModalOk = () => {
      localStorage.setItem('hasSeenFocusModeInfo', 'true');
      setIsModalVisible(false);
    };

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? 'Option (⌥)' : 'Alt';

    return (
      <>
        <div className="reading-tools-panel">
            <Title level={5} className="tools-panel-title">Opções de Leitura</Title>
            <Divider className="tools-divider" />
            
            <div className="tools-section">
                <Text className="tools-label">Tema de Cor</Text>
                <Radio.Group value={theme} onChange={(e) => handleOptionChange('theme', e.target.value)} style={{ width: '100%' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Radio value="light" className="theme-radio">Claro</Radio>
                        <Radio value="sepia" className="theme-radio">Sépia</Radio>
                        <Radio value="slate" className="theme-radio">Ardósia</Radio>
                        <Radio value="midnight" className="theme-radio">Meia-noite</Radio>
                        <Radio value="high-contrast" className="theme-radio">Alto Contraste</Radio>
                    </Space>
                </Radio.Group>
            </div>
            
            <Divider className="tools-divider" />
            
            <div className="tools-section">
                <Text className="tools-label">Fonte do Texto</Text>
                <Radio.Group 
                  value={fontFamily} 
                  onChange={(e) => handleOptionChange('fontFamily', e.target.value)} 
                  buttonStyle="solid" 
                  className="font-family-group"
                >
                    <Radio.Button value="serif">Serifada</Radio.Button>
                    <Radio.Button value="sans-serif">Sem Serifa</Radio.Button>
                    <Radio.Button value="dyslexic">Dislexia</Radio.Button>
                </Radio.Group>
            </div>

            <Divider className="tools-divider" />

            <div className="tools-section">
                <Text className="tools-label">Tamanho da Fonte</Text>
                <Slider min={14} max={24} value={fontSize} onChange={(val) => handleOptionChange('fontSize', val)} />
            </div>

            <div className="tools-section">
                <Text className="tools-label">Altura da Linha</Text>
                <Slider min={1.5} max={2.1} step={0.1} value={lineHeight} onChange={(val) => handleOptionChange('lineHeight', val)} />
            </div>
            
            <Divider className="tools-divider" />
            
            <div className="tools-section">
                <Space style={{justifyContent: 'space-between', width: '100%'}}>
                    <Text className="tools-label" style={{marginBottom: 0}}>Modo Foco</Text>
                    <Switch checked={isFocusMode} onChange={(checked) => handleOptionChange('isFocusMode', checked)} />
                </Space>
            </div>
            
            <Divider className="tools-divider" />

            <Button icon={<QuestionCircleOutlined />} className="shortcut-help-btn" onClick={() => setIsModalVisible(true)}>
                Ajuda com Atalhos
            </Button>
        </div>

        <Modal
          title={<><InfoCircleOutlined style={{ marginRight: 8 }} /> Dicas de Leitura e Atalhos</>}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => setIsModalVisible(false)}
          footer={[<Button key="ok" type="primary" onClick={handleModalOk}>Entendi!</Button>]}
        >
          <p>O <strong>Modo Foco</strong> remove todas as distrações para uma leitura imersiva.</p>
          <p>Para sair a qualquer momento, basta pressionar a tecla <Text code>Esc</Text>.</p>
          <Divider>Outros Atalhos de Teclado</Divider>
          <ul className="shortcut-list">
            <li><Text code>{modKey} + T</Text> Alterna entre os temas de cor.</li>
            <li><Text code>{modKey} + F</Text> Alterna entre os tipos de fonte.</li>
            <li><Text code>{modKey} + ↑</Text> Aumenta o tamanho da fonte.</li>
            <li><Text code>{modKey} + ↓</Text> Diminui o tamanho da fonte.</li>
          </ul>
        </Modal>
      </>
    );
};


// --- COMPONENTE PRINCIPAL ---

const PostDetailPage = () => {
  const { postId: identifier } = useParams();
  const navigate = useNavigate();
  
  const [postData, setPostData] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const [readingOptions, setReadingOptions] = useReadingPreferences();
  
  const [commentForm] = Form.useForm();

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!identifier) return;
      setLoading(true);
      setError(null);
      setPostData(null);
      setRelatedPosts([]);
      try {
        const fetchedPost = await get(`/posts/${identifier}`);
        setPostData(fetchedPost);
        setComments(fetchedPost.comments || []);
        if (fetchedPost.category?.id) {
          const relatedResponse = await get('/posts', {
            limit: 4, categorySlug: fetchedPost.category.slug, status: 'published'
          });
          setRelatedPosts(relatedResponse.posts.filter(p => p.id !== fetchedPost.id).slice(0, 3));
        }
      } catch (err) {
        setError(err.message || `Não foi possível carregar o post.`);
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetails();
    window.scrollTo(0, 0);
  }, [identifier]);
  
  // Efeito para Teclas de Atalho
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setReadingOptions(prev => ({ ...prev, isFocusMode: false }));
      }
      
      if (e.altKey) {
        e.preventDefault();
        switch (e.key.toLowerCase()) {
          case 't': {
            const themes = ['light', 'sepia', 'slate', 'midnight', 'high-contrast'];
            const currentThemeIndex = themes.indexOf(readingOptions.theme);
            const nextThemeIndex = (currentThemeIndex + 1) % themes.length;
            setReadingOptions(prev => ({ ...prev, theme: themes[nextThemeIndex] }));
            break;
          }
          case 'f': {
            const fonts = ['serif', 'sans-serif', 'dyslexic'];
            const currentFontIndex = fonts.indexOf(readingOptions.fontFamily);
            const nextFontIndex = (currentFontIndex + 1) % fonts.length;
            setReadingOptions(prev => ({ ...prev, fontFamily: fonts[nextFontIndex] }));
            break;
          }
          case 'arrowup':
            setReadingOptions(prev => ({ ...prev, fontSize: Math.min(prev.fontSize + 1, 24) }));
            break;
          case 'arrowdown':
            setReadingOptions(prev => ({ ...prev, fontSize: Math.max(prev.fontSize - 1, 14) }));
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readingOptions.theme, readingOptions.fontFamily, setReadingOptions]);

  const handleCommentSubmit = async (values) => {
     if (!values.newComment || !values.newComment.trim()) {
         message.warning('Por favor, escreva um comentário.');
         return;
     }
    if (!postData) {
        message.error('Não é possível comentar. Post não carregado.');
        return;
    }

    setSubmittingComment(true);
    try {
        const commentPayload = { content: values.newComment };
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            const guestName = prompt("Por favor, insira seu nome para comentar:", "Visitante");
            if (!guestName) {
                message.info("Nome é necessário para comentar como visitante.");
                setSubmittingComment(false);
                return;
            }
            commentPayload.guestName = guestName;
        }

        const newComment = await apiPost(`/post/${postData.id}/comments`, commentPayload);
        setComments(prevComments => [newComment, ...prevComments]);
        commentForm.resetFields();
        message.success('Comentário adicionado com sucesso!');

    } catch (error) {
        message.error(error.message || 'Falha ao adicionar comentário.');
    } finally {
        setSubmittingComment(false);
    }
  };

  const getPlaceholderAvatar = (commentUser, guestName) => {
    const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#1890ff', '#87d068', '#eb2f96', '#52c41a'];
    let seed = 'V';
    let char = '?';

    if (commentUser && commentUser.name) {
        seed = commentUser.name;
        char = commentUser.name.charAt(0).toUpperCase();
    } else if (guestName) {
        seed = guestName;
        char = guestName.charAt(0).toUpperCase();
    }
    
    const colorIndex = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
    return <Avatar style={{ backgroundColor: colors[colorIndex], verticalAlign: 'middle' }}>{char}</Avatar>;
  };

  const breadcrumbItems = postData ? [
    { title: <Link to="/"><HomeOutlined /> Início</Link> },
    { title: <Link to={`/categoria/${postData.category?.slug || 'geral'}`}><FolderOpenOutlined /> {postData.category?.name || 'Categoria'}</Link> },
  ] : [{ title: <Link to="/"><HomeOutlined /> Início</Link> }];

  if (loading) {
    return (
      <Content className="post-detail-page">
        <div className="loading-spinner" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" tip="Carregando post..." />
        </div>
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="post-detail-page">
        <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
          <Breadcrumb items={breadcrumbItems} />
          <Alert message="Erro ao Carregar Post" description={error} type="error" showIcon style={{ marginTop: '20px' }}/>
          <Button type="primary" style={{ marginTop: '20px' }} onClick={() => navigate('/')}>Voltar para Home</Button>
        </div>
      </Content>
    );
  }

  if (!postData) return null;

  const { fontSize, theme, fontFamily, textAlign, contentWidth, lineHeight } = readingOptions;
  const pageClasses = `post-detail-page theme-${theme} font-${fontFamily} align-${textAlign} width-${contentWidth}`;

  return (
    <Content className={pageClasses}>
      <header className="post-hero-header">
        <div className="post-hero-image-wrapper">
          {postData.imageUrl && (
            <img 
              src={postData.imageUrl} alt="" className="post-hero-image"
              style={{ objectPosition: `${parseFloat(postData.focalPointX) || 50}% ${parseFloat(postData.focalPointY) || 50}%` }}
            />
          )}
          <div className="post-hero-overlay"></div>
        </div>
        <div className="post-hero-content">
          <Breadcrumb className="post-breadcrumb" items={breadcrumbItems} />
          {postData.category && <Tag color="cyan" className="post-hero-category">{postData.category.name}</Tag>}
          <Title level={1} className="post-hero-title">{postData.title}</Title>
          <Row gutter={[16, 8]} align="middle" justify="center" className="post-hero-meta">
            {postData.author && (
              <Col>
                <Link to={`/autor/${postData.author.id}`} className="author-meta-link">
                  <Space align="center">
                    <Avatar src={postData.author.profileImageUrl} icon={<UserOutlined />} size="small" />
                    <Text className="meta-item">{postData.author.name}</Text>
                  </Space>
                </Link>
              </Col>
            )}
            <Col><Text className="meta-item"><ClockCircleOutlined /> {new Date(postData.publishedAt).toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' })}</Text></Col>
          </Row>
        </div>
      </header>
      
      <div className="post-body-container">
        <main className="post-main-content">
          <div className="post-content-container" style={{ fontSize: `${fontSize}px`, '--line-height': lineHeight }}>
            <div className="post-body" dangerouslySetInnerHTML={{ __html: postData.content }} />
            
            {postData.author && (
              <div className="author-bio-section">
                <Row gutter={24} align="top">
                  <Col flex="none">
                    <Link to={`/autor/${postData.author.id}`}>
                      <Avatar size={80} src={postData.author.profileImageUrl} icon={<UserOutlined />} />
                    </Link>
                  </Col>
                  <Col flex="auto">
                    <Text className="author-bio-label">Escrito por</Text>
                    <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
                      <Link to={`/autor/${postData.author.id}`}>{postData.author.name}</Link>
                    </Title>
                    {postData.author.bio && <Paragraph type="secondary">{postData.author.bio}</Paragraph>}
                  </Col>
                </Row>
              </div>
            )}

            {relatedPosts.length > 0 && (
              <div className="related-posts-section">
                <Title level={3} className="related-posts-title">Você também pode gostar</Title>
                <Row gutter={[24, 24]}>
                  {relatedPosts.map(relatedPost => (
                    <Col key={relatedPost.id} xs={24} sm={12} md={8}>
                      <Link to={`/post/${relatedPost.slug || relatedPost.id}`}>
                        <Card hoverable className="related-post-card"
                          cover={
                            <div className="related-post-image-wrapper">
                              <img alt={relatedPost.title} src={relatedPost.imageUrl || "https://placehold.co/400x225/EAEAEA/BDBDBD.png?text=Sem+Imagem"}
                                style={{ objectPosition: `${parseFloat(relatedPost.focalPointX) || 50}% ${parseFloat(relatedPost.focalPointY) || 50}%` }}
                              />
                            </div>
                          }
                        >
                          <Meta title={<Tooltip title={relatedPost.title}>{relatedPost.title}</Tooltip>}
                            description={<Tag>{relatedPost.category.name}</Tag>}
                          />
                        </Card>
                      </Link>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            <div className="comment-section">
              <Title level={3} className="comment-section-title">
                  <MessageOutlined /> {comments.length} Comentário(s)
              </Title>
              <div className="custom-comment-form-container">
                  <Row gutter={16} wrap={false} align="top">
                  <Col flex="none">
                      {getPlaceholderAvatar(localStorage.getItem('authToken') ? { name: localStorage.getItem('userName') } : null, !localStorage.getItem('authToken') ? 'Eu' : null)}
                  </Col>
                  <Col flex="auto">
                      <Form form={commentForm} onFinish={handleCommentSubmit} layout="vertical">
                      <Form.Item name="newComment" style={{ marginBottom: '8px' }} rules={[{ required: true, message: 'Por favor, escreva algo!' }]}>
                          <TextArea rows={3} placeholder="Deixe seu comentário..." />
                      </Form.Item>
                      <Form.Item style={{ marginBottom: 0 }}>
                          <Button htmlType="submit" loading={submittingComment} type="primary">Comentar</Button>
                      </Form.Item>
                      </Form>
                  </Col>
                  </Row>
              </div>
              {comments.length > 0 ? (
                  <List
                  className="custom-comment-list"
                  itemLayout="horizontal"
                  dataSource={comments}
                  renderItem={comment => (
                      <List.Item className="custom-comment-item" key={comment.id}>
                      <List.Item.Meta
                          avatar={getPlaceholderAvatar(comment.user, comment.guestName)}
                          title={<Text strong className="custom-comment-author">{comment.user ? comment.user.name : comment.guestName || 'Anônimo'}</Text>}
                          description={
                          <>
                              <Paragraph className="custom-comment-content" style={{whiteSpace: 'pre-line'}}>{comment.content}</Paragraph>
                              <Text type="secondary" className="custom-comment-datetime">
                              {new Date(comment.createdAt).toLocaleDateString('pt-BR')} às {new Date(comment.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                              </Text>
                          </>
                          }
                      />
                      </List.Item>
                  )}
                  />
              ) : (
                  <Text type="secondary" style={{display: 'block', textAlign: 'center', marginTop: '20px'}}>Seja o primeiro a comentar!</Text>
              )}
            </div>
          </div>
        </main>
      </div>

      <ReadingToolsPanel readingOptions={readingOptions} setReadingOptions={setReadingOptions} />
      <BackToTopButton />
    </Content>
  );
};

export default PostDetailPage;