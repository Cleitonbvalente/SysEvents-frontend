export interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  local: string;
  status: string;
  criadoPor: number;
  createdAt: string;
  updatedAt: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: string;
  avatar?: string;
  bio?: string;
  telefone?: string;
  endereco?: string;
}
