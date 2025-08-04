// src/pages/DashboardPage/DashboardPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Layout, Typography, Button, Space, Modal, Form, Input, Select, message, Popconfirm,
  Breadcrumb, Divider, Row, Col, Card, Empty, Tooltip, Table, Spin, Alert,
  Pagination, Upload, Switch, Tag, DatePicker
} from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined, DashboardOutlined, EyeOutlined,
  TagsOutlined, ReloadOutlined, UsergroupAddOutlined, MailOutlined, LockOutlined, UserOutlined as AntUserOutlined,
  UploadOutlined, AimOutlined, ArrowUpOutlined, ArrowDownOutlined, MenuOutlined, ClockCircleOutlined, FilterOutlined
} from '@ant-design/icons';
import { get, post, put, del } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CONST_IMAGES_BASE_URL } from '../../services/api';
import APP_CONFIG from '../../../config';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './DashboardPage.css';
import dayjs from 'dayjs'; // <<< CORREÇÃO: Importar a biblioteca dayjs

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Meta } = Card;

const POSTS_PER_PAGE = 8;
const CATEGORIES_PER_PAGE = 10;
const USERS_PER_PAGE = 10;

// Componente para selecionar o ponto de foco na imagem
const FocalPointSelector = ({ imageUrl, initialX, initialY, onFocalPointChange }) => {
    const [focalPoint, setFocalPoint] = useState({ x: initialX || 50, y: initialY || 50 });
    const imageRef = useRef(null);

    useEffect(() => {
        setFocalPoint({ x: initialX || 50, y: initialY || 50 });
    }, [imageUrl, initialX, initialY]);

    const handleImageClick = (e) => {
        if (!imageRef.current) return;
        const rect = imageRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newFocalX = (x / rect.width) * 100;
        const newFocalY = (y / rect.height) * 100;
        const roundedX = parseFloat(newFocalX.toFixed(2));
        const roundedY = parseFloat(newFocalY.toFixed(2));
        setFocalPoint({ x: roundedX, y: roundedY });
        onFocalPointChange(roundedX, roundedY);
    };

    if (!imageUrl) {
        return <Text type="secondary">Faça o upload ou cole a URL de uma imagem para definir o ponto de foco.</Text>;
    }

    return (
        <div className="focal-point-selector" onClick={handleImageClick}>
            <img ref={imageRef} src={imageUrl} alt="Preview para ponto de foco" className="focal-point-image-preview" />
            <div
                className="focal-point-marker"
                style={{ left: `${focalPoint.x}%`, top: `${focalPoint.y}%` }}
                title={`Foco: X=${focalPoint.x}%, Y=${focalPoint.y}%`}
            >
                <AimOutlined />
            </div>
            <div className="focal-point-overlay-text">Clique para definir o ponto de foco</div>
        </div>
    );
};

