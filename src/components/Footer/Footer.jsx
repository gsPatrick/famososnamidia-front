// src/components/Footer/Footer.jsx
import React from 'react';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import { Link } from 'react-router-dom';
import {
  FacebookFilled, InstagramOutlined, TwitterOutlined, YoutubeFilled, HeartFilled
} from '@ant-design/icons';
import './Footer.css';

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

const footerCategories = [
  { key: 'celebridades', label: 'Celebridades', slug: 'celebridades' },
  { key: 'musica', label: 'Música', slug: 'musica' },
  { key: 'cinema', label: 'Cinema', slug: 'cinema' },
  { key: 'tv-reality', label: 'TV & Reality', slug: 'tv-&-reality' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter className="app-footer">
      <div className="footer-content">
        <Row gutter={[48, 32]}>
          <Col xs={24} md={8} lg={7} className="footer-column">
            <Title level={3} className="footer-logo">
              <Link to="/">Famosos na Mídia</Link>
            </Title>
            <Text className="footer-tagline">
              Seu portal de notícias sobre o mundo das celebridades e entretenimento.
            </Text>
            <Space size="middle" className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FacebookFilled /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramOutlined /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><TwitterOutlined /></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><YoutubeFilled /></a>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={8} lg={5} offset-lg={1} className="footer-column">
            <Title level={5} className="footer-column-title">Navegação</Title>
            <ul className="footer-links">
              <li><Link to="/">Início</Link></li>
              <li><Link to="/categorias">Todas as Categorias</Link></li>
              {footerCategories.map(cat => (
                <li key={cat.key}><Link to={`/categoria/${cat.slug}`}>{cat.label}</Link></li>
              ))}
            </ul>
          </Col>

          <Col xs={24} sm={12} md={8} lg={5} offset-lg={1} className="footer-column">
             <Title level={5} className="footer-column-title">Institucional</Title>
            <ul className="footer-links">
              <li><Link to="/sobre">Sobre Nós</Link></li>
              <li><Link to="/contato">Contato</Link></li>
              <li><Link to="/politica-de-privacidade">Política de Privacidade</Link></li>
            </ul>
          </Col>
        </Row>
      </div>

      <div className="sub-footer-wrapper">
        <Divider className="sub-footer-divider" />
        <div className="sub-footer">
          <Text className="copyright-text">
            © {currentYear} Famosos na Mídia. Todos os direitos reservados.
          </Text>
          <Text className="credits-text">
            Desenvolvido com <HeartFilled className="credits-heart" /> por
            <a href="https://www.codebypatrick.dev/" target="_blank" rel="noopener noreferrer" className="developer-link">
              Patrick.Developer
            </a>
          </Text>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;