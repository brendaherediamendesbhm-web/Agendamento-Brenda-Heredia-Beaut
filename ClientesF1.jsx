import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// VITE_* ficam disponíveis no navegador: use APENAS a URL e a Publishable Key.
// NUNCA configure a Secret Key ou service_role aqui.
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_KEY = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
).trim();
const configurado = /^https:\/\/.+\.supabase\.co\/?$/.test(SUPABASE_URL) && !!SUPABASE_KEY;
export const supabase = configurado ? createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
}) : null;
export function encerrarSessaoF1() {
  if (supabase) return supabase.auth.signOut().catch(() => {});
  return Promise.resolve();
}
const DEDOS = ['Polegar', 'Indicador', 'Médio', 'Anelar', 'Mindinho'];
const COLUNAS = {
  esquerda: ['esq_polegar', 'esq_indicador', 'esq_medio', 'esq_anelar', 'esq_mindinho'],
  direita: ['dir_polegar', 'dir_indicador', 'dir_medio', 'dir_anelar', 'dir_mindinho'],
};
const NOVA_FICHA = {
  nome: '', whatsapp: '', observacoes_gerais: '', cores_preferidas: '', decoracoes_evitar: '',
  esquerda: ['', '', '', '', ''], direita: ['', '', '', '', ''],
};
const input = 'w-full rounded-xl border border-[#e5cdcf] bg-white px-3 py-2.5 text-sm text-[#69454e] outline-none focus:border-[#ac7582]';
const legenda = 'mb-1 block text-xs font-semibold text-[#8a5763]';
function copiarFichaInicial() {
  return { ...NOVA_FICHA, esquerda: [...NOVA_FICHA.esquerda], direita: [...NOVA_FICHA.direita] };
}
function fichaDoBanco(cliente) {
  return {
    nome: cliente.nome || '', whatsapp: cliente.whatsapp || '',
    observacoes_gerais: cliente.observacoes_gerais || '',
    cores_preferidas: cliente.cores_preferidas || '',
    decoracoes_evitar: cliente.decoracoes_evitar || '',
    esquerda: COLUNAS.esquerda.map(c => cliente[c] || ''),
    direita: COLUNAS.direita.map(c => cliente[c] || ''),
  };
}
function whatsappLink(numero) {
  let d = String(numero || '').replace(/\D/g, '');
  if (d.length === 10 || d.length === 11) d = `55${d}`;
  return d.length >= 12 && d.length <= 13 ? `https://wa.me/${d}` : null;
}
function CamposMao({ lado, numeros, atualizar }) {
  return (
    <fieldset className="rounded-2xl border border-[#edd9de] bg-[#fff9fa] p-3">
      <legend className="px-2 font-semibold text-[#945767]">Mão {lado}</legend>
      <p className="mb-3 text-xs text-[#977985]">Do polegar (dedão) ao mindinho. Aceita números e códigos como K14.</p>
      <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
        {DEDOS.map((dedo, i) => (
          <label key={dedo} className="min-w-0 text-center">
            <span className="mb-1 block text-[10px] text-[#8e6a73] sm:text-xs">{dedo}</span>
            <input
              aria-label={`Mão ${lado}, ${dedo}`}
              className={`${input} min-w-0 px-1 text-center font-semibold`}
              maxLength={12}
              placeholder="—"
              value={numeros[i]}
              onChange={(e) => atualizar(numeros.map((n, j) => j === i ? e.target.value.toUpperCase() : n))}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
function ResumoMao({ lado, cliente }) {
  return (
    <div className="rounded-xl bg-[#fff2f5] p-3">
      <p className="mb-2 text-xs font-bold text-[#945767]">Mão {lado}</p>
      <div className="grid grid-cols-5 gap-1">
        {DEDOS.map((dedo, i) => (
          <div key={dedo} className="min-w-0 text-center">
            <span className="block text-[10px] text-[#8e6a73]">{dedo.slice(0, 3)}</span>
            <span className="block break-all rounded bg-white p-1 text-xs font-semibold text-[#7c4957]">
              {cliente[COLUNAS[lado][i]] || '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Renderize este componente SOMENTE dentro da área profissional do App.jsx.
// Autenticação própria + RLS são obrigatórias para proteger os dados das clientes.
export default function ClientesF1({ usuario }) {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [ficha, setFicha] = useState(copiarFichaInicial);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const carregar = useCallback(async () => {
    if (!usuario || !supabase) return;
    setOcupado(true);
    const { data, error } = await supabase.from('clientes_f1')
      .select('*').eq('user_id', usuario.id).order('nome', { ascending: true });
    if (error) setErro(`Não foi possível carregar fichas: ${error.message}`);
    else { setClientes(data || []); setErro(''); }
    setOcupado(false);
  }, [usuario]);
  useEffect(() => { if (usuario) carregar(); else setClientes([]); }, [usuario, carregar]);

  const filtradas = useMemo(() => clientes.filter(c =>
    `${c.nome} ${c.whatsapp || ''}`.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR'))
  ), [clientes, busca]);

  function editar(cliente) {
    setFicha(fichaDoBanco(cliente)); setEditandoId(cliente.id); setErro(''); setMensagem('');
  }
  function nova() {
    setFicha(copiarFichaInicial()); setEditandoId('novo'); setErro(''); setMensagem('');
  }
  async function salvar(e) {
    e.preventDefault();
    if (!usuario || !ficha.nome.trim()) { setErro('Informe o nome da cliente.'); return; }
    setOcupado(true); setErro(''); setMensagem('');
    const dados = {
      nome: ficha.nome.trim().slice(0, 150),
      whatsapp: ficha.whatsapp.trim().slice(0, 30),
      observacoes_gerais: ficha.observacoes_gerais.trim().slice(0, 2000),
      cores_preferidas: ficha.cores_preferidas.trim().slice(0, 500),
      decoracoes_evitar: ficha.decoracoes_evitar.trim().slice(0, 500),
      ...Object.fromEntries(COLUNAS.esquerda.map((c, i) => [c, ficha.esquerda[i].trim()])),
      ...Object.fromEntries(COLUNAS.direita.map((c, i) => [c, ficha.direita[i].trim()])),
    };
    const consulta = editandoId === 'novo'
      ? supabase.from('clientes_f1').insert({ ...dados, user_id: usuario.id })
      : supabase.from('clientes_f1').update(dados).eq('id', editandoId).eq('user_id', usuario.id);
    const { error } = await consulta.select('id').single();
    setOcupado(false);
    if (error) { setErro(`Não foi possível salvar: ${error.message}`); return; }
    setEditandoId(null); setMensagem('Ficha salva com sucesso.'); await carregar();
  }
  async function excluir(cliente) {
    if (!window.confirm(`Excluir definitivamente a ficha de ${cliente.nome}?`)) return;
    setOcupado(true); setErro(''); setMensagem('');
    const { error } = await supabase.from('clientes_f1').delete()
      .eq('id', cliente.id).eq('user_id', usuario.id);
    setOcupado(false);
    if (error) setErro(`Não foi possível excluir: ${error.message}`);
    else { setMensagem('Ficha excluída.'); await carregar(); }
  }
  return (
    <section className="rounded-2xl border border-[#eddae0] bg-white p-4 shadow-sm sm:p-6" aria-label="Minhas clientes: molde F1">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-[#82495b]">Minhas Clientes</h2>
          <p className="text-xs text-[#987682]">Cadastro particular e numeração do molde F1</p>
        </div>
      </div>
      {!configurado && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Conexão pendente: configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel e republique.</p>}
      {configurado && !usuario && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Sessão encerrada. Entre novamente pelo Painel Profissional.</p>}
      {erro && <p role="alert" className="my-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{erro}</p>}
      {mensagem && <p role="status" className="my-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">{mensagem}</p>}
      {usuario && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <input aria-label="Buscar cliente" placeholder="Buscar cliente por nome ou telefone..." value={busca} onChange={e => setBusca(e.target.value)} className={`${input} min-w-[180px] flex-1`}/>
            <button onClick={nova} className="rounded-xl bg-[#ab7284] px-4 py-2.5 text-sm font-semibold text-white">+ Nova cliente</button>
          </div>
          {editandoId && (
            <form onSubmit={salvar} className="space-y-4 rounded-xl border border-[#edd9de] bg-[#fffafb] p-4">
              <div className="flex items-center justify-between"><h3 className="font-bold text-[#82495b]">{editandoId === 'novo' ? 'Cadastrar cliente' : 'Editar ficha'}</h3><button type="button" onClick={() => setEditandoId(null)}>Fechar ✕</button></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label><span className={legenda}>Nome *</span><input required maxLength={150} className={input} value={ficha.nome} onChange={e => setFicha({...ficha, nome: e.target.value})}/></label>
                <label><span className={legenda}>WhatsApp (opcional)</span><input type="tel" maxLength={30} className={input} placeholder="(67) 99999-9999" value={ficha.whatsapp} onChange={e => setFicha({...ficha, whatsapp: e.target.value})}/></label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label><span className={legenda}>Cores favoritas</span><textarea rows={2} maxLength={500} className={input} value={ficha.cores_preferidas} onChange={e => setFicha({...ficha, cores_preferidas: e.target.value})}/></label>
                <label><span className={legenda}>Decorações a evitar</span><textarea rows={2} maxLength={500} className={input} value={ficha.decoracoes_evitar} onChange={e => setFicha({...ficha, decoracoes_evitar: e.target.value})}/></label>
              </div>
              <label className="block"><span className={legenda}>Observações gerais</span><textarea rows={3} maxLength={2000} className={input} placeholder="Preferências, cuidados e detalhes importantes para o atendimento" value={ficha.observacoes_gerais} onChange={e => setFicha({...ficha, observacoes_gerais: e.target.value})}/></label>
              <CamposMao lado="esquerda" numeros={ficha.esquerda} atualizar={esquerda => setFicha({...ficha, esquerda})}/>
              <CamposMao lado="direita" numeros={ficha.direita} atualizar={direita => setFicha({...ficha, direita})}/>
              <div className="flex gap-2">
                <button type="submit" disabled={ocupado} className="rounded-xl bg-[#ab7284] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{ocupado ? 'Salvando...' : 'Salvar ficha'}</button>
                <button type="button" onClick={() => setEditandoId(null)} className="rounded-xl border border-[#eddae0] px-4 py-2.5 text-sm">Cancelar</button>
              </div>
            </form>
          )}
          {!ocupado && filtradas.length === 0 && <p className="rounded-xl bg-[#fff7f9] p-4 text-sm text-[#987682]">Nenhuma cliente encontrada.</p>}
          {filtradas.map(cliente => (
            <article key={cliente.id} className="space-y-3 rounded-xl border border-[#eddae0] bg-[#fffdfd] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><h3 className="font-semibold text-[#82495b]">{cliente.nome}</h3><p className="text-xs text-[#987682]">{cliente.whatsapp || 'Sem WhatsApp cadastrado'}</p></div>
                <div className="flex gap-2"><button onClick={() => editar(cliente)} className="rounded-lg border border-[#eddae0] px-3 py-1.5 text-xs text-[#82495b]">Editar</button><button onClick={() => excluir(cliente)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs text-rose-700">Excluir</button></div>
              </div>
              {(cliente.cores_preferidas || cliente.decoracoes_evitar || cliente.observacoes_gerais) && (
                <div className="space-y-1 text-sm text-[#72545d]">
                  {cliente.cores_preferidas && <p><strong>Cores:</strong> {cliente.cores_preferidas}</p>}
                  {cliente.decoracoes_evitar && <p><strong>Evitar:</strong> {cliente.decoracoes_evitar}</p>}
                  {cliente.observacoes_gerais && <p className="whitespace-pre-wrap"><strong>Observações:</strong> {cliente.observacoes_gerais}</p>}
                </div>
              )}
              <div className="grid gap-2 sm:grid-cols-2"><ResumoMao lado="esquerda" cliente={cliente}/><ResumoMao lado="direita" cliente={cliente}/></div>
              {whatsappLink(cliente.whatsapp) && <a href={whatsappLink(cliente.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-semibold text-green-700">Abrir WhatsApp</a>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
