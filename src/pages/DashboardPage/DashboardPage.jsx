// src/pages/DashboardPage/DashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout, Typography, Button, Space, Modal, Form, Input, Select, message, Popconfirm,
  Breadcrumb, Divider, Row, Col, Card, Empty, Tooltip, Table, Spin, Alert,
  Pagination, Upload, Tag // <<< Adicionar Upload
} from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined, DashboardOutlined, EyeOutlined,
  TagsOutlined, ReloadOutlined, UsergroupAddOutlined, MailOutlined, LockOutlined, UserOutlined as AntUserOutlined,
  UploadOutlined // <<< Adicionar UploadOutlined
} from '@ant-design/icons';
import { get, post, put, del, post as apiFormPost } from '../../services/api'; // apiFormPost para FormData
import { useAuth } from '../../context/AuthContext';
import { CONST_IMAGES_BASE_URL } from '../../services/api'; // Importe a constante
import APP_CONFIG from '../../../config'; // Necessário para action do Upload



import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import './DashboardPage.css';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Meta } = Card;

const POSTS_PER_PAGE = 8;
const CATEGORIES_PER_PAGE = 10;
const USERS_PER_PAGE = 10;
const VITE_API_URL='https://geral-famosonamidiaapi.r954jc.easypanel.host/api/v1'


// Função para obter o token (pode ser movida para um helper se usada em mais lugares)
const getAuthToken = () => localStorage.getItem('authToken');

