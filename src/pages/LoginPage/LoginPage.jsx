// src/pages/LoginPage/LoginPage.jsx
import React, { useState } from 'react';
import { Layout, Form, Input, Button, Checkbox, Typography, Row, Col, Card, message, Spin } from 'antd';
import { Link } from 'react-router-dom';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { post } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

const { Content } = Layout;
const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    const { email, password } = values;

    try {
      const response = await post('/auth/login', { email, password });
      // response = { user: { id, name, email, role, createdAt, updatedAt }, token: "..." }
      if (response.user && response.token) {
        login(response.user, response.token); // AuthContext lida com localStorage e navegação
        // message.success pode ser adicionada aqui ou no AuthContext se desejar feedback visual imediato
      } else {
        // Isso não deveria acontecer se a API estiver correta, mas é uma salvaguarda
        throw new Error("Resposta inválida do servidor de autenticação.");
      }
    } catch (error) {
      // error.message virá da nossa função 'post' em api.js, que por sua vez pega de error.response.data.message do backend
      message.error(error.message || 'Email ou senha inválidos. Tente novamente.');
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Falha na validação do formulário de login:', errorInfo);
    // Ant Design já mostra mensagens de erro de validação nos campos.
    // message.error('Por favor, preencha todos os campos corretamente.');
  };

  return (
    <Content className="login-page-content">
      <Row justify="center" align="middle" className="login-row">
        <Col xs={23} sm={18} md={12} lg={8} xl={7}>
          <Card className="login-card" bordered={false}>
            <div className="login-card-header">
              <UserOutlined className="login-icon-header" />
              <Title level={2} className="login-title">Bem-vindo de Volta!</Title>
              <Text type="secondary">Acesse sua conta para continuar.</Text>
            </div>

            <Form
              name="login_form"
              className="login-form"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Por favor, insira seu email!' },
                  { type: 'email', message: 'O email inserido não é válido!' }
                ]}
              >
                <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" autoComplete="email" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="Senha"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item>
                <Row justify="space-between">
                  <Col>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox>Lembrar-me</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col>
                    <Link className="login-form-forgot" to="/esqueceu-senha"> {/* Link para funcionalidade futura */}
                      Esqueceu a senha?
                    </Link>
                  </Col>
                </Row>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button" block loading={loading}>
                  {loading ? <Spin spinning={loading} size="small" /> : 'Entrar'}
                </Button>
              </Form.Item>

              <div className="login-form-register">
                Não tem uma conta? <Link to="/cadastro">Cadastre-se agora!</Link>
              </div>
            </Form>
          </Card>
          <Text className="login-page-footer-text">
            Famosos na Mídia © {new Date().getFullYear()}
          </Text>
        </Col>
      </Row>
    </Content>
  );
};

export default LoginPage;