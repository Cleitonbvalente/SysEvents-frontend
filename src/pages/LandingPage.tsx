import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import EventoCard from '../components/EventoCard';
import { Evento } from '../types';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [contador, setContador] = useState(0);
  const [nome, setNome] = useState('');

  const tituloPagina = `🎉 SysEvents - ${contador} eventos cadastrados`;

  const listaEventos = eventos.map((evento) => (
    <EventoCard key={evento.id} evento={evento} />
  ));

  const handleContadorClick = () => {
    setContador(contador + 1);
  };

  const handleNomeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNome(event.target.value);
  };

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://sysevents-1.onrender.com/api/eventos');
        const data = await response.json();
        if (data.success) {
          setEventos(data.data);
        }
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  return (
    <div className="landing-page">
      <Header />
      
      <main>
        <section id="home" className="hero">
          <div className="hero-content">
            <h1>{tituloPagina}</h1>
            <p>Descubra os melhores eventos de tecnologia, cultura e entretenimento.</p>
            <button className="btn-primary">Ver eventos</button>
          </div>
        </section>

        <section id="eventos" className="eventos">
          <h2>Eventos em Destaque</h2>
          
          <div className="contador-section">
            <p>Clique no botão para aumentar o contador:</p>
            <button onClick={handleContadorClick} className="btn-contador">
              Contador: {contador}
            </button>
          </div>

          <div className="nome-section">
            <p>Digite seu nome:</p>
            <input 
              type="text" 
              value={nome} 
              onChange={handleNomeChange}
              placeholder="Seu nome"
              className="input-nome"
            />
            {nome && <p>Olá, <strong>{nome}</strong>! Bem-vindo ao SysEvents!</p>}
          </div>

          {loading ? (
            <div className="loading">Carregando eventos...</div>
          ) : (
            <div className="eventos-grid">
              {listaEventos.length > 0 ? listaEventos : (
                <p>Nenhum evento encontrado.</p>
              )}
            </div>
          )}
        </section>

        <section id="palestrantes" className="palestrantes">
          <h2>Palestrantes Confirmados</h2>
          <div className="palestrantes-grid">
            <div className="palestrante-card">
              <div className="avatar">👩‍💻</div>
              <h3>Maria Silva</h3>
              <p>Especialista em React e Node.js</p>
            </div>
            <div className="palestrante-card">
              <div className="avatar">👨‍💻</div>
              <h3>João Santos</h3>
              <p>Arquiteto de Software</p>
            </div>
            <div className="palestrante-card">
              <div className="avatar">👩‍🎨</div>
              <h3>Ana Oliveira</h3>
              <p>UX/UI Designer</p>
            </div>
          </div>
        </section>

        <section id="contato" className="contato">
          <h2>Fale Conosco</h2>
          <form className="contato-form">
            <input type="text" placeholder="Seu nome" />
            <input type="email" placeholder="Seu e-mail" />
            <textarea placeholder="Sua mensagem" rows={5}></textarea>
            <button type="submit">Enviar mensagem</button>
          </form>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2026 SysEvents - Sistema de Gestão de Eventos</p>
        <p>Desenvolvido para a disciplina de Desenvolvimento Web</p>
      </footer>
    </div>
  );
};

export default LandingPage;
