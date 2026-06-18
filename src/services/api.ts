import { Usuario } from '../types';

const BASE_URL = 'https://sysevents-1.onrender.com/api';

export interface RegistrarPayload {
  nome: string;
  email: string;
  senha: string;
  papel: string;
  avatar?: string;
  bio?: string;
  telefone?: string;
  endereco?: string;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    usuario?: Usuario;
  };
}

export async function registrarUsuario(payload: RegistrarPayload): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/usuarios/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function loginUsuario(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function buscarPerfilUsuario(): Promise<{ success: boolean; data?: Usuario }> {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/me`, {
      headers: headersAutenticados() as Record<string, string>,
    });
    if (!response.ok) return { success: false };
    return response.json();
  } catch {
    return { success: false };
  }
}

export async function buscarPalestrantes(): Promise<{ success: boolean; data?: Usuario[] }> {
  try {
    const token = obterToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(`${BASE_URL}/usuarios/palestrantes`, { headers });
    if (!response.ok) return { success: false, data: [] };
    return response.json();
  } catch {
    return { success: false, data: [] };
  }
}

// ── Token ──────────────────────────────────────────

export function salvarToken(token: string): void {
  localStorage.setItem('sysevents_token', token);
}

export function obterToken(): string | null {
  return localStorage.getItem('sysevents_token');
}

export function removerToken(): void {
  localStorage.removeItem('sysevents_token');
}

// ── Dados do usuário logado ────────────────────────

export function salvarDadosUsuario(usuario: Usuario): void {
  localStorage.setItem('sysevents_usuario', JSON.stringify(usuario));
}

export function obterDadosUsuario(): Usuario | null {
  const dados = localStorage.getItem('sysevents_usuario');
  try {
    return dados ? (JSON.parse(dados) as Usuario) : null;
  } catch {
    return null;
  }
}

export function removerDadosUsuario(): void {
  localStorage.removeItem('sysevents_usuario');
}

// ── Headers autenticados ───────────────────────────

export function headersAutenticados(): HeadersInit {
  const token = obterToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
