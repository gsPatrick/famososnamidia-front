// src/pages/PostDetail/PostDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Adicionado useNavigate
import {
  Layout, Typography, Spin, Image, Breadcrumb, Tag, Divider, Row, Col, Alert,
  List, Form, Input, Button, Avatar, Tooltip, message, Space, Empty // Adicionado Empty, useNavigate
} from 'antd';
import {
  ClockCircleOutlined, UserOutlined, FolderOpenOutlined, MessageOutlined,
  FacebookFilled, TwitterOutlined, WhatsAppOutlined, LinkedinFilled, LinkOutlined, HomeOutlined 
} from '@ant-design/icons';
import { get, post as apiPost } from '../../services/api'; // <<< IMPORTAR 'get' e 'post' (renomeado para apiPost)
import './PostDetailPage.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const PostDetailPage = () => {
  const { postId: identifier } = useParams(); // Renomeado postId para identifier para clareza
  const [postData, setPostData] = useState(null); // Renomeado post para postData para evitar conflito com a função 'post' da api
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentForm] = Form.useForm();
  const navigate = useNavigate(); // Para navegação programática

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!identifier) return;
      setLoading(true);
      setError(null);
      try {
        // O backend /posts/:identifier pode receber ID ou SLUG
        const fetchedPost = await get(`/posts/${identifier}`);
        // console.log('Detalhes do Post da API:', fetchedPost);
        
        // O backend já retorna o post com os comentários aninhados em fetchedPost.comments
        setPostData(fetchedPost);
        setComments(fetchedPost.comments || []); // Garante que comments seja um array

      } catch (err) {
        console.error(`Erro ao buscar detalhes do post ${identifier}:`, err);
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

  const handleCommentSubmit = async (values) => { // <<< Tornar async
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
            // guestName e guestEmail seriam necessários se o usuário não estiver logado
            // e o backend os exigir para comentários anônimos.
            // O backend /post/:postId/comments pega o userId do token se logado.
        };
        // Adicionar guestName e guestEmail se o usuário não estiver logado (exemplo)
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            // Simulando que pedimos nome para guest, o backend pode exigir
            const guestName = prompt("Por favor, insira seu nome para comentar:", "Visitante");
            if (!guestName) {
                message.info("Nome é necessário para comentar como visitante.");
                setSubmittingComment(false);
                return;
            }
            commentPayload.guestName = guestName;
            // commentPayload.guestEmail = prompt("Seu email (opcional):"); // Se quiser pedir email
        }

        const newComment = await apiPost(`/post/${postData.id}/comments`, commentPayload);
        // console.log("Novo comentário da API:", newComment);
        
        // Atualiza a lista de comentários com o novo comentário e dados do usuário (se logado) ou guest
        // O backend deve retornar o comentário criado com o usuário (se logado) ou guestName.
        // Para ter o avatar e nome corretos imediatamente, precisamos que o backend retorne
        // o comentário com o 'user' (se logado) ou guestName populado.
        
        // Solução Simples: Adiciona o comentário como veio da API.
        // Se o usuário estiver logado, o backend deve retornar o comentário com a associação `user`
        // (id, name). Se for guest, `guestName` estará lá.
        setComments(prevComments => [newComment, ...prevComments]);

        commentForm.resetFields();
        message.success('Comentário adicionado com sucesso!');

    } catch (error) {
        message.error(error.message || 'Falha ao adicionar comentário.');
        console.error("Erro ao submeter comentário:", error);
    } finally {
        setSubmittingComment(false);
    }
  };

  const getPlaceholderAvatar = (commentUser, guestName) => {
    const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#1890ff', '#87d068', '#eb2f96', '#52c41a'];
    let seed = 'V'; // Visitante padrão
    let char = '?';

    if (commentUser && commentUser.name) { // Comentário de usuário logado
        seed = commentUser.name;
        char = commentUser.name.charAt(0).toUpperCase();
    } else if (guestName) { // Comentário de visitante
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


  if (loading) {
    return (
        <Content className="post-detail-page">
            <div className="post-container">
                <Breadcrumb className="post-breadcrumb" items={breadcrumbItems} />
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

  if (!postData) { // Caso não esteja carregando e não haja erro, mas postData seja null
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

  // Se chegou aqui, postData existe
  return (
    <Content className="post-detail-page">
      <div className="post-container">
        <Breadcrumb className="post-breadcrumb" items={breadcrumbItems} />

        <Title level={1} className="post-title">{postData.title}</Title>

        <Row justify="space-between" align="middle" className="post-meta-and-share" gutter={[0, 16]}>
            <Col xs={24} md={16} className="post-meta">
            <Row gutter={[16, 8]} align="middle" wrap={true}>
                {postData.author && <Col> <Text type="secondary" className="meta-item"><UserOutlined /> {postData.author.name}</Text> </Col>}
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
        {postData.imageUrl && <Image src={postData.imageUrl} alt={postData.title} className="post-featured-image" preview={false} onError={(e) => { e.target.style.display='none'; }} />}
        <div className="post-body" dangerouslySetInnerHTML={{ __html: postData.content }} />

        <Divider />
        <div className="comment-section custom-comment-section">
        <Title level={3} className="comment-section-title">
            <MessageOutlined /> {comments.length} Comentário(s)
        </Title>

        <div className="custom-comment-form-container">
            <Row gutter={16} wrap={false} align="top">
            <Col flex="none">
                {/* Avatar do usuário logado ou placeholder para guest */}
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
            dataSource={comments} // DataSource agora vem do estado 'comments'
            renderItem={comment => ( // Renomeado 'item' para 'comment' para clareza
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
    </Content>
  );
};

export default PostDetailPage;