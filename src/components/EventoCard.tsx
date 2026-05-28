import React from 'react';
import { Evento } from '../types';
import './EventoCard.css';

interface EventoCardProps {
  evento: Evento;
}

const EventoCard: React.FC<EventoCardProps> = ({ evento }) => {
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <div className="evento-card">
      <h3>{evento.titulo}</h3>
      <p className="descricao">{evento.descricao.substring(0, 100)}...</p>
      <div className="info">
        <span>📅 {formatarData(evento.dataInicio)}</span>
        <span>📍 {evento.local}</span>
      </div>
      <button className="btn-saiba-mais">Saiba mais</button>
    </div>
  );
};

export default EventoCard;
