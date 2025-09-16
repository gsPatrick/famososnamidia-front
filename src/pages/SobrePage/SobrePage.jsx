// src/pages/SobrePage/SobrePage.jsx
import React, { useState } from 'react'; // Adicionado useState para controle de loading
import { Layout, Typography, Row, Col, Image, Card, Divider, Breadcrumb, Button, Space, Form, Input, message } from 'antd'; // Importado message
import { Link } from 'react-router-dom';
import axios from 'axios'; // Importado o axios
import {
    HomeOutlined, InfoCircleOutlined, RocketOutlined, BulbOutlined, StarOutlined,
    FieldTimeOutlined, MessageOutlined, EyeOutlined, AppstoreOutlined,
    MailOutlined, WhatsAppOutlined, InstagramOutlined, FacebookOutlined
} from '@ant-design/icons';
import './SobrePage.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

// Diferenciais do Blog (Inalterado)
const diferenciais = [
    { icon: <FieldTimeOutlined />, title: "Atualização Constante", description: "Estamos sempre de olho, trazendo as notícias mais quentes e os últimos acontecimentos do mundo dos famosos em tempo real para você não perder nada." },
    { icon: <EyeOutlined />, title: "Cobertura Exclusiva", description: "Investigamos a fundo para trazer informações exclusivas, entrevistas reveladoras e os bastidores que você não encontra em outro lugar." },
    { icon: <MessageOutlined />, title: "Comunidade Engajada", description: "Valorizamos nossos leitores! Participe, comente e faça parte de uma comunidade apaixonada por entretenimento e cultura pop." },
    { icon: <StarOutlined />, title: "Conteúdo de Qualidade", description: "Nossa equipe se dedica a produzir conteúdo original, bem apurado e escrito de forma envolvente, sempre com responsabilidade e paixão." }
];

