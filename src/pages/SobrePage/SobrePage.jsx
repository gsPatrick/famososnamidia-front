// src/pages/SobrePage/SobrePage.jsx
import React from 'react';
import { Layout, Typography, Row, Col, Image, Card, Divider, Breadcrumb, Button, Space } from 'antd';
import { Link } from 'react-router-dom';
import {
  HomeOutlined, InfoCircleOutlined, RocketOutlined, BulbOutlined, StarOutlined, // Ícone para diferenciais
  FieldTimeOutlined, // Ícone para atualização constante
  MessageOutlined, // Ícone para comunidade
  EyeOutlined, // Ícone para cobertura exclusiva
  AppstoreOutlined // Para o botão CTA
} from '@ant-design/icons';
import './SobrePage.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

// Diferenciais do Blog
const diferenciais = [
  {
    icon: <FieldTimeOutlined />,
    title: "Atualização Constante",
    description: "Estamos sempre de olho, trazendo as notícias mais quentes e os últimos acontecimentos do mundo dos famosos em tempo real para você não perder nada.",
  },
  {
    icon: <EyeOutlined />,
    title: "Cobertura Exclusiva",
    description: "Investigamos a fundo para trazer informações exclusivas, entrevistas reveladoras e os bastidores que você não encontra em outro lugar.",
  },
  {
    icon: <MessageOutlined />,
    title: "Comunidade Engajada",
    description: "Valorizamos nossos leitores! Participe, comente e faça parte de uma comunidade apaixonada por entretenimento e cultura pop.",
  },
  {
    icon: <StarOutlined />,
    title: "Conteúdo de Qualidade",
    description: "Nossa equipe se dedica a produzir conteúdo original, bem apurado e escrito de forma envolvente, sempre com responsabilidade e paixão.",
  }
];

const SobrePage = () => {
  const breadcrumbItems = [
    { title: <Link to="/"><HomeOutlined /> Início</Link> },
    { title: <><InfoCircleOutlined /> Sobre Nós</> },
  ];

  return (
    <Content className="sobre-page-content">
      <div className="sobre-hero-section animated-hero">
        <div className="sobre-hero-overlay"></div>
        <Image
          preview={false}
          src="https://placehold.co/1200x450/333344/FFFFFF.png?text=Famosos+na+Mídia+News" // Imagem de hero mais dinâmica
          alt="Banner Sobre Nós - Famosos na Mídia"
          className="sobre-hero-image"
        />
        <div className="sobre-hero-text">
          <Title level={1} className="sobre-hero-title animate-pop-in">Conheça o Famosos na Mídia</Title>
          <Paragraph className="sobre-hero-subtitle animate-slide-up-delay-1">
            Seu portal definitivo para as últimas notícias, fofocas quentes e tudo sobre o universo das celebridades e entretenimento.
          </Paragraph>
        </div>
      </div>

      <div className="sobre-main-section">
        <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} />

        <section className="sobre-section intro-section animated-section">
          <Row gutter={[48, 32]} align="middle"> {/* Aumentado gutter */}
            <Col xs={24} md={12} className="animate-slide-left">
              <Title level={2} className="section-title">Nossa História Apaixonante</Title>
              <Paragraph>
                Bem-vindo ao <strong>Famosos na Mídia</strong>! Nascemos da paixão efervescente pela cultura pop e do desejo ardente de criar um universo onde fãs e entusiastas pudessem se conectar com o brilho e os bastidores do entretenimento.
              </Paragraph>
              <Paragraph>
                Desde o primeiro clique, nossa missão transcendeu o comum: mergulhamos fundo para trazer não apenas notícias, mas narrativas envolventes, análises perspicazes e uma cobertura que captura a essência vibrante do mundo das estrelas. Acreditamos que informação e diversão podem, e devem, caminhar juntas.
              </Paragraph>
            </Col>
            <Col xs={24} md={12} className="animate-slide-right">
              <Image
                preview={false}
                src="https://placehold.co/550x400/5E35B1/FFFFFF.png?text=Nossa+Vibe" // Imagem mais vibrante
                alt="Ilustração da jornada do blog"
                className="section-image intro-image-styled"
              />
            </Col>
          </Row>
        </section>

        <Divider className="fancy-divider" />

        <section className="sobre-section mission-vision-section animated-section">
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12} lg={8} className="animate-fade-in-up">
              <Card bordered={false} className="info-card styled-info-card">
                <RocketOutlined className="info-card-icon gradient-icon" />
                <Title level={3}>Nossa Missão</Title>
                <Paragraph>
                  Incendiar a curiosidade e satisfazer a sede de informação dos nossos leitores com conteúdo exclusivo, ágil e eticamente apurado sobre o fascinante universo do entretenimento.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={8} className="animate-fade-in-up delay-animation-1">
              <Card bordered={false} className="info-card styled-info-card">
                <BulbOutlined className="info-card-icon gradient-icon" />
                <Title level={3}>Nossa Visão</Title>
                <Paragraph>
                  Ser a constelação mais brilhante no firmamento de notícias de entretenimento, reconhecidos pela nossa originalidade, interatividade e pela paixão que transmitimos em cada palavra.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={24} lg={8} className="animate-fade-in-up delay-animation-2"> {/* Ocupa largura total em md */}
              <Card bordered={false} className="info-card styled-info-card">
                <StarOutlined className="info-card-icon gradient-icon" />
                <Title level={3}>Nossos Valores</Title>
                <Paragraph>
                  <strong>Paixão</strong> contagiante, <strong>Respeito</strong> inabalável, <strong>Inovação</strong> constante, <strong>Transparência</strong> cristalina e uma <strong>Comunidade</strong> vibrante.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </section>

        <Divider className="fancy-divider" />

        {/* Nova Seção: Nossos Diferenciais */}
        <section className="sobre-section diferenciais-section animated-section">
          <Title level={2} className="section-title text-center animate-pop-in">Por Que Escolher o Famosos na Mídia?</Title>
          <Paragraph className="text-center section-subtitle animate-slide-up-delay-1">
            Descubra o que nos torna únicos no universo do entretenimento.
          </Paragraph>
          <Row gutter={[24, 24]}>
            {diferenciais.map((item, index) => (
              <Col xs={24} sm={12} md={6} key={index} className={`animate-fade-in-up delay-animation-${index}`}>
                <Card hoverable className="diferencial-card">
                  <div className="diferencial-card-icon-wrapper">
                    {item.icon}
                  </div>
                  <Title level={4} className="diferencial-card-title">{item.title}</Title>
                  <Paragraph className="diferencial-card-description">
                    {item.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <Divider className="fancy-divider" />

        <section className="sobre-section cta-section text-center animated-section">
            <Title level={3} className="animate-pop-in">Pronto para Mergulhar no Mundo dos Famosos?</Title>
            <Paragraph className="animate-slide-up-delay-1">
                Explore nossas categorias, leia os posts mais recentes e junte-se à nossa comunidade!
            </Paragraph>
            <Space size="large" wrap className="animate-fade-in-up delay-animation-2">
                <Link to="/categorias">
                    <Button type="primary" size="large" icon={<AppstoreOutlined />} className="cta-button pulse-button">
                        Ver Todas as Categorias
                    </Button>
                </Link>
                <Link to="/">
                    <Button size="large" className="cta-button">
                        Ir para a Página Inicial
                    </Button>
                </Link>
            </Space>
        </section>

      </div>
    </Content>
  );
};

export default SobrePage;