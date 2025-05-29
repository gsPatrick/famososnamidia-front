// src/components/Footer/Footer.jsx
import React from 'react';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import { Link } from 'react-router-dom';
import {
  FacebookFilled,
  InstagramOutlined,
  TwitterOutlined,
  YoutubeFilled,
  HeartFilled
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
        <Row gutter={[32, 32]}>
          {/* Coluna 1: Logo, Tagline, Social */}
          <Col xs={24} sm={24} md={8} lg={7} className="footer-column">
            <Title level={3} className="footer-logo">
              <Link to="/">Famosos na Mídia</Link>
            </Title>
            <Text className="footer-tagline">
              Seu portal de notícias sobre o mundo das celebridades e entretenimento.
            </Text>
            <Space size="middle" className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FacebookFilled />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramOutlined />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <TwitterOutlined />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <YoutubeFilled />
              </a>
            </Space>
          </Col>

          {/* Coluna 2: Navegação */}
          <Col xs={24} sm={12} md={8} lg={6} offset={lg => lg > 0 ? 1 : 0} className="footer-column">
            <Title level={5} className="footer-column-title">Navegação</Title>
            <ul className="footer-links">
              <li><Link to="/">Início</Link></li>
              <li><Link to="/noticias">Notícias</Link></li>
              {footerCategories.slice(0, 3).map(cat => (
                <li key={cat.key}><Link to={`/categoria/${cat.slug}`}>{cat.label}</Link></li>
              ))}
            </ul>
          </Col>

          {/* Coluna 3: Categorias (continuação) / Institucional */}
          <Col xs={24} sm={12} md={8} lg={6} offset={lg => lg > 0 ? 1 : 0} className="footer-column">
             <Title level={5} className="footer-column-title">Mais Categorias</Title>
             <ul className="footer-links">
                {footerCategories.slice(3).map(cat => (
                    <li key={cat.key}><Link to={`/categoria/${cat.slug}`}>{cat.label}</Link></li>
                ))}
                {footerCategories.length === 0 && <li><Text type="secondary">Em breve...</Text></li>}
             </ul>
             <Title level={5} className="footer-column-title" style={{marginTop: '20px'}}>Institucional</Title>
            <ul className="footer-links">
              <li><Link to="/sobre">Sobre Nós</Link></li>
              <li><Link to="/contato">Contato</Link></li>
              <li><Link to="/politica-de-privacidade">Política de Privacidade</Link></li>
            </ul>
          </Col>
        </Row>
      </div>

      <Divider className="sub-footer-divider" />

      <div className="sub-footer">
        <Text className="copyright-text">
          © {currentYear} Famosos na Mídia. Todos os direitos reservados.
        </Text>
        <Text className="credits-text">
          Desenvolvido com <HeartFilled className="credits-heart" /> por {/* <<< Ícone de coração agora tem classe */}
          <a href="https://www.codebypatrick.dev/" target="_blank" rel="noopener noreferrer" className="developer-link">
            Patrick.Developer
          </a>
        </Text>
      </div>
    </AntFooter>
  );
};

export default Footer;