const SobrePage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false); // Estado para controlar o carregamento do botão

    const breadcrumbItems = [ { title: <Link to="/"><HomeOutlined /> Início</Link> }, { title: <><InfoCircleOutlined /> Sobre Nós & Contato</> } ];

    // --- INÍCIO DA LÓGICA DE ENVIO DO FORMULÁRIO MODIFICADA ---
    const onFinish = async (values) => {
        setLoading(true); // Ativa o estado de carregamento
        const apiUrl = 'https://geral-resend-famososnamidia.r954jc.easypanel.host/send-contact-email';

        try {
            // Faz a requisição POST para a sua API
            const response = await axios.post(apiUrl, values);

            if (response.data.success) {
                message.success('Mensagem enviada com sucesso! Agradecemos o seu contato.');
                form.resetFields(); // Limpa o formulário
            } else {
                // Caso a API retorne success: false
                throw new Error(response.data.error || 'Ocorreu um erro ao enviar a mensagem.');
            }

        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
            // Verifica se o erro tem uma resposta do servidor para exibir uma mensagem mais específica
            const errorMessage = error.response?.data?.error || 'Não foi possível enviar sua mensagem. Tente novamente mais tarde.';
            message.error(errorMessage);
        } finally {
            setLoading(false); // Desativa o estado de carregamento, independentemente do resultado
        }
    };
    // --- FIM DA LÓGICA DE ENVIO DO FORMULÁRIO MODIFICADA ---

    return (
        <Content className="sobre-page-content">
            {/* Seção Hero (Inalterada) */}
            <div className="sobre-hero-section animated-hero">
                <div className="sobre-hero-overlay"></div>
                <Image preview={false} src="https://placehold.co/1200x450/333344/FFFFFF.png?text=Famosos+na+Mídia+News" alt="Banner Sobre Nós - Famosos na Mídia" className="sobre-hero-image" />
                <div className="sobre-hero-text">
                    <Title level={1} className="sobre-hero-title animate-pop-in">Conheça o Famosos na Mídia</Title>
                    <Paragraph className="sobre-hero-subtitle animate-slide-up-delay-1">Seu portal definitivo para as últimas notícias, fofocas quentes e tudo sobre o universo das celebridades e entretenimento.</Paragraph>
                </div>
            </div>

            <div className="sobre-main-section">
                <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} />

                {/* Seção Intro (Inalterada) */}
                <section className="sobre-section intro-section animated-section">
                    <Row gutter={[48, 32]} align="middle">
                        <Col xs={24} md={12} className="animate-slide-left">
                            <Title level={2} className="section-title">Nossa História Apaixonante</Title>
                            <Paragraph>Bem-vindo ao <strong>Famosos na Mídia</strong>! Nascemos da paixão efervescente pela cultura pop e do desejo ardente de criar um universo onde fãs e entusiastas pudessem se conectar com o brilho e os bastidores do entretenimento.</Paragraph>
                            <Paragraph>Desde o primeiro clique, nossa missão transcendeu o comum: mergulhamos fundo para trazer não apenas notícias, mas narrativas envolventes, análises perspicazes e uma cobertura que captura a essência vibrante do mundo das estrelas. Acreditamos que informação e diversão podem, e devem, caminhar juntas.</Paragraph>
                        </Col>
                        <Col xs={24} md={12} className="animate-slide-right"><Image preview={false} src="https://placehold.co/550x400/5E35B1/FFFFFF.png?text=Nossa+Vibe" alt="Ilustração da jornada do blog" className="section-image intro-image-styled" /></Col>
                    </Row>
                </section>

                <Divider className="fancy-divider" />

                {/* Seção Missão, Visão e Valores (Inalterada) */}
                <section className="sobre-section mission-vision-section animated-section">
                    <Row gutter={[32, 32]}>
                        <Col xs={24} md={12} lg={8} className="animate-fade-in-up"><Card bordered={false} className="info-card styled-info-card"><RocketOutlined className="info-card-icon gradient-icon" /><Title level={3}>Nossa Missão</Title><Paragraph>Incendiar a curiosidade e satisfazer a sede de informação dos nossos leitores com conteúdo exclusivo, ágil e eticamente apurado sobre o fascinante universo do entretenimento.</Paragraph></Card></Col>
                        <Col xs={24} md={12} lg={8} className="animate-fade-in-up delay-animation-1"><Card bordered={false} className="info-card styled-info-card"><BulbOutlined className="info-card-icon gradient-icon" /><Title level={3}>Nossa Visão</Title><Paragraph>Ser a constelação mais brilhante no firmamento de notícias de entretenimento, reconhecidos pela nossa originalidade, interatividade e pela paixão que transmitimos em cada palavra.</Paragraph></Card></Col>
                        <Col xs={24} md={24} lg={8} className="animate-fade-in-up delay-animation-2"><Card bordered={false} className="info-card styled-info-card"><StarOutlined className="info-card-icon gradient-icon" /><Title level={3}>Nossos Valores</Title><Paragraph><strong>Paixão</strong> contagiante, <strong>Respeito</strong> inabalável, <strong>Inovação</strong> constante, <strong>Transparência</strong> cristalina e uma <strong>Comunidade</strong> vibrante.</Paragraph></Card></Col>
                    </Row>
                </section>

                <Divider className="fancy-divider" />

                {/* Seção Diferenciais (Inalterada) */}
                <section className="sobre-section diferenciais-section animated-section">
                    <Title level={2} className="section-title text-center animate-pop-in">Por Que Escolher o Famosos na Mídia?</Title>
                    <Paragraph className="text-center section-subtitle animate-slide-up-delay-1">Descubra o que nos torna únicos no universo do entretenimento.</Paragraph>
                    <Row gutter={[24, 24]}>{diferenciais.map((item, index) => (<Col xs={24} sm={12} md={6} key={index} className={`animate-fade-in-up delay-animation-${index}`}><Card hoverable className="diferencial-card"><div className="diferencial-card-icon-wrapper">{item.icon}</div><Title level={4} className="diferencial-card-title">{item.title}</Title><Paragraph className="diferencial-card-description">{item.description}</Paragraph></Card></Col>))}</Row>
                </section>

                <Divider className="fancy-divider" />
                
                {/* Seção de Contato com formulário integrado */}
                <section className="sobre-section contato-section animated-section">
                    <Title level={2} className="section-title text-center animate-pop-in">📩 Fale Conosco</Title>
                    <Paragraph className="text-center section-subtitle animate-slide-up-delay-1">
                        Quer entrar em contato com a equipe do Famosos na Mídia? <br/> Preencha o formulário abaixo ou utilize nossos canais diretos. Vamos responder o mais rápido possível!
                    </Paragraph>
                    <Row gutter={[48, 48]} justify="center" align="top">
                        <Col xs={24} md={14} lg={12} className="contato-form-wrapper animate-fade-in-up delay-animation-1">
                            <Form form={form} layout="vertical" onFinish={onFinish} name="contato_form">
                                <Form.Item name="name" label="Nome" rules={[{ required: true, message: 'Por favor, insira seu nome!' }]}>
                                    <Input placeholder="Seu nome completo" size="large" />
                                </Form.Item>
                                <Form.Item name="email" label="E-mail" rules={[{ required: true, message: 'Por favor, insira um e-mail válido!', type: 'email' }]}>
                                    <Input placeholder="seu.email@exemplo.com" size="large" />
                                </Form.Item>
                                <Form.Item name="subject" label="Assunto" rules={[{ required: true, message: 'Por favor, insira o assunto!' }]}>
                                    <Input placeholder="Sobre o que você gostaria de falar?" size="large" />
                                </Form.Item>
                                <Form.Item name="message" label="Mensagem" rules={[{ required: true, message: 'Por favor, escreva sua mensagem!' }]}>
                                    <Input.TextArea rows={5} placeholder="Digite sua mensagem aqui..." />
                                </Form.Item>
                                <Form.Item>
                                    {/* Botão agora usa o estado de 'loading' */}
                                    <Button type="primary" htmlType="submit" size="large" block className="cta-button pulse-button" loading={loading}>
                                        {loading ? 'Enviando...' : 'Enviar Mensagem'}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Col>
                        <Col xs={24} md={10} lg={8} className="contato-details-wrapper animate-fade-in-up delay-animation-2">
                            <Title level={4}>Outras formas de contato</Title>
                            <ul className="contato-details-list">
                                <li><MailOutlined /> <strong>E-mail:</strong> <a href="mailto:famososnamidia@gmail.com.br">famososnamidia@gmail.com.br</a></li>
                                <li><WhatsAppOutlined /> <strong>WhatsApp:</strong> <a href="https://wa.me/5511933350598" target="_blank" rel="noopener noreferrer">(11) 93335-0598</a></li>
                            </ul>
                            <Title level={4} style={{marginTop: '30px'}}>Redes Sociais</Title>
                            <Space size="large" className="contato-social-icons">
                                <a href="https://instagram.com/famososnamidia" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramOutlined /></a>
                                <a href="https://facebook.com/FamososnaMídia" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FacebookOutlined /></a>
                            </Space>
                            <Divider />
                            <Title level={5}>Observações Importantes</Title>
                            <Text type="secondary">
                                Utilizamos os dados enviados apenas para responder a sua mensagem, conforme descrito em nossa <Link to="/politica-de-privacidade">Política de Privacidade</Link>.
                                O tempo de resposta pode variar conforme a demanda.
                            </Text>
                        </Col>
                    </Row>
                </section>
            </div>
        </Content>
    );
};

export default SobrePage;