const PostFormModalContent = ({ postForm, loadingCategories, managedCategories, imageUploadProps, uploadingImage }) => {
    const statusValue = Form.useWatch('status', postForm);

    const disabledDate = (current) => {
        return current && current < dayjs().startOf('day');
    };

    const quillModules = { 
        toolbar: [ 
          [{ 'header': [1, 2, 3, false] }], 
          ['bold', 'italic', 'underline', 'strike'], 
          ['blockquote', 'code-block'],
          [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}], 
          ['link', 'image'],
          [{ 'align': [] }],
          [{ 'color': [] }, { 'background': [] }],
          ['clean'] 
        ],
        clipboard: { matchVisual: false }
    };

    const quillFormats = [ 
        'header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
        'list', 'bullet', 'indent', 'link', 'image', 'align', 'color', 'background' 
    ];

    return (
        <Form form={postForm} layout="vertical" name="postForm" initialValues={{ content: '', status: 'draft', focalPointX: 50, focalPointY: 50 }}>
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
                            <Option value="scheduled">Agendado</Option>
                            <Option value="archived">Arquivado</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            {statusValue === 'scheduled' && (
                <Form.Item
                    name="publishedAt"
                    label="Data e Hora da Publicação"
                    rules={[{ required: true, message: 'A data de agendamento é obrigatória!' }]}
                >
                    <DatePicker
                        showTime
                        format="DD/MM/YYYY HH:mm"
                        disabledDate={disabledDate}
                        placeholder="Selecione a data e hora"
                        style={{ width: '100%' }}
                    />
                </Form.Item>
            )}
            <Form.Item name="excerpt" label="Excerto (Resumo Curto)" rules={[{ required: true, message: 'Excerto é obrigatório!' }]}>
                <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="content" label="Conteúdo Completo" rules={[{ required: true, validator: async (_, value) => { if (!value || value === '<p><br></p>' || value.replace(/<[^>]+>/g, '').trim() === '') return Promise.reject(new Error('Conteúdo é obrigatório!')); return Promise.resolve(); }}]}>
                <ReactQuill 
                    theme="snow" 
                    modules={quillModules} 
                    formats={quillFormats} 
                    style={{ backgroundColor: 'white' }}
                    preserveWhitespace={true}
                    placeholder="Digite o conteúdo do post aqui..."
                />
            </Form.Item>
            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item label="Upload da Imagem Principal" tooltip="Envie uma imagem ou cole a URL abaixo."><Upload {...imageUploadProps}><Button icon={<UploadOutlined />} loading={uploadingImage}>{postForm.getFieldValue('imageUrl') ? "Alterar Imagem" : "Selecionar Imagem"}</Button></Upload></Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name="imageUrl" label="OU Cole a URL da Imagem" extra="Se fizer upload, esta URL será preenchida automaticamente." rules={[{ type: 'url', message: 'Insira uma URL válida se não fizer upload!' }]}><Input placeholder="https://exemplo.com/imagem.jpg" disabled={uploadingImage} /></Form.Item>
                </Col>
            </Row>
            <Divider>Ponto de Foco da Imagem de Capa</Divider>
            <Form.Item label="Ponto de Foco" tooltip="Clique na imagem abaixo para definir a área que deve ser priorizada no enquadramento. Isso é útil para garantir que rostos não sejam cortados em diferentes tamanhos de tela.">
                <Form.Item name="focalPointX" hidden><Input/></Form.Item>
                <Form.Item name="focalPointY" hidden><Input/></Form.Item>
                <FocalPointSelector 
                    imageUrl={postForm.getFieldValue('imageUrl')}
                    initialX={postForm.getFieldValue('focalPointX')}
                    initialY={postForm.getFieldValue('focalPointY')}
                    onFocalPointChange={(x, y) => {
                        postForm.setFieldsValue({ focalPointX: x, focalPointY: y });
                    }}
                />
            </Form.Item>
        </Form>
    );
};


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
  const [postFileList, setPostFileList] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [sortBy, setSortBy] = useState('publishedAt');
  const [filterStatus, setFilterStatus] = useState('all');

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

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true); setErrorCategories(null);
    try {
      const response = await get('/categories?limit=200&sortBy=name&sortOrder=ASC');
      setManagedCategories(response.categories || []);
    } catch (err) { setErrorCategories(err.message || "Erro ao carregar categorias."); console.error("Erro Dashboard/fetchCategories:", err); }
    finally { setLoadingCategories(false); }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true); setErrorPosts(null);
    try {
      const params = { 
        page: currentPostsPage, 
        limit: POSTS_PER_PAGE, 
        status: filterStatus,
        sortBy: reorderMode ? 'custom' : sortBy, 
        sortOrder: 'DESC' 
      };
      const response = await get('/posts/dashboard/all', params);
      setPosts(response.posts || []);
      setTotalPosts(response.totalItems || 0);
    } catch (err) { setErrorPosts(err.message || "Erro ao carregar posts."); console.error("Erro Dashboard/fetchPosts:", err); }
    finally { setLoadingPosts(false); }
  }, [currentPostsPage, reorderMode, sortBy, filterStatus]);

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
      if (isAdmin) {
        fetchUsers();
      } else {
        setUsers([]);
        setLoadingUsers(false);
      }
    }
  }, [currentUser, isAdmin, isAuthor, fetchCategories, fetchUsers]);

  useEffect(() => {
    if (currentUser && (isAdmin || isAuthor)) {
        fetchPosts();
    }
  }, [fetchPosts, currentUser, isAdmin, isAuthor]);


  const handlePostsPageChange = (page) => setCurrentPostsPage(page);
  const handleUsersPageChange = (page) => setCurrentUsersPage(page);

  const breadcrumbItems = [
    { title: <Link to="/"><HomeOutlined /> Início</Link> },
    { title: <><DashboardOutlined /> Dashboard</> },
  ];

  const generateSlug = (name) => {
    if (!name) return '';
    return name.toString().toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'e').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  };

  const showAddCategoryModal = () => { setEditingCategory(null); categoryForm.resetFields(); setIsCategoryModalVisible(true); };
  const showEditCategoryModal = (category) => { setEditingCategory(category); categoryForm.setFieldsValue({ name: category.name, slug: category.slug, description: category.description }); setIsCategoryModalVisible(true); };
  const handleDeleteCategory = async (categoryId) => { try { await del(`/categories/${categoryId}`); message.success('Categoria excluída!'); fetchCategories(); fetchPosts(); } catch (error) { message.error(error.message || 'Erro ao excluir.'); }};
  const handleCategoryModalOk = async () => {
    try {
      const values = await categoryForm.validateFields();
      const payload = { name: values.name, slug: values.slug || generateSlug(values.name), description: values.description };
      if (editingCategory) { await put(`/categories/${editingCategory.id}`, payload); message.success('Categoria atualizada!'); }
      else { await post('/categories', payload); message.success('Categoria criada!'); }
      setIsCategoryModalVisible(false); fetchCategories();
    } catch (errorInfo) { if (errorInfo.message) { message.error(errorInfo.message); } else { message.error('Verifique os campos.'); }}
  };
  const handleCategoryModalCancel = () => setIsCategoryModalVisible(false);
  const categoryTableColumns = [ { title: 'Nome', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name), ellipsis: true }, { title: 'Slug', dataIndex: 'slug', key: 'slug', ellipsis: true }, { title: 'Posts', dataIndex: 'postsCount', key: 'posts_count', align: 'center', width: 80, render: (text, record) => record.posts?.length || (record.postsCount !== undefined ? record.postsCount : 0), sorter: (a, b) => (a.posts?.length || a.postsCount || 0) - (b.posts?.length || b.postsCount || 0), }, { title: 'Ações', key: 'actions', width: 100, align: 'center', fixed: 'right', render: (_, record) => ( <Space> <Tooltip title="Editar"><Button icon={<EditOutlined />} size="small" onClick={() => showEditCategoryModal(record)} /></Tooltip> <Popconfirm title="Excluir?" onConfirm={() => handleDeleteCategory(record.id)} okText="Sim" cancelText="Não" disabled={(record.posts?.length || record.postsCount || 0) > 0 || record.name === 'Geral'}> <Tooltip title={(record.posts?.length || record.postsCount || 0) > 0 ? "Reatribua os posts" : (record.name === 'Geral' ? "Não pode excluir" : "Excluir")}> <Button danger icon={<DeleteOutlined />} size="small" disabled={(record.posts?.length || record.postsCount || 0) > 0 || record.name === 'Geral'} /> </Tooltip> </Popconfirm> </Space> ), }, ];

  const showAddPostModal = () => { setEditingPost(null); postForm.resetFields(); postForm.setFieldsValue({ status: 'draft', content: '', focalPointX: 50, focalPointY: 50 }); setPostFileList([]); setIsPostModalVisible(true); };
  
  const showEditPostModal = (postToEdit) => {
    setEditingPost(postToEdit);
    
    setTimeout(() => {
        // A URL da imagem já deve ser absoluta, vinda da lógica do Card.
        // Se não for, a lógica do card precisa ser a fonte da verdade.
        const imageUrl = postToEdit.imageUrl ? (postToEdit.imageUrl.startsWith('http') ? postToEdit.imageUrl : `${CONST_IMAGES_BASE_URL}${postToEdit.imageUrl}`) : '';
        
        postForm.setFieldsValue({ 
            title: postToEdit.title, 
            excerpt: postToEdit.excerpt, 
            content: postToEdit.content || '', 
            categoryId: postToEdit.category?.id, 
            status: postToEdit.status, 
            imageUrl: imageUrl,
            focalPointX: postToEdit.focalPointX || 50,
            focalPointY: postToEdit.focalPointY || 50,
            // <<< CORREÇÃO: Usar dayjs para converter a string de data >>>
            publishedAt: postToEdit.publishedAt ? dayjs(postToEdit.publishedAt) : null,
        });

        if (imageUrl) { 
            setPostFileList([{ uid: '-1', name: 'image.png', status: 'done', url: imageUrl }]); 
        } else { 
            setPostFileList([]); 
        }
    }, 100);
    
    setIsPostModalVisible(true);
  };

  const handleDeletePost = async (postId) => { try { await del(`/posts/${postId}`); message.success('Post excluído!'); fetchPosts(); } catch (error) { message.error(error.message || 'Erro ao excluir.'); }};
  
  const handlePostModalOk = async () => {
    try {
      const values = await postForm.validateFields();
      const payload = { ...values };

      // <<< CORREÇÃO: Converter o objeto dayjs de volta para string ISO >>>
      if (payload.publishedAt && dayjs.isDayjs(payload.publishedAt)) {
          payload.publishedAt = payload.publishedAt.toISOString();
      }

      if (payload.status !== 'scheduled') {
          payload.publishedAt = null;
      }
      
      if (editingPost) {
        await put(`/posts/${editingPost.id}`, payload);
        message.success('Post atualizado!');
      } else {
        await post('/posts', payload);
        message.success('Post criado!');
      }
      setIsPostModalVisible(false);
      fetchPosts(editingPost ? currentPostsPage : 1);
      setPostFileList([]);
    } catch (errorInfo) {
      if (errorInfo.message) { message.error(errorInfo.message || 'Erro ao salvar o post.'); } 
      else { message.error('Verifique os campos do formulário.'); }
    }
  };

  const handlePostModalCancel = () => { setIsPostModalVisible(false); setPostFileList([]); };
  
  const movePostUp = async (postIndex) => {
    if (postIndex === 0) return;
    try {
      const currentPost = posts[postIndex];
      const previousPost = posts[postIndex - 1];
      const newPosts = [...posts];
      [newPosts[postIndex], newPosts[postIndex - 1]] = [newPosts[postIndex - 1], newPosts[postIndex]];
      setPosts(newPosts);
      await put(`/posts/reorder/batch`, { postOrders: [ { id: currentPost.id, sortOrder: postIndex }, { id: previousPost.id, sortOrder: postIndex + 1 } ] });
      message.success('Post movido para cima!');
    } catch (error) { message.error('Erro ao reordenar posts.'); fetchPosts(); }
  };
  
  const movePostDown = async (postIndex) => {
    if (postIndex === posts.length - 1) return;
    try {
      const currentPost = posts[postIndex];
      const nextPost = posts[postIndex + 1];
      const newPosts = [...posts];
      [newPosts[postIndex], newPosts[postIndex + 1]] = [newPosts[postIndex + 1], newPosts[postIndex]];
      setPosts(newPosts);
      await put(`/posts/reorder/batch`, { postOrders: [ { id: currentPost.id, sortOrder: postIndex + 2 }, { id: nextPost.id, sortOrder: postIndex + 1 } ] });
      message.success('Post movido para baixo!');
    } catch (error) { message.error('Erro ao reordenar posts.'); fetchPosts(); }
  };
  
  const toggleReorderMode = () => {
    setReorderMode(!reorderMode);
    if (!reorderMode) { setSortBy('custom'); setCurrentPostsPage(1); } 
    else { setSortBy('publishedAt'); }
  };

  const imageUploadProps = {
    name: 'imageFile', listType: 'picture-card', className: 'post-image-uploader', fileList: postFileList, maxCount: 1, action: `${APP_CONFIG.API_URL}/upload/image`, headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}`, },
    beforeUpload: (file) => { const isJpgOrPngOrGifOrWebp = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/webp'; if (!isJpgOrPngOrGifOrWebp) { message.error('Você só pode enviar arquivos JPG/PNG/GIF/WEBP!'); } const isLt50M = file.size / 1024 / 1024 < 50; if (!isLt50M) { message.error('A imagem deve ser menor que 50MB!'); } if (isJpgOrPngOrGifOrWebp && isLt50M) { setUploadingImage(true); return true; } return false; },
    onChange: (info) => { let newFileList = [...info.fileList].slice(-1); newFileList = newFileList.map(file => { let updatedFile = { ...file, uid: file.uid || `rc-upload-${Date.now()}` }; if (file.status === 'done' && file.response) { setUploadingImage(false); const relativeImageUrl = file.response.imageUrl; let localFullImageUrl = ''; if (relativeImageUrl) { if (relativeImageUrl.startsWith('http')) { localFullImageUrl = relativeImageUrl; } else if (CONST_IMAGES_BASE_URL && relativeImageUrl.startsWith('/')) { localFullImageUrl = `${CONST_IMAGES_BASE_URL}${relativeImageUrl}`; } else { localFullImageUrl = relativeImageUrl; } } postForm.setFieldsValue({ imageUrl: localFullImageUrl }); updatedFile.url = localFullImageUrl; updatedFile.status = 'done'; } else if (file.status === 'error') { message.error(`${updatedFile.name} falhou ao enviar.`); setUploadingImage(false); updatedFile.status = 'error'; } else if (file.status === 'uploading') { setUploadingImage(true); updatedFile.status = 'uploading'; } return updatedFile; }); setPostFileList(newFileList); },
    onRemove: () => { postForm.setFieldsValue({ imageUrl: null }); setPostFileList([]); setUploadingImage(false); return true; },
  };

  const showAddUserModal = () => { setEditingUser(null); userForm.resetFields(); userForm.setFieldsValue({ role: 'user' }); setIsUserModalVisible(true); };
  const showEditUserModal = (userToEdit) => { setEditingUser(userToEdit); userForm.setFieldsValue({ name: userToEdit.name, email: userToEdit.email, role: userToEdit.role, profileImageUrl: userToEdit.profileImageUrl, profileUrl: userToEdit.profileUrl, bio: userToEdit.bio, password: '', confirmPassword: '' }); setIsUserModalVisible(true); };
  const handleDeleteUser = async (userId) => { if (userId === currentUser?.id) { message.error("Não pode excluir a si mesmo."); return; } const userToDelete = users.find(u => u.id === userId); if (userToDelete && userToDelete.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) { message.warn("Não pode excluir o último admin."); return; } try { await del(`/users/${userId}`); message.success('Usuário excluído!'); fetchUsers(); } catch (error) { message.error(error.message || 'Erro ao excluir.'); }};
  const handleUserModalOk = async () => { try { const values = await userForm.validateFields(); const payload = { name: values.name, email: values.email, role: values.role, profileImageUrl: values.profileImageUrl || null, profileUrl: values.profileUrl || null, bio: values.bio || null }; if (values.password) { if (!editingUser && values.password !== values.confirmPassword) { message.error('Senhas não coincidem!'); return; } if (editingUser && values.password && values.password !== values.confirmPassword) { message.error('Novas senhas não coincidem!'); return; } payload.password = values.password; } if (editingUser) { if (!payload.password && payload.password !== undefined) delete payload.password; await put(`/users/${editingUser.id}`, payload); message.success('Usuário atualizado!'); } else { if (!payload.password) { message.error('Senha obrigatória para novo usuário.'); return; } await post('/users', payload); message.success('Usuário criado!'); } setIsUserModalVisible(false); fetchUsers(); } catch (errorInfo) { if (errorInfo.message) { message.error(errorInfo.message || 'Erro.'); } else { message.error('Verifique os campos.'); }}};
  const handleUserModalCancel = () => setIsUserModalVisible(false);
  const userTableColumns = [ { title: 'Nome', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name), ellipsis: true }, { title: 'Email', dataIndex: 'email', key: 'email', sorter: (a, b) => a.email.localeCompare(b.email), ellipsis: true }, { title: 'Papel', dataIndex: 'role', key: 'role', width: 120, sorter: (a, b) => a.role.localeCompare(b.role), render: (role) => <Tag color={role === 'admin' ? 'volcano' : role === 'author' ? 'geekblue' : 'green'}>{role?.toUpperCase()}</Tag> }, { title: 'Desde', dataIndex: 'createdAt', key: 'createdAt', width: 120, render: (date) => new Date(date).toLocaleDateString('pt-BR'), sorter: (a,b) => new Date(a.createdAt) - new Date(b.createdAt)}, { title: 'Ações', key: 'actions', width: 120, align: 'center', fixed: 'right', render: (_, record) => ( <Space> <Tooltip title="Editar Usuário"><Button icon={<EditOutlined />} size="small" onClick={() => showEditUserModal(record)} /></Tooltip> <Popconfirm title="Excluir este usuário?" onConfirm={() => handleDeleteUser(record.id)} okText="Sim" cancelText="Não" disabled={record.id === currentUser?.id || (record.role === 'admin' && users.filter(u=>u.role === 'admin').length <=1 && record.id !== currentUser?.id) }> <Tooltip title={record.id === currentUser?.id ? "Não pode excluir a si mesmo" : ((record.role === 'admin' && users.filter(u=>u.role === 'admin').length <=1 && record.id !== currentUser?.id) ? "Não pode excluir o único admin" : "Excluir Usuário")}> <Button danger icon={<DeleteOutlined />} size="small" disabled={record.id === currentUser?.id || (record.role === 'admin' && users.filter(u=>u.role === 'admin').length <=1 && record.id !== currentUser?.id)} /> </Tooltip> </Popconfirm> </Space> ), }, ];
  
  if (!currentUser || (!isAdmin && !isAuthor)) { return ( <Content className="dashboard-page-content" style={{textAlign: 'center', paddingTop: '50px'}}> <Spin tip="Verificando autorização..." size="large"/> </Content> ); }

  const statusTags = {
    published: <Tag color="success">PUBLICADO</Tag>,
    draft: <Tag color="processing">RASCUNHO</Tag>,
    scheduled: <Tag icon={<ClockCircleOutlined />} color="cyan">AGENDADO</Tag>,
    archived: <Tag color="error">ARQUIVADO</Tag>,
  };

  return (
    <Content className="dashboard-page-content">
      <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} />

      <div className="dashboard-section-header">
        <Title level={3} className="section-main-title"><TagsOutlined /> Gerenciar Categorias</Title>
        <Space> <Button icon={<ReloadOutlined />} onClick={fetchCategories} loading={loadingCategories}>Atualizar</Button> <Button type="dashed" icon={<PlusOutlined />} onClick={showAddCategoryModal}>Nova Categoria</Button> </Space>
      </div>
      {loadingCategories ? <div className="section-loading-spinner"><Spin /></div> :
       errorCategories ? <Alert className="section-error-alert" message="Erro ao Carregar Categorias" description={errorCategories} type="error" showIcon /> :
      <Table columns={categoryTableColumns} dataSource={managedCategories} rowKey="id" pagination={{ pageSize: CATEGORIES_PER_PAGE, simple: true, showTotal: (total, range) => `${range[0]}-${range[1]} de ${total}` }} className="categories-table" style={{ marginBottom: '40px' }} scroll={{ x: 700 }} />}
      <Divider/>

      <div className="dashboard-section-header">
        <Title level={3} className="section-main-title"><DashboardOutlined /> Gerenciar Posts</Title>
        <Space wrap> 
          <Select value={filterStatus} onChange={(value) => { setFilterStatus(value); setCurrentPostsPage(1); }} style={{ width: 140 }}>
              <Option value="all">Todos os Status</Option>
              <Option value="published">Publicados</Option>
              <Option value="draft">Rascunhos</Option>
              <Option value="scheduled">Agendados</Option>
              <Option value="archived">Arquivados</Option>
          </Select>
          <Switch checked={reorderMode} onChange={toggleReorderMode} checkedChildren="Reordenar" unCheckedChildren="Normal" />
          <Button icon={<ReloadOutlined />} onClick={fetchPosts} loading={loadingPosts}>Atualizar</Button> 
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddPostModal}>Novo Post</Button> 
        </Space>
      </div>
      {reorderMode && (
        <Alert message="Modo de Reordenação Ativo" description="Use as setas para mover os posts. A ordem é salva automaticamente." type="info" showIcon style={{ marginBottom: 16 }} />
      )}
      {loadingPosts ? <div className="section-loading-spinner"><Spin /></div> :
       errorPosts ? <Alert className="section-error-alert" message="Erro ao Carregar Posts" description={errorPosts} type="error" showIcon /> :
       posts.length > 0 ? (
        <>
          <Row gutter={[16, 16]} className="dashboard-posts-grid">
            {posts.map((p, index) => ( 
              <Col xs={24} sm={12} md={8} lg={6} key={p.id}> 
                <Card 
                  className="dashboard-post-card" 
                  hoverable 
                  cover={ <img alt={p.title} src={p.imageUrl ? (p.imageUrl.startsWith('http') ? p.imageUrl : `${CONST_IMAGES_BASE_URL}${p.imageUrl}`) : "https://placehold.co/600x400/E0E0E0/BDBDBD.png?text=Sem+Imagem"} className="dashboard-post-card-image" style={{ objectPosition: `${p.focalPointX || 50}% ${p.focalPointY || 50}%` }} onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/E0E0E0/BDBDBD.png?text=Erro+Img"; }} /> } 
                  actions={reorderMode ? [
                    <Tooltip title="Mover para cima" key="up"><Button type="text" icon={<ArrowUpOutlined />} onClick={() => movePostUp(index)} disabled={index === 0}/></Tooltip>,
                    <Tooltip title="Posição" key="position"><Button type="text" icon={<MenuOutlined />} disabled>{index + 1 + ((currentPostsPage - 1) * POSTS_PER_PAGE)}</Button></Tooltip>,
                    <Tooltip title="Mover para baixo" key="down"><Button type="text" icon={<ArrowDownOutlined />} onClick={() => movePostDown(index)} disabled={index === posts.length - 1}/></Tooltip>
                  ] : [
                    <Tooltip title="Editar" key="edit"><Button type="text" icon={<EditOutlined />} onClick={() => showEditPostModal(p)} /></Tooltip>, 
                    <Popconfirm title="Excluir este post?" onConfirm={() => handleDeletePost(p.id)} okText="Sim" cancelText="Não" key="delete"><Tooltip title="Excluir"><Button type="text" danger icon={<DeleteOutlined />}/></Tooltip></Popconfirm>, 
                    <Tooltip title="Ver Post" key="view"><Link to={`/post/${p.slug || p.id}`} target="_blank"><Button type="text" icon={<EyeOutlined />}/></Link></Tooltip> 
                  ]} 
                > 
                  <Meta 
                    title={<Tooltip title={p.title} placement="topLeft">{p.title}</Tooltip>} 
                    description={ 
                      <> 
                        {statusTags[p.status] || <Tag>{p.status?.toUpperCase()}</Tag>}
                        <Text type="secondary" className="post-card-details">
                            {p.category?.name || 'N/A'} - 
                            {p.status === 'scheduled' ? (
                                <span className="scheduled-date-text">
                                    {dayjs(p.publishedAt).format('DD/MM/YYYY HH:mm')}
                                </span>
                            ) : (
                                p.publishedAt ? dayjs(p.publishedAt).format('DD/MM/YYYY') : dayjs(p.createdAt).format('DD/MM/YYYY')
                            )}
                        </Text> 
                        <Paragraph ellipsis={{ rows: 2 }} className="post-card-excerpt"> 
                          {p.excerpt} 
                        </Paragraph> 
                      </> 
                    } 
                  /> 
                </Card> 
              </Col> 
            ))}
          </Row>
          {!reorderMode && totalPosts > POSTS_PER_PAGE && ( 
            <Pagination current={currentPostsPage} total={totalPosts} pageSize={POSTS_PER_PAGE} onChange={handlePostsPageChange} className="dashboard-entity-pagination" showSizeChanger={false} showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} posts`} /> 
          )}
        </>
      ) : ( <Empty description="Nenhum post encontrado para este filtro." style={{marginTop: '30px'}}/> )}
      <Divider/>

      {isAdmin && (
          <>
            <div className="dashboard-section-header">
                <Title level={3} className="section-main-title"><UsergroupAddOutlined /> Gerenciar Usuários</Title>
                <Space> <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={loadingUsers}>Atualizar</Button> <Button type="dashed" icon={<PlusOutlined />} onClick={showAddUserModal}>Novo Usuário</Button> </Space>
            </div>
            {loadingUsers ? <div className="section-loading-spinner"><Spin /></div> :
            errorUsers ? <Alert className="section-error-alert" message="Erro ao Carregar Usuários" description={errorUsers} type="error" showIcon /> :
            <Table columns={userTableColumns} dataSource={users} rowKey="id" pagination={{ current: currentUsersPage, pageSize: USERS_PER_PAGE, total: totalUsers, onChange: handleUsersPageChange, showTotal: (total, range) => `${range[0]}-${range[1]} de ${total}` }} className="users-table" style={{ marginBottom: '40px' }} scroll={{ x: 700 }} />}
          </>
      )}

      <Modal title={editingPost ? "Editar Post" : "Criar Novo Post"} open={isPostModalVisible} onOk={handlePostModalOk} onCancel={handlePostModalCancel} width={800} destroyOnClose centered footer={[ <Button key="back" onClick={handlePostModalCancel}>Cancelar</Button>, <Button key="submit" type="primary" loading={uploadingImage} onClick={handlePostModalOk}> {editingPost ? "Salvar Alterações" : "Criar Post"} </Button> ]}>
        <PostFormModalContent
            postForm={postForm}
            loadingCategories={loadingCategories}
            managedCategories={managedCategories}
            imageUploadProps={imageUploadProps}
            uploadingImage={uploadingImage}
        />
      </Modal>

      <Modal title={editingCategory ? "Editar Categoria" : "Criar Nova Categoria"} open={isCategoryModalVisible} onOk={handleCategoryModalOk} onCancel={handleCategoryModalCancel} destroyOnClose centered footer={[ <Button key="back" onClick={handleCategoryModalCancel}>Cancelar</Button>, <Button key="submit" type="primary" onClick={handleCategoryModalOk}> {editingCategory ? "Salvar" : "Criar"} </Button> ]}>
        <Form form={categoryForm} layout="vertical" name="categoryForm">
          <Form.Item name="name" label="Nome da Categoria" rules={[{ required: true, message: 'Nome é obrigatório!' }]} onChange={(e) => { if (!editingCategory) { categoryForm.setFieldsValue({ slug: generateSlug(e.target.value) }); }}}><Input /></Form.Item>
          <Form.Item name="slug" label="Slug (URL)" rules={[{ required: true, message: 'Slug é obrigatório!' }]} extra="Gerado automaticamente. Edite se necessário."><Input onChange={(e) => categoryForm.setFieldsValue({ slug: generateSlug(e.target.value) })}/></Form.Item>
          <Form.Item name="description" label="Descrição (opcional)"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {isAdmin && (
        <Modal title={editingUser ? "Editar Usuário" : "Criar Novo Usuário"} open={isUserModalVisible} onOk={handleUserModalOk} onCancel={handleUserModalCancel} destroyOnClose centered footer={[ <Button key="back" onClick={handleUserModalCancel}>Cancelar</Button>, <Button key="submit" type="primary" onClick={handleUserModalOk}> {editingUser ? "Salvar" : "Criar"} </Button> ]}>
            <Form form={userForm} layout="vertical" name="userForm" initialValues={{role: 'user'}}>
                <Form.Item name="name" label="Nome Completo" rules={[{ required: true, message: 'Nome é obrigatório!' }]}><Input prefix={<AntUserOutlined />} placeholder="Nome do usuário" /></Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Email é obrigatório!' }, { type: 'email', message: 'Email inválido!' }]}><Input prefix={<MailOutlined />} placeholder="email@exemplo.com" /></Form.Item>
                <Form.Item name="role" label="Papel (Role)" rules={[{ required: true, message: 'Papel é obrigatório!' }]}>
                    <Select placeholder="Selecione o papel">
                        <Option value="user">Usuário</Option><Option value="author">Autor</Option><Option value="admin">Admin</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="password" label={editingUser ? "Nova Senha (deixe em branco para não alterar)" : "Senha"} rules={ editingUser ? [{ validator: (_, value) => !value || value.length >= 6 ? Promise.resolve() : Promise.reject(new Error('Senha deve ter no mínimo 6 caracteres.'))}] : [{ required: true, message: 'Senha é obrigatória!' }, {min: 6, message: "Senha deve ter no mínimo 6 caracteres."}]} hasFeedback={!!userForm.getFieldValue('password')}>
                    <Input.Password prefix={<LockOutlined />} placeholder={editingUser ? "Nova senha" : "Senha"} />
                </Form.Item>
                {userForm.getFieldValue('password') && (
                  <Form.Item name="confirmPassword" label="Confirme a Senha" dependencies={['password']} hasFeedback rules={[ { required: true, message: 'Confirme a senha!' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) return Promise.resolve(); return Promise.reject(new Error('As senhas não coincidem!')); }, }), ]}>
                      <Input.Password prefix={<LockOutlined />} placeholder="Confirme a senha" />
                  </Form.Item>
                )}
                <Divider>Informações de Perfil</Divider>
                <Form.Item name="profileImageUrl" label="URL da Foto de Perfil" rules={[{ type: 'url', message: 'Insira uma URL válida!' }]}>
                    <Input placeholder="https://exemplo.com/foto.jpg" />
                </Form.Item>
                <Form.Item name="profileUrl" label="URL do Perfil/Site Pessoal" rules={[{ type: 'url', message: 'Insira uma URL válida!' }]}>
                    <Input placeholder="https://meusite.com" />
                </Form.Item>
                <Form.Item name="bio" label="Biografia" rules={[{ max: 500, message: 'A biografia deve ter no máximo 500 caracteres.' }]}>
                    <Input.TextArea rows={3} placeholder="Breve descrição sobre o usuário..." showCount maxLength={500} />
                </Form.Item>
            </Form>
        </Modal>
      )}
    </Content>
  );
};

export default DashboardPage;