const DashboardPage = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin, isAuthor } = useAuth();

  // Estados para Posts
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorPosts, setErrorPosts] = useState(null);
  const [currentPostsPage, setCurrentPostsPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [postForm] = Form.useForm();
  const [postFileList, setPostFileList] = useState([]); // Para o componente Upload
  const [uploadingImage, setUploadingImage] = useState(false); // Estado para o upload da imagem

  // Estados para Categorias
  const [managedCategories, setManagedCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm] = Form.useForm();

  // Estados para Usuários
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);
  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm] = Form.useForm();

  useEffect(() => {
    if (!currentUser || (!isAdmin && !isAuthor)) {
      // ProtectedRoute deve tratar isso, mas é uma salvaguarda.
    }
  }, [currentUser, isAdmin, isAuthor, navigate]);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true); setErrorCategories(null);
    try {
      const response = await get('/categories?limit=200&sortBy=name&sortOrder=ASC');
      setManagedCategories(response.categories || []);
    } catch (err) { setErrorCategories(err.message || "Erro ao carregar categorias."); console.error("Erro Dashboard/fetchCategories:", err); }
    finally { setLoadingCategories(false); }
  }, []);

 const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    setErrorPosts(null);
    try {
      const params = {
        page: currentPostsPage,
        limit: POSTS_PER_PAGE,
        status: 'all', // Solicita todos os status
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      };

      // Use o endpoint específico do dashboard que é interpretado pelo backend
      // para retornar todos os posts, incluindo drafts e archived.
      const response = await get('/posts/dashboard/all', params);

      setPosts(response.posts || []);
      setTotalPosts(response.totalItems || 0);
    } catch (err) {
      setErrorPosts(err.message || "Erro ao carregar posts.");
      console.error("Erro Dashboard/fetchPosts:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, [currentPostsPage]); // Adicione POSTS_PER_PAGE se ele for um estado ou prop que pode mudar


  useEffect(() => {
    if (currentUser && (isAdmin || isAuthor)) {
      fetchCategories();
      fetchPosts(); // Esta função agora usa o endpoint correto
      if (isAdmin) { fetchUsers(); }
      else { /* setUsers([]); setLoadingUsers(false); */ } // Se tiver estado de usuários
    }
  }, [currentUser, isAdmin, isAuthor, fetchCategories, fetchPosts, fetchUsers]);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) { setLoadingUsers(false); setUsers([]); return; }
    setLoadingUsers(true); setErrorUsers(null);
    try {
      const params = { page: currentUsersPage, limit: USERS_PER_PAGE, search: '' };
      const response = await get('/users', params);
      setUsers(response.users || []);
      setTotalUsers(response.totalItems || 0);
    } catch (err) { setErrorUsers(err.message || "Erro ao carregar usuários."); console.error("Erro Dashboard/fetchUsers:", err); }
    finally { setLoadingUsers(false); }
  }, [isAdmin, currentUsersPage]);

  useEffect(() => {
    if (currentUser && (isAdmin || isAuthor)) {
      fetchCategories();
      fetchPosts();
      if (isAdmin) { fetchUsers(); }
      else { setUsers([]); setLoadingUsers(false); }
    }
  }, [currentUser, isAdmin, isAuthor, fetchCategories, fetchPosts, fetchUsers]);

  const handlePostsPageChange = (page) => setCurrentPostsPage(page);
  const handleUsersPageChange = (page) => setCurrentUsersPage(page);

  const breadcrumbItems = [
    { title: <Link to="/"><HomeOutlined /> Início</Link> },
    { title: <><DashboardOutlined /> Dashboard</> },
  ];

  const generateSlug = (name) => {
    if (!name) return '';
    return name.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/&/g, 'e')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  // --- CRUD Categorias ---
  const showAddCategoryModal = () => { setEditingCategory(null); categoryForm.resetFields(); setIsCategoryModalVisible(true); };
  const showEditCategoryModal = (category) => { setEditingCategory(category); categoryForm.setFieldsValue({ name: category.name, slug: category.slug, description: category.description }); setIsCategoryModalVisible(true); };
  const handleDeleteCategory = async (categoryId) => { try { await del(`/categories/${categoryId}`); message.success('Categoria excluída!'); fetchCategories(); } catch (error) { message.error(error.message || 'Erro ao excluir.'); console.error("Erro Dashboard/handleDeleteCategory:", error);}};
  const handleCategoryModalOk = async () => {
    try {
      const values = await categoryForm.validateFields();
      const payload = { name: values.name, slug: values.slug || generateSlug(values.name), description: values.description };
      if (editingCategory) { await put(`/categories/${editingCategory.id}`, payload); message.success('Categoria atualizada!'); }
      else { await post('/categories', payload); message.success('Categoria criada!'); }
      setIsCategoryModalVisible(false); fetchCategories();
    } catch (errorInfo) { if (errorInfo.message) { message.error(errorInfo.message || 'Erro.'); console.error("API Error", errorInfo); } else { message.error('Verifique os campos.'); console.log('Validation failed:', errorInfo);}}
  };
  const handleCategoryModalCancel = () => setIsCategoryModalVisible(false);
  const categoryTableColumns = [ /* ... (como na resposta anterior) ... */ 
    { title: 'Nome', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name), ellipsis: true },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', ellipsis: true },
    { title: 'Posts', dataIndex: 'postsCount', key: 'posts_count', align: 'center', width: 80, render: (text, record) => record.posts?.length || (record.postsCount !== undefined ? record.postsCount : 0), sorter: (a, b) => (a.posts?.length || a.postsCount || 0) - (b.posts?.length || b.postsCount || 0), },
    { title: 'Ações', key: 'actions', width: 100, align: 'center', fixed: 'right', render: (_, record) => ( <Space> <Tooltip title="Editar"><Button icon={<EditOutlined />} size="small" onClick={() => showEditCategoryModal(record)} /></Tooltip> <Popconfirm title="Excluir categoria?" onConfirm={() => handleDeleteCategory(record.id)} okText="Sim" cancelText="Não" disabled={(record.posts?.length || record.postsCount || 0) > 0 || record.name === 'Geral'}> <Tooltip title={(record.posts?.length || record.postsCount || 0) > 0 ? "Reatribua os posts" : (record.name === 'Geral' ? "Não pode excluir" : "Excluir")}> <Button danger icon={<DeleteOutlined />} size="small" disabled={(record.posts?.length || record.postsCount || 0) > 0 || record.name === 'Geral'} /> </Tooltip> </Popconfirm> </Space> ), },
  ];

  // --- CRUD Posts ---
  const showAddPostModal = () => { setEditingPost(null); postForm.resetFields(); postForm.setFieldsValue({ status: 'draft', content: '' }); setPostFileList([]); setIsPostModalVisible(true); };
  const showEditPostModal = (postToEdit) => {
    setEditingPost(postToEdit);
    postForm.setFieldsValue({ title: postToEdit.title, excerpt: postToEdit.excerpt, content: postToEdit.content || '', categoryId: postToEdit.category?.id, status: postToEdit.status, imageUrl: postToEdit.imageUrl });
    if (postToEdit.imageUrl) { setPostFileList([{ uid: '-1', name: 'image.png', status: 'done', url: postToEdit.imageUrl }]); } else { setPostFileList([]); }
    setIsPostModalVisible(true);
  };
  const handleDeletePost = async (postId) => { try { await del(`/posts/${postId}`); message.success('Post excluído!'); fetchPosts(); } catch (error) { message.error(error.message || 'Erro ao excluir.'); console.error("Erro Dashboard/handleDeletePost:", error);}};
 const handlePostModalOk = async () => {
    try {
      const values = await postForm.validateFields();
      const payload = { ...values };
      if (payload.imageUrl && payload.imageUrl.startsWith('/') && !payload.imageUrl.startsWith('//') && CONST_IMAGES_BASE_URL) {
         payload.imageUrl = `${CONST_IMAGES_BASE_URL}${payload.imageUrl}`;
      }
      console.log('Final payload for post:', payload);
      if (editingPost) {
        await put(`/posts/${editingPost.id}`, payload);
        message.success('Post atualizado!');
      } else {
        await post('/posts', payload);
        message.success('Post criado!');
      }
      setIsPostModalVisible(false);
      fetchPosts(editingPost ? currentPostsPage : 1); // Se editando, fica na mesma página, se criando, vai para a primeira
      setPostFileList([]);
      // postForm.resetFields(); // Removido pois destroyOnClose cuida disso e pode ser melhor para edição
    } catch (errorInfo) {
      if (errorInfo.message) {
        message.error(errorInfo.message || 'Erro ao salvar o post.');
        console.error("API Error on post save:", errorInfo);
      } else {
        message.error('Verifique os campos do formulário.');
        console.log('Form validation failed:', errorInfo);
      }
    }
  };

  const handlePostModalCancel = () => { setIsPostModalVisible(false); setPostFileList([]); /* Limpa file list ao cancelar */ };
  const quillModules = { toolbar: [ [{ 'header': [1, 2, 3, false] }], ['bold', 'italic', 'underline', 'strike', 'blockquote'], [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}], ['link', 'image'], ['clean'] ]};
  const quillFormats = [ 'header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'bullet', 'indent', 'link', 'image' ];

  // Props para o componente Upload
 const imageUploadProps = {
  name: 'imageFile', // Deve corresponder ao nome esperado pelo multer no backend
  listType: 'picture-card',
  className: 'post-image-uploader',
  fileList: postFileList,
  maxCount: 1,
  action: `${APP_CONFIG.API_URL}/upload/image`, // URL do endpoint de upload
  headers: {
    Authorization: `Bearer ${getAuthToken()}`, // Adiciona token JWT
  },
  beforeUpload: (file) => {
    const isJpgOrPngOrGifOrWebp = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/webp';
    if (!isJpgOrPngOrGifOrWebp) {
      message.error('Você só pode enviar arquivos JPG/PNG/GIF/WEBP!');
    }
    const isLt50M = file.size / 1024 / 1024 < 50; // Limite de 50MB
    if (!isLt50M) {
      message.error('A imagem deve ser menor que 50MB!');
    }
    if (isJpgOrPngOrGifOrWebp && isLt50M) {
      setUploadingImage(true); // Inicia o estado de loading para o upload
      return true; // Permite o upload
    }
    return false; // Bloqueia o upload se a validação falhar
  },
  onChange: (info) => {
    // console.log('Upload info:', info); // Para depuração
    let newFileList = [...info.fileList];

    // Mantém apenas o último arquivo se maxCount for 1 e o usuário tentar adicionar mais
    // O AntD Upload já deve lidar com maxCount, mas isso é uma garantia extra.
    if (newFileList.length > 1) {
        newFileList = newFileList.slice(-1);
    }
    
    newFileList = newFileList.map(file => {
      // Cria uma cópia do arquivo para evitar mutação direta do objeto do AntD Upload
      let updatedFile = { 
        ...file,
        // Garante uid e name para cada arquivo na lista, essencial para AntD
        uid: file.uid || `rc-upload-${Date.now()}-${Math.random().toString().slice(2)}`, // Gera um uid se não existir
        name: file.name || 'uploaded_image.png' // Fornece um nome padrão se não existir
      };

      if (file.status === 'done' && file.response) { // Upload bem-sucedido E tem resposta
        setUploadingImage(false);
        const relativeImageUrl = file.response.imageUrl; // Ex: "/uploads/images/nome.jpg"
        let localFullImageUrl = ''; // URL completa a ser construída

        if (relativeImageUrl) {
          if (relativeImageUrl.startsWith('http')) { // Já é uma URL absoluta
              localFullImageUrl = relativeImageUrl;
          } else if (CONST_IMAGES_BASE_URL && relativeImageUrl.startsWith('/')) { // É relativa, precisa construir
              localFullImageUrl = `${CONST_IMAGES_BASE_URL}${relativeImageUrl}`;
          } else { // Formato inesperado, usar como está ou logar erro
              console.warn("Formato de URL de imagem inesperado ou CONST_IMAGES_BASE_URL faltando:", relativeImageUrl);
              localFullImageUrl = relativeImageUrl; // Fallback para a URL como veio
          }
        }
        
        // console.log('Full Image URL to set in form:', localFullImageUrl);
        postForm.setFieldsValue({ imageUrl: localFullImageUrl });
        
        // Atualiza o objeto 'updatedFile' para o fileList
        updatedFile.url = localFullImageUrl; // Para o preview
        updatedFile.status = 'done'; // Confirma o status

      } else if (file.status === 'error') {
          message.error(`${updatedFile.name} falhou ao enviar. ${file.response?.message || (file.error?.message || 'Erro desconhecido.')}`);
          console.error("Upload Error Details:", file.error, file.response);
          setUploadingImage(false);
          updatedFile.status = 'error';
          // Se o upload falhar, você pode querer limpar a URL do formulário se ela foi definida anteriormente
          // if (postForm.getFieldValue('imageUrl') === updatedFile.url) { // Checa se a URL no form é a do arquivo que falhou
          //    postForm.setFieldsValue({ imageUrl: null });
          // }
          // E também remover a entrada do fileList ou marcar como erro.
          // O AntD Upload deve visualmente indicar o erro.
      } else if (file.status === 'uploading') {
          setUploadingImage(true);
          updatedFile.status = 'uploading';
      } else if (file.status === 'removed') {
          // Esta lógica já está em onRemove, que é chamado quando o usuário clica no 'x'
          // Se for uma remoção programática, certifique-se que uploadingImage é false.
          setUploadingImage(false);
      }
      // Se o status não for 'uploading', 'done', 'error', ou 'removed', ele pode ser undefined
      // ou outro estado que o AntD gerencia.
      // É importante retornar sempre uma representação válida do arquivo.
      return updatedFile;
    });
    
    setPostFileList(newFileList);
  },
  onRemove: () => { // Chamado quando o 'x' do item é clicado pelo usuário
      postForm.setFieldsValue({ imageUrl: null }); // Limpa a URL no formulário
      setPostFileList([]); // Esvazia a lista de arquivos (pois maxCount é 1)
      setUploadingImage(false); // Garante que o estado de loading seja desativado
      return true; // Retornar true para permitir a remoção
  },
};


  // --- CRUD Usuários ---
  const showAddUserModal = () => { setEditingUser(null); userForm.resetFields(); userForm.setFieldsValue({ role: 'user' }); setIsUserModalVisible(true); };
  const showEditUserModal = (userToEdit) => { setEditingUser(userToEdit); userForm.setFieldsValue({ name: userToEdit.name, email: userToEdit.email, role: userToEdit.role, password: '', confirmPassword: '' }); setIsUserModalVisible(true); };
  const handleDeleteUser = async (userId) => {
    if (userId === currentUser?.id) { message.error("Não pode excluir a si mesmo."); return; }
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete && userToDelete.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) { message.warn("Não pode excluir o último admin."); return; }
    try { await del(`/users/${userId}`); message.success('Usuário excluído!'); fetchUsers(); }
    catch (error) { message.error(error.message || 'Erro ao excluir.'); console.error("Erro Dashboard/handleDeleteUser:", error); }
  };
  const handleUserModalOk = async () => {
    try {
      const values = await userForm.validateFields();
      const payload = { name: values.name, email: values.email, role: values.role };
      if (values.password) {
        if (!editingUser && values.password !== values.confirmPassword) { message.error('Senhas não coincidem!'); return; }
        if (editingUser && values.password && values.password !== values.confirmPassword) { message.error('Novas senhas não coincidem!'); return; }
        payload.password = values.password;
      }
      if (editingUser) {
        if (!payload.password && payload.password !== undefined) delete payload.password;
        await put(`/users/${editingUser.id}`, payload); message.success('Usuário atualizado!');
      } else {
        if (!payload.password) { message.error('Senha obrigatória para novo usuário.'); return; }
        await post('/users', payload); message.success('Usuário criado!');
      }
      setIsUserModalVisible(false); fetchUsers();
    } catch (errorInfo) { if (errorInfo.message) { message.error(errorInfo.message || 'Erro.'); console.error("API Error", errorInfo); } else { message.error('Verifique os campos.'); console.log('Validation failed:', errorInfo);}}
  };
  const handleUserModalCancel = () => setIsUserModalVisible(false);
  const userTableColumns = [ /* ... (como na resposta anterior) ... */ 
    { title: 'Nome', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name), ellipsis: true },
    { title: 'Email', dataIndex: 'email', key: 'email', sorter: (a, b) => a.email.localeCompare(b.email), ellipsis: true },
    { title: 'Papel', dataIndex: 'role', key: 'role', width: 120, sorter: (a, b) => a.role.localeCompare(b.role), render: (role) => <Tag color={role === 'admin' ? 'volcano' : role === 'author' ? 'geekblue' : 'green'}>{role?.toUpperCase()}</Tag> },
    { title: 'Desde', dataIndex: 'createdAt', key: 'createdAt', width: 120, render: (date) => new Date(date).toLocaleDateString('pt-BR'), sorter: (a,b) => new Date(a.createdAt) - new Date(b.createdAt)},
    { title: 'Ações', key: 'actions', width: 120, align: 'center', fixed: 'right', render: (_, record) => ( <Space> <Tooltip title="Editar Usuário"><Button icon={<EditOutlined />} size="small" onClick={() => showEditUserModal(record)} /></Tooltip> <Popconfirm title="Excluir este usuário?" onConfirm={() => handleDeleteUser(record.id)} okText="Sim" cancelText="Não" disabled={record.id === currentUser?.id || (record.role === 'admin' && users.filter(u=>u.role === 'admin').length <=1 && record.id !== currentUser?.id) }> <Tooltip title={record.id === currentUser?.id ? "Não pode excluir a si mesmo" : ((record.role === 'admin' && users.filter(u=>u.role === 'admin').length <=1 && record.id !== currentUser?.id) ? "Não pode excluir o único admin" : "Excluir Usuário")}> <Button danger icon={<DeleteOutlined />} size="small" disabled={record.id === currentUser?.id || (record.role === 'admin' && users.filter(u=>u.role === 'admin').length <=1 && record.id !== currentUser?.id)} /> </Tooltip> </Popconfirm> </Space> ), },
  ];

  if (!currentUser || (!isAdmin && !isAuthor)) { return ( <Content className="dashboard-page-content" style={{textAlign: 'center', paddingTop: '50px'}}> <Spin tip="Verificando autorização..." size="large"/> </Content> ); }

  return (
    <Content className="dashboard-page-content">
      <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} />

      {/* Seção Categorias */}
      <div className="dashboard-section-header">
        <Title level={3} className="section-main-title"><TagsOutlined /> Gerenciar Categorias</Title>
        <Space> <Button icon={<ReloadOutlined />} onClick={fetchCategories} loading={loadingCategories}>Atualizar</Button> <Button type="dashed" icon={<PlusOutlined />} onClick={showAddCategoryModal}>Nova Categoria</Button> </Space>
      </div>
      {loadingCategories ? <div className="section-loading-spinner"><Spin /></div> :
       errorCategories ? <Alert className="section-error-alert" message="Erro ao Carregar Categorias" description={errorCategories} type="error" showIcon /> :
      <Table columns={categoryTableColumns} dataSource={managedCategories} rowKey="id" pagination={{ pageSize: CATEGORIES_PER_PAGE, simple: true, showTotal: (total, range) => `${range[0]}-${range[1]} de ${total}` }} className="categories-table" style={{ marginBottom: '40px' }} scroll={{ x: 700 }} />}
      <Divider/>

      {/* Seção Posts */}
      <div className="dashboard-section-header">
        <Title level={3} className="section-main-title"><DashboardOutlined /> Gerenciar Posts</Title>
        <Space> <Button icon={<ReloadOutlined />} onClick={fetchPosts} loading={loadingPosts}>Atualizar</Button> <Button type="primary" icon={<PlusOutlined />} onClick={showAddPostModal}>Novo Post</Button> </Space>
      </div>
      {loadingPosts ? <div className="section-loading-spinner"><Spin /></div> :
       errorPosts ? <Alert className="section-error-alert" message="Erro ao Carregar Posts" description={errorPosts} type="error" showIcon /> :
       posts.length > 0 ? (
        <>
          <Row gutter={[16, 16]} className="dashboard-posts-grid">
            {posts.map(p => ( <Col xs={24} sm={12} md={8} lg={6} key={p.id}> <Card className="dashboard-post-card" hoverable cover={
               <img
  alt={p.title}
  src={p.imageUrl ? (p.imageUrl.startsWith('http') ? p.imageUrl : `${CONST_IMAGES_BASE_URL}${p.imageUrl}`) : "https://placehold.co/600x400/E0E0E0/BDBDBD.png?text=Sem+Imagem"}
  className="dashboard-post-card-image"
  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/E0E0E0/BDBDBD.png?text=Erro+Img"; }}
/>
               } actions={[ <Tooltip title="Editar"><Button type="text" icon={<EditOutlined />} key="edit" onClick={() => showEditPostModal(p)} /></Tooltip>, <Popconfirm title="Excluir este post?" onConfirm={() => handleDeletePost(p.id)} okText="Sim" cancelText="Não" key="delete"> <Tooltip title="Excluir"><Button type="text" danger icon={<DeleteOutlined />}/></Tooltip> </Popconfirm>, <Tooltip title="Ver Post"><Link to={`/post/${p.slug || p.id}`} target="_blank" key="view"><Button type="text" icon={<EyeOutlined />}/></Link></Tooltip> ]} > <Meta title={<Tooltip title={p.title} placement="topLeft">{p.title}</Tooltip>} description={ <> <Tag color={p.status === 'published' ? 'success' : p.status === 'draft' ? 'processing' : 'error'}>{p.status?.toUpperCase()}</Tag> <Text type="secondary" style={{ fontSize: '0.8em', display: 'block', margin: '4px 0' }}> {p.category?.name || 'N/A'} - {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('pt-BR') : new Date(p.createdAt).toLocaleDateString('pt-BR')} </Text> <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: '8px', fontSize: '0.9em', minHeight: '2.7em' }}> {p.excerpt} </Paragraph> </> } /> </Card> </Col> ))}
          </Row>
          {totalPosts > POSTS_PER_PAGE && ( <Pagination current={currentPostsPage} total={totalPosts} pageSize={POSTS_PER_PAGE} onChange={handlePostsPageChange} className="dashboard-entity-pagination" showSizeChanger={false} showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} posts`} /> )}
        </>
      ) : ( <Empty description="Nenhum post encontrado. Crie o primeiro!" style={{marginTop: '30px'}}/> )}
      <Divider/>

      {/* Seção Usuários (Apenas Admins) */}
      {isAdmin && (
          <>
            <div className="dashboard-section-header">
                <Title level={3} className="section-main-title"><UsergroupAddOutlined /> Gerenciar Usuários</Title>
                <Space> <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={loadingUsers}>Atualizar</Button> <Button type="dashed" icon={<PlusOutlined />} onClick={showAddUserModal}>Novo Usuário</Button> </Space>
            </div>
            {loadingUsers ? <div className="section-loading-spinner"><Spin /></div> :
            errorUsers ? <Alert className="section-error-alert" message="Erro ao Carregar Usuários" description={errorUsers} type="error" showIcon /> :
            <Table columns={userTableColumns} dataSource={users} rowKey="id"
                pagination={{ current: currentUsersPage, pageSize: USERS_PER_PAGE, total: totalUsers, onChange: handleUsersPageChange, showTotal: (total, range) => `${range[0]}-${range[1]} de ${total}` }}
                className="users-table" style={{ marginBottom: '40px' }} scroll={{ x: 700 }} />}
          </>
      )}

      {/* Modal para Posts */}
      <Modal title={editingPost ? "Editar Post" : "Criar Novo Post"} open={isPostModalVisible} onOk={handlePostModalOk} onCancel={handlePostModalCancel} width={800} destroyOnClose centered
        footer={[ <Button key="back" onClick={handlePostModalCancel}>Cancelar</Button>, <Button key="submit" type="primary" loading={postForm.isSubmitting || uploadingImage} onClick={handlePostModalOk}> {editingPost ? "Salvar Alterações" : "Criar Post"} </Button> ]}
      >
        <Form form={postForm} layout="vertical" name="postForm" initialValues={{ content: '', status: 'draft' }}>
          <Form.Item name="title" label="Título do Post" rules={[{ required: true, message: 'Título é obrigatório!' }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="categoryId" label="Categoria" rules={[{ required: true, message: 'Selecione uma categoria!' }]}>
                <Select placeholder="Selecione uma categoria" loading={loadingCategories} disabled={loadingCategories || managedCategories.length === 0}>
                  {managedCategories.map(cat => (<Option key={cat.id} value={cat.id}>{cat.name}</Option>))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Status é obrigatório!' }]}>
                <Select placeholder="Selecione o status">
                  <Option value="published">Publicado</Option>
                  <Option value="draft">Rascunho</Option>
                  <Option value="archived">Arquivado</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="excerpt" label="Excerto (Resumo Curto)" rules={[{ required: true, message: 'Excerto é obrigatório!' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="content" label="Conteúdo Completo"
            rules={[{ required: true, validator: async (_, value) => { if (!value || value === '<p><br></p>' || value.replace(/<[^>]+>/g, '').trim() === '') return Promise.reject(new Error('Conteúdo é obrigatório!')); return Promise.resolve(); }}]}
          >
            <ReactQuill theme="snow" modules={quillModules} formats={quillFormats} style={{ backgroundColor: 'white' }} />
          </Form.Item>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
                <Form.Item label="Upload da Imagem Principal" /* Não tem 'name' pois é controlado pelo Upload e atualiza 'imageUrl' */
                    tooltip="Envie uma imagem ou cole a URL abaixo."
                >
                    <Upload {...imageUploadProps}>
                        <Button icon={<UploadOutlined />} loading={uploadingImage}>
                            {postFileList.length > 0 ? "Alterar Imagem" : "Selecionar Imagem"}
                        </Button>
                    </Upload>
                </Form.Item>
            </Col>
            <Col xs={24} md={12}>
                <Form.Item name="imageUrl" label="OU Cole a URL da Imagem"
                    extra="Se fizer upload, esta URL será preenchida automaticamente."
                    rules={[{ type: 'url', message: 'Insira uma URL válida se não fizer upload!' }]}
                >
                    <Input placeholder="https://exemplo.com/imagem.jpg" disabled={uploadingImage} />
                </Form.Item>
            </Col>
          </Row>
          {postFileList.length > 0 && postFileList[0].url && postFileList[0].status === 'done' && (
            <div style={{marginTop: '10px'}}>
                <Text strong>Preview da Imagem Selecionada/Enviada:</Text><br/>
                <img src={postFileList[0].url.startsWith('/') ? `${CONST_IMAGES_BASE_URL}${postFileList[0].url}` : postFileList[0].url} alt="Preview" style={{maxWidth: '200px', maxHeight: '150px', border: '1px solid #eee', borderRadius: '4px'}}/>
            </div>
          )}
        </Form>
      </Modal>

      {/* Modal para Categorias */}
      <Modal title={editingCategory ? "Editar Categoria" : "Criar Nova Categoria"} open={isCategoryModalVisible} onOk={handleCategoryModalOk} onCancel={handleCategoryModalCancel} destroyOnClose centered
        footer={[ <Button key="back" onClick={handleCategoryModalCancel}>Cancelar</Button>, <Button key="submit" type="primary" loading={categoryForm.isSubmitting} onClick={handleCategoryModalOk}> {editingCategory ? "Salvar Alterações" : "Criar Categoria"} </Button> ]}
      >
        <Form form={categoryForm} layout="vertical" name="categoryForm">
          <Form.Item name="name" label="Nome da Categoria" rules={[{ required: true, message: 'Nome da categoria é obrigatório!' }]}
            onChange={(e) => { const currentSlug = categoryForm.getFieldValue('slug'); const currentName = editingCategory ? editingCategory.name : ''; if (!editingCategory || !currentSlug || currentSlug === generateSlug(currentName)) { categoryForm.setFieldsValue({ slug: generateSlug(e.target.value) }); }}}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Slug (URL amigável)" rules={[{ required: true, message: 'Slug da categoria é obrigatório!' }]} extra="Gerado automaticamente a partir do nome. Pode ser editado para um valor único.">
            <Input onChange={(e) => categoryForm.setFieldsValue({ slug: generateSlug(e.target.value) })}/>
          </Form.Item>
          <Form.Item name="description" label="Descrição Curta (opcional)">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para Usuários */}
      {isAdmin && (
        <Modal title={editingUser ? "Editar Usuário" : "Criar Novo Usuário"} open={isUserModalVisible} onOk={handleUserModalOk} onCancel={handleUserModalCancel} destroyOnClose centered
            footer={[ <Button key="back" onClick={handleUserModalCancel}>Cancelar</Button>, <Button key="submit" type="primary" loading={userForm.isSubmitting} onClick={handleUserModalOk}> {editingUser ? "Salvar Alterações" : "Criar Usuário"} </Button> ]}
        >
            <Form form={userForm} layout="vertical" name="userForm" initialValues={{role: 'user'}}>
                <Form.Item name="name" label="Nome Completo" rules={[{ required: true, message: 'Nome é obrigatório!' }, {min: 3, message: "Nome deve ter no mínimo 3 caracteres."}]}>
                    <Input prefix={<AntUserOutlined />} placeholder="Nome do usuário" />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Email é obrigatório!' }, { type: 'email', message: 'Email inválido!' }]}>
                    <Input prefix={<MailOutlined />} placeholder="email@exemplo.com" />
                </Form.Item>
                <Form.Item name="role" label="Papel (Role)" rules={[{ required: true, message: 'Papel é obrigatório!' }]}>
                    <Select placeholder="Selecione o papel do usuário">
                        <Option value="user">Usuário (Leitor)</Option>
                        <Option value="author">Autor</Option>
                        <Option value="admin">Administrador</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="password" label={editingUser ? "Nova Senha (deixe em branco para não alterar)" : "Senha"} rules={ editingUser ? [{ required: false }, {validator: (_, value) => !value || value.length >= 6 ? Promise.resolve() : Promise.reject(new Error('Nova senha deve ter no mínimo 6 caracteres.'))}] : [{ required: true, message: 'Senha é obrigatória!' }, {min: 6, message: "Senha deve ter no mínimo 6 caracteres."}]} hasFeedback={!!userForm.getFieldValue('password')}>
                    <Input.Password prefix={<LockOutlined />} placeholder={editingUser ? "Nova senha (mín. 6 caracteres)" : "Senha (mín. 6 caracteres)"} />
                </Form.Item>
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.password !== currentValues.password}>
                    {({ getFieldValue }) => getFieldValue('password') ? (
                            <Form.Item name="confirmPassword" label="Confirme a Senha" dependencies={['password']} hasFeedback rules={[ { required: true, message: 'Confirme a senha!' }, ({ getFieldValue: gfVal }) => ({ validator(_, value) { if (!value || gfVal('password') === value) return Promise.resolve(); return Promise.reject(new Error('As senhas não coincidem!')); }, }), ]}>
                                <Input.Password prefix={<LockOutlined />} placeholder="Confirme a senha digitada" />
                            </Form.Item>
                        ) : null
                    }
                </Form.Item>
            </Form>
        </Modal>
      )}
    </Content>
  );
};

export default DashboardPage;