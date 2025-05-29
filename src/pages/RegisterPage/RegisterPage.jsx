// src/pages/RegisterPage/RegisterPage.jsx
import React, { useState } from 'react';
import { Layout, Form, Input, Button, Typography, Row, Col, Card, message, Spin } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { MailOutlined, LockOutlined, UserOutlined, UserAddOutlined as RegisterIcon } from '@ant-design/icons';
import { post } from '../../services/api';
import './RegisterPage.css';

const { Content } = Layout;
const { Title, Text } = Typography;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm(); // Para poder resetar o form

  const onFinish = async (values) => {
    setLoading(true);
    const { name, email, password } = values; // confirmPassword não é enviado

    try {
      const response = await post('/auth/register', { name, email, password });
      // Backend retorna: { message: 'Usuário registrado com sucesso! Faça login para continuar.' }
      message.success(response.message || 'Cadastro realizado com sucesso! Faça o login para continuar.');
      form.resetFields(); // Limpa o formulário após o sucesso
      navigate('/login'); 
    } catch (error) {
      // error.message virá da nossa função 'post' em api.js
      message.error(error.message || 'Falha no cadastro. Verifique os dados e tente novamente.');
      console.error('Erro no cadastro:', error);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Falha na validação do formulário de cadastro:', errorInfo);
    // Ant Design já mostra mensagens de erro de validação nos campos.
    // message.error('Por favor, corrija os erros no formulário.');
  };

  return (
    <Content className="register-page-content">
      <Row justify="center" align="middle" className="register-row">
        <Col xs={23} sm={20} md={14} lg={10} xl={8}>
          <Card className="register-card" bordered={false}>
            <div className="register-card-header">
              <RegisterIcon className="register-icon-header" />
              <Title level={2} className="register-title">Crie sua Conta</Title>
              <Text type="secondary">Rápido e fácil. Junte-se a nós!</Text>
            </div>

            <Form
              form={form} // Associar form instance
              name="register_form"
              className="register-form"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="name"
                label="Nome Completo"
                rules={[
                    { required: true, message: 'Por favor, insira seu nome completo!' },
                    { min: 3, message: 'O nome deve ter pelo menos 3 caracteres.' },
                    { max: 255, message: 'O nome não pode exceder 255 caracteres.'}
                ]}
              >
                <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Seu nome" autoComplete="name" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Por favor, insira seu email!' },
                  { type: 'email', message: 'O email inserido não é válido!' }
                ]}
              >
                <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="seu@email.com" autoComplete="email"/>
              </Form.Item>

              <Form.Item
                name="password"
                label="Senha"
                rules={[
                    { required: true, message: 'Por favor, insira sua senha!' },
                    { min: 6, message: 'A senha deve ter pelo menos 6 caracteres.' }
                    // Poderia adicionar uma validação de complexidade com regex aqui se desejado
                ]}
                hasFeedback // Mostra ícone de validação no input
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="Crie uma senha (mín. 6 caracteres)"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirme sua Senha"
                dependencies={['password']} // Valida quando o campo 'password' muda
                hasFeedback
                rules={[
                  { required: true, message: 'Por favor, confirme sua senha!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('As duas senhas que você inseriu não coincidem!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="register-form-button" block loading={loading}>
                  {loading ? <Spin spinning={loading} size="small" /> : 'Cadastrar'}
                </Button>
              </Form.Item>

              <div className="register-form-login">
                Já tem uma conta? <Link to="/login">Faça login!</Link>
              </div>
            </Form>
          </Card>
          <Text className="register-page-footer-text">
            Famosos na Mídia © {new Date().getFullYear()}
          </Text>
        </Col>
      </Row>
    </Content>
  );
};

export default RegisterPage;