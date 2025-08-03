// src/pages/PostDetail/PostDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Layout, Typography, Spin, Image, Breadcrumb, Tag, Divider, Row, Col, Alert,
  List, Form, Input, Button, Avatar, Tooltip, message, Space, Empty, Progress
} from 'antd';
import {
  ClockCircleOutlined, UserOutlined, FolderOpenOutlined, MessageOutlined,
  FacebookFilled, TwitterOutlined, WhatsAppOutlined, LinkedinFilled, LinkOutlined, HomeOutlined, 
  ZoomInOutlined, ZoomOutOutlined
} from '@ant-design/icons';
import { get, post as apiPost } from '../../services/api';
import './PostDetailPage.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

// Componente para a Barra de Progresso de Leitura
const ReadingProgressBar = () => {
  const [progress, setProgress] = useState(0);

  const handleScroll = () => {
    const element = document.documentElement;
    const scrollTotal = element.scrollHeight - element.clientHeight;
    if (scrollTotal <= 0) {
      setProgress(100);
      return;
    }
    const scrollCurrent = window.scrollY;
    const scrollPercentage = (scrollCurrent / scrollTotal) * 100;
    setProgress(Math.min(scrollPercentage, 100));
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Progress
      percent={progress}
      showInfo={false}
      strokeWidth={4}
      className="reading-progress-bar"
    />
  );
};

// Componente para o Painel de Ferramentas
const ReadingToolsPanel = ({ fontSize, readingTheme, increaseFontSize, decreaseFontSize, changeTheme }) => {
    const fontSizePercentage = Math.round(((fontSize - 14) / (24 - 14)) * 100);

    return (
        <div className="reading-tools-panel">
            <Title level={5} className="tools-panel-title">Ferramentas</Title>
            <div className="tools-section">
                <Text className="tools-label">Tamanho do Texto</Text>
                <Space className="font-size-controls">
                    <Button icon={<ZoomOutOutlined />} onClick={decreaseFontSize} aria-label="Diminuir fonte" />
                    <div className="font-size-indicator">{fontSizePercentage}%</div>
                    <Button icon={<ZoomInOutlined />} onClick={increaseFontSize} aria-label="Aumentar fonte" />
                </Space>
            </div>
             <div className="tools-section">
                <Text className="tools-label">Modo de Leitura</Text>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Button block onClick={() => changeTheme('light')} type={readingTheme === 'light' ? 'primary' : 'default'}>Claro</Button>
                    <Button block onClick={() => changeTheme('sepia')} type={readingTheme === 'sepia' ? 'primary' : 'default'}>Sépia</Button>
                    <Button block onClick={() => changeTheme('dark')} type={readingTheme === 'dark' ? 'primary' : 'default'}>Escuro</Button>
                </Space>
            </div>
        </div>
    );
};


