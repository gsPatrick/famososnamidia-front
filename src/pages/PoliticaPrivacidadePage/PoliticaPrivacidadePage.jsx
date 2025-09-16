// src/pages/PoliticaPrivacidadePage/PoliticaPrivacidadePage.jsx
import React from 'react';
import { Layout, Typography, Breadcrumb, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined, ShieldOutlined } from '@ant-design/icons';
import './PoliticaPrivacidadePage.css';
const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const PoliticaPrivacidadePage = () => {
const breadcrumbItems = [
{ title: <Link to="/"><HomeOutlined /> Início</Link> },
{ title: <><ShieldOutlined /> Política de Privacidade</> },
];
return (
<Content className="privacy-page-content">
<div className="privacy-container">
<Breadcrumb className="page-breadcrumb" items={breadcrumbItems} />
code
Code
<div className="privacy-header">
      <ShieldOutlined className="privacy-header-icon" />
      <Title level={1} className="page-main-title">Política de Privacidade – Famosos na Mídia</Title>
      <Paragraph className="page-subtitle">
        A sua privacidade é importante para nós. Entenda como tratamos suas informações.
      </Paragraph>
    </div>

    <Divider />

    <div className="privacy-body">
      <Paragraph>
        Esta Política de Privacidade descreve como coletamos, utilizamos e protegemos as informações dos usuários do portal Famosos na Mídia (www.famososnamidia.com.br e www.famososnamidia.com).
      </Paragraph>

      <Title level={3}>1. Informações que coletamos</Title>
      <Paragraph>
        Podemos coletar as seguintes informações:
        <ul>
          <li>Dados fornecidos voluntariamente pelos usuários (como nome, e-mail e mensagens enviadas por formulários de contato).</li>
          <li>Informações de navegação automaticamente coletadas (como endereço IP, navegador, sistema operacional, páginas visitadas e tempo de permanência).</li>
          <li>Dados provenientes de cookies e tecnologias similares, utilizados para melhorar a experiência do usuário.</li>
        </ul>
      </Paragraph>

      <Title level={3}>2. Como usamos suas informações</Title>
      <Paragraph>
        As informações coletadas podem ser utilizadas para:
        <ul>
          <li>Melhorar a navegação e personalizar a experiência no portal.</li>
          <li>Responder dúvidas, solicitações ou mensagens enviadas.</li>
          <li>Enviar conteúdos, notícias, atualizações ou campanhas (quando autorizado pelo usuário).</li>
          <li>Analisar métricas de acesso e engajamento para aprimorar o portal.</li>
        </ul>
      </Paragraph>

      <Title level={3}>3. Cookies</Title>
      <Paragraph>
        O portal utiliza cookies para:
        <ul>
          <li>Memorizar preferências de navegação.</li>
          <li>Coletar estatísticas de acesso (Google Analytics ou ferramentas semelhantes).</li>
          <li>Exibir anúncios personalizados, quando aplicável.</li>
        </ul>
        O usuário pode desativar os cookies no seu navegador, mas isso pode afetar algumas funcionalidades do site.
      </Paragraph>

      <Title level={3}>4. Compartilhamento de informações</Title>
      <Paragraph>
        Não vendemos nem alugamos seus dados pessoais. Podemos compartilhar informações somente:
        <ul>
          <li>Quando exigido por lei ou autoridades competentes.</li>
          <li>Com parceiros e fornecedores de serviços necessários para manter o portal (ex.: hospedagem, análise de tráfego, envio de e-mails).</li>
        </ul>
      </Paragraph>

      <Title level={3}>5. Segurança das informações</Title>
      <Paragraph>
        Adotamos medidas técnicas e organizacionais para proteger os dados contra acessos não autorizados, perda ou alteração. No entanto, nenhum sistema é 100% seguro, e não podemos garantir segurança absoluta.
      </Paragraph>

      <Title level={3}>6. Links externos</Title>
      <Paragraph>
        Nosso portal pode conter links para sites de terceiros. Não nos responsabilizamos pelas práticas de privacidade ou pelo conteúdo desses sites. Recomendamos que o usuário leia as políticas de privacidade de cada site acessado.
      </Paragraph>

      <Title level={3}>7. Direitos do usuário</Title>
      <Paragraph>
        O usuário tem direito de:
        <ul>
          <li>Solicitar acesso aos dados pessoais que coletamos.</li>
          <li>Solicitar correção ou exclusão de seus dados.</li>
          <li>Retirar o consentimento para uso de informações, quando aplicável.</li>
        </ul>
      </Paragraph>

      <Title level={3}>8. Alterações nesta política</Title>
      <Paragraph>
        Podemos atualizar esta Política de Privacidade periodicamente. A data da última atualização estará sempre disponível nesta página.
      </Paragraph>

      <Divider />

      <Title level={3}>9. Contato</Title>
      <Paragraph>
        Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco pelo e-mail:
        <br />
        <Text strong>
          <a href="mailto:contato@famososnamidia.com.br">📩 contato@famososnamidia.com.br</a>
        </Text>
      </Paragraph>
    </div>
  </div>
</Content>
);
};

export default PoliticaPrivacidadePage;