const PostDetailPage = () => {
  const { postId: identifier } = useParams();
  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentForm] = Form.useForm();
  const navigate = useNavigate();

  const [fontSize, setFontSize] = useState(18);
  const [readingTheme, setReadingTheme] = useState('light');

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!identifier) return;
      setLoading(true);
      setError(null);
      try {
        const fetchedPost = await get(`/posts/${identifier}`);
        setPostData(fetchedPost);
        setComments(fetchedPost.comments || []);

      } catch (err) {
        if (err.message && (err.message.includes('Post não encontrado') || err.status === 404)) {
            setError("Post não encontrado ou não está mais disponível.");
        } else {
            setError(err.message || `Não foi possível carregar o post.`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
    window.scrollTo(0, 0);
  }, [identifier]);

  const handleShare = (platform) => {
    const currentUrl = window.location.href;
    const postTitle = postData?.title || "Confira este post";
    let shareUrl = '';
    switch (platform) {
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`; break;
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(postTitle)}`; break;
      case 'whatsapp': shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(postTitle + ' ' + currentUrl)}`; break;
      case 'linkedin': shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`; break;
      default: return;
    }
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => message.success('Link copiado para a área de transferência!'))
      .catch(() => message.error('Falha ao copiar o link.'));
  };

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
        const commentPayload = {
            content: values.newComment,
        };
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
    { title: postData.title.length > 50 ? `${postData.title.substring(0, 50)}...` : postData.title },
  ] : [
    { title: <Link to="/"><HomeOutlined /> Início</Link> },
  ];

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 1, 24));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 1, 14));
  const changeTheme = (theme) => setReadingTheme(theme);

  if (loading) {
    return (
        <Content className="post-detail-page">
            <div className="post-container">
                <div className="loading-spinner" style={{minHeight: '60vh'}}>
                    <Spin size="large" tip="Carregando post..." />
                </div>
            </div>
        </Content>
    );
  }

  if (error) {
    return (
        <Content className="post-detail-page">
            <div className="post-container">
                <Breadcrumb className="post-breadcrumb" items={breadcrumbItems} />
                <Alert message="Erro ao Carregar Post" description={error} type="error" showIcon style={{marginTop: '20px'}}/>
                <Button type="primary" style={{marginTop: '20px'}} onClick={() => navigate('/')}>
                    Voltar para Home
                </Button>
            </div>
        </Content>
    );
  }

  if (!postData) {
    return (
        <Content className="post-detail-page">
            <div className="post-container">
                 <Breadcrumb className="post-breadcrumb" items={breadcrumbItems} />
                 <Empty description="Post não encontrado." style={{marginTop: '50px'}}/>
                 <Button type="primary" style={{marginTop: '20px', display: 'block', margin: '20px auto 0'}} onClick={() => navigate('/')}>
                    Voltar para Home
                </Button>
            </div>
        </Content>
    )
  }

  return (
    <Content className={`post-detail-page reading-theme-${readingTheme}`}>
      <ReadingProgressBar />
      <div className="post-container">
        <Breadcrumb className="post-breadcrumb" items={breadcrumbItems} />
        <Title level={1} className="post-title">{postData.title}</Title>
        <Row justify="space-between" align="middle" className="post-meta-and-share" gutter={[0, 16]}>
            <Col xs={24} md={16} className="post-meta">
            <Row gutter={[16, 8]} align="middle" wrap={true}>
                {postData.author && (
                  <Col>
                    <Space align="center" className="author-info">
                      {postData.author.profileImageUrl && (
                        <img 
                          src={postData.author.profileImageUrl} 
                          alt={postData.author.name}
                          className="author-avatar"
                          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <Text type="secondary" className="meta-item">
                        <UserOutlined /> 
                        {postData.author.profileUrl ? (
                          <a href={postData.author.profileUrl} target="_blank" rel="noopener noreferrer">
                            {postData.author.name}
                          </a>
                        ) : (
                          postData.author.name
                        )}
                      </Text>
                    </Space>
                  </Col>
                )}
                <Col> <Text type="secondary" className="meta-item"><ClockCircleOutlined /> {postData.publishedAt ? new Date(postData.publishedAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date(postData.createdAt).toLocaleDateString('pt-BR')}</Text> </Col>
                {postData.category && <Col> <Tag icon={<FolderOpenOutlined />} color="processing" className="meta-item category-tag"><Link to={`/categoria/${postData.category.slug}`}>{postData.category.name}</Link></Tag> </Col>}
            </Row>
            </Col>
            <Col xs={24} md={8} className="share-buttons">
                <Text strong className="share-label">Compartilhar:</Text>
                <Space wrap size="small">
                    <Tooltip title="Facebook"><Button shape="circle" icon={<FacebookFilled />} onClick={() => handleShare('facebook')} aria-label="Facebook"/></Tooltip>
                    <Tooltip title="Twitter (X)"><Button shape="circle" icon={<TwitterOutlined />} onClick={() => handleShare('twitter')} aria-label="Twitter"/></Tooltip>
                    <Tooltip title="WhatsApp"><Button shape="circle" icon={<WhatsAppOutlined />} onClick={() => handleShare('whatsapp')} aria-label="WhatsApp"/></Tooltip>
                    <Tooltip title="LinkedIn"><Button shape="circle" icon={<LinkedinFilled />} onClick={() => handleShare('linkedin')} aria-label="LinkedIn"/></Tooltip>
                    <Tooltip title="Copiar Link"><Button shape="circle" icon={<LinkOutlined />} onClick={handleCopyLink} aria-label="Copiar Link"/></Tooltip>
                </Space>
            </Col>
        </Row>
        <Divider />
        {postData.imageUrl && (
          <Image 
            src={postData.imageUrl} 
            alt={postData.title} 
            className="post-featured-image" 
            preview={false} 
            // <<< CORREÇÃO CRÍTICA AQUI >>>
            style={{ 
              objectPosition: `${parseFloat(postData.focalPointX) || 50}% ${parseFloat(postData.focalPointY) || 50}%` 
            }}
            onError={(e) => { e.target.style.display='none'; }} 
          />
        )}
        
        <div className="post-body-wrapper" style={{ fontSize: `${fontSize}px` }}>
          <div className="post-body" dangerouslySetInnerHTML={{ __html: postData.content }} />
        </div>
        
        {postData.author && (postData.author.bio || postData.author.profileImageUrl) && (
          <>
            <Divider />
            <div className="author-bio-section">
              <Title level={4}>Sobre o Autor</Title>
              <Row gutter={16} align="top">
                {postData.author.profileImageUrl && (
                  <Col flex="none">
                    <img 
                      src={postData.author.profileImageUrl} 
                      alt={postData.author.name}
                      className="author-bio-avatar"
                      style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </Col>
                )}
                <Col flex="auto">
                  <Title level={5} style={{ marginBottom: 8 }}>
                    {postData.author.profileUrl ? (
                      <a href={postData.author.profileUrl} target="_blank" rel="noopener noreferrer">
                        {postData.author.name}
                      </a>
                    ) : (
                      postData.author.name
                    )}
                  </Title>
                  {postData.author.bio && (
                    <Paragraph style={{ marginBottom: 0 }}>
                      {postData.author.bio}
                    </Paragraph>
                  )}
                </Col>
              </Row>
            </div>
          </>
        )}
        
        <Divider />

        <div className="comment-section custom-comment-section">
          <Title level={3} className="comment-section-title">
              <MessageOutlined /> {comments.length} Comentário(s)
          </Title>
          <div className="custom-comment-form-container">
              <Row gutter={16} wrap={false} align="top">
              <Col flex="none">
                  {getPlaceholderAvatar(
                      localStorage.getItem('authToken') ? { name: localStorage.getItem('userName') } : null,
                      !localStorage.getItem('authToken') ? 'Eu' : null
                  )}
              </Col>
              <Col flex="auto">
                  <Form form={commentForm} onFinish={handleCommentSubmit} layout="vertical">
                  <Form.Item name="newComment" style={{ marginBottom: '8px' }} rules={[{ required: true, message: 'Por favor, escreva algo!' }]}>
                      <TextArea rows={3} placeholder="Deixe seu comentário..." />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0 }}>
                      <Button htmlType="submit" loading={submittingComment} type="primary">
                      Comentar
                      </Button>
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
              <Text type="secondary" style={{display: 'block', textAlign: 'center', marginTop: '20px'}}>
                  Nenhum comentário ainda. Seja o primeiro a comentar!
              </Text>
          )}
        </div>

      </div>

      <ReadingToolsPanel 
        fontSize={fontSize}
        readingTheme={readingTheme}
        increaseFontSize={increaseFontSize}
        decreaseFontSize={decreaseFontSize}
        changeTheme={changeTheme}
      />
    </Content>
  );
};

export default PostDetailPage;