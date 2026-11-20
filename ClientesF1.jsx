import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { UserRound, Plus, Pencil, Trash2, Search, LockKeyhole, Save, X, LogOut, MessageCircle } from 'lucide-react';

// SOMENTE dados PÚBLICOS do Supabase. Nunca coloque aqui uma secret/service_role key.
const SUPABASE_URL = 'COLE_AQUI_A_URL_DO_SUPABASE';
const SUPABASE_PUBLIC_KEY = 'COLE_AQUI_A_CHAVE_PUBLICAVEL';
const configurado = SUPABASE_URL.startsWith('https://') && !SUPABASE_PUBLIC_KEY.startsWith('COLE_');
const supabase = configurado ? createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY) : null;

const DEDOS = ['Polegar', 'Indicador', 'Médio', 'Anelar', 'Mindinho'];
const TAMANHOS_VAZIOS = ['', '', '', '', ''];
const FICHA_VAZIA = { nome: '', telefone: '', observacoes: '', f1_esquerda: [...TAMANHOS_VAZIOS], f1_direita: [...TAMANHOS_VAZIOS] };
const campo = 'w-full rounded-xl border border-[#EBDDD7] bg-[#FFFDFC] px-3 py-2.5 text-sm text-[#4A3F3B] outline-none focus:border-[#C88D91]';
const textoAuxiliar = 'block text-[11px] font-semibold uppercase tracking-wide text-[#947B77] mb-1';

function normalizeTamanhos(valor) {
  return Array.isArray(valor) ? DEDOS.map((_, i) => String(valor[i] ?? '')) : [...TAMANHOS_VAZIOS];
}
function telefoneParaWhatsapp(telefone = '') {
  let digits = String(telefone).replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  return digits.length >= 12 && digits.length <= 13 ? `https://wa.me/${digits}` : null;
}
function MaoF1({ titulo, valor, onChange }) {
  return (
    <fieldset className="rounded-2xl border border-[#F0E3E0] bg-[#FFF9F9] p-3 sm:p-4">
      <legend className="px-2 text-sm font-bold text-[#9B606C]">{titulo}</legend>
      <p className="mb-3 text-xs text-[#977F7D]">Preencha do polegar (dedão) ao mindinho. Ex.: 6, 8, 10, K14.</p>
      <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
        {DEDOS.map((dedo, i) => (
          <label key={dedo} className="min-w-0 text-center">
            <span className="mb-1 block text-[10px] leading-tight text-[#756466] sm:text-xs">{dedo}</span>
            <input
              aria-label={`${titulo} - ${dedo}`}
              value={valor[i] || ''}
              onChange={e => onChange(valor.map((t, n) => n === i ? e.target.value.toUpperCase().slice(0, 12) : t))}
              maxLength={12}
              placeholder="—"
              className="w-full min-w-0 rounded-lg border border-[#E9CBCD] bg-white px-1 py-2.5 text-center text-sm font-semibold text-[#8D5361] outline-none focus:border-[#B77D86]"
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function ClientesF1() {
  const [usuario, setUsuario] = useState(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lista, setLista] = useState([]);
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState(null);
  const [ficha, setFicha] = useState(FICHA_VAZIA);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!supabase) return;
    let montado = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (montado && !error) setUsuario(data.user || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sessao) => {
      if (montado) setUsuario(sessao?.user || null);
    });
    return () => { montado = false; subscription.unsubscribe(); };
  }, []);

  const carregarClientes = useCallback(async () => {
    if (!usuario || !supabase) return;
    setCarregando(true);
    const { data, error } = await supabase.from('clientes_f1').select('*').order('nome', { ascending: true });
    if (error) setErro('Não foi possível carregar as clientes: ' + error.message);
    else { setLista(data || []); setErro(''); }
    setCarregando(false);
  }, [usuario]);
  useEffect(() => { if (usuario) carregarClientes(); else setLista([]); }, [usuario, carregarClientes]);

  const filtradas = useMemo(() => lista.filter(c =>
    `${c.nome} ${c.telefone || ''}`.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR'))
  ), [lista, busca]);

  async function entrar(evento) {
    evento.preventDefault();
    setErro(''); setMensagem(''); setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setCarregando(false); setSenha('');
    if (error) setErro('Acesso não autorizado. Confira seu e-mail e sua senha do Supabase.');
  }

  function novaFicha() { setFicha({ ...FICHA_VAZIA, f1_esquerda: [...TAMANHOS_VAZIOS], f1_direita: [...TAMANHOS_VAZIOS] }); setEditando('novo'); setErro(''); setMensagem(''); }
  function abrirEdicao(cliente) {
    setFicha({ nome: cliente.nome || '', telefone: cliente.telefone || '', observacoes: cliente.observacoes || '', f1_esquerda: normalizeTamanhos(cliente.f1_esquerda), f1_direita: normalizeTamanhos(cliente.f1_direita) });
    setEditando(cliente.id); setErro(''); setMensagem('');
  }
  async function salvar(evento) {
    evento.preventDefault();
    if (!usuario || !ficha.nome.trim()) { setErro('Informe o nome da cliente.'); return; }
    setCarregando(true); setErro(''); setMensagem('');
    const dados = { nome: ficha.nome.trim().slice(0, 150), telefone: ficha.telefone.trim().slice(0, 30), observacoes: ficha.observacoes.trim().slice(0, 2000), f1_esquerda: ficha.f1_esquerda.map(v => v.trim()), f1_direita: ficha.f1_direita.map(v => v.trim()) };
    const requisicao = editando === 'novo'
      ? supabase.from('clientes_f1').insert({ ...dados, owner_id: usuario.id })
      : supabase.from('clientes_f1').update(dados).eq('id', editando).eq('owner_id', usuario.id);
    const { error } = await requisicao.select('id').single();
    setCarregando(false);
    if (error) { setErro('Não foi possível salvar: ' + error.message); return; }
    setEditando(null); setMensagem('Ficha salva com sucesso.');
    await carregarClientes();
  }
  async function excluir(cliente) {
    if (!window.confirm(`Excluir permanentemente a ficha de ${cliente.nome}?`)) return;
    setCarregando(true); setErro(''); setMensagem('');
    const { error } = await supabase.from('clientes_f1').delete().eq('id', cliente.id).eq('owner_id', usuario.id);
    setCarregando(false);
    if (error) setErro('Não foi possível excluir: ' + error.message);
    else { setMensagem('Ficha excluída.'); await carregarClientes(); }
  }
  async function sair() {
    await supabase.auth.signOut();
    setEditando(null); setLista([]); setMensagem(''); setErro('');
  }

  return (
    <section className="rounded-2xl border border-[#EEDDD9] bg-white p-4 shadow-sm sm:p-6" aria-label="Minhas clientes - Molde F1">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#8D5361]"><UserRound className="h-5 w-5" /><div><h3 className="font-serif-elegant text-lg font-bold">Minhas Clientes</h3><p className="text-xs text-[#947B77]">Fichas de atendimento e numeração do molde F1</p></div></div>
        {usuario && <button type="button" onClick={sair} className="flex items-center gap-1 rounded-lg border border-[#EEDDD9] px-3 py-2 text-xs text-[#8D5361]"><LogOut size={14} /> Sair das fichas</button>}
      </div>
      {!configurado && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Cadastro ainda não configurado. É necessário preencher a URL e a chave publicável do Supabase no arquivo ClientesF1.jsx. Não cadastre dados reais até ativar a autenticação segura.</p>}
      {configurado && !usuario && (
        <form onSubmit={entrar} className="max-w-md space-y-3 rounded-xl bg-[#FFF8F7] p-4">
          <div className="flex items-center gap-2 text-[#8D5361]"><LockKeyhole size={17}/><strong className="text-sm">Acesso protegido às fichas</strong></div>
          <p className="text-xs text-[#806F6D]">Use o e-mail e a senha da sua conta de administradora cadastrada no Supabase.</p>
          <label className={textoAuxiliar}>Seu e-mail</label>
          <input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className={campo} />
          <label className={textoAuxiliar}>Sua senha</label>
          <input type="password" required autoComplete="current-password" value={senha} onChange={e => setSenha(e.target.value)} className={campo} />
          <button disabled={carregando} className="rounded-xl bg-[#A76B77] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{carregando ? 'Conectando...' : 'Acessar fichas'}</button>
        </form>
      )}
      {erro && <p role="alert" className="my-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{erro}</p>}
      {mensagem && <p role="status" className="my-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{mensagem}</p>}
      {configurado && usuario && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="relative flex-1 min-w-[180px]"><Search size={16} className="absolute left-3 top-3 text-[#B78F94]"/><input aria-label="Buscar cliente por nome ou telefone" placeholder="Buscar cliente..." value={busca} onChange={e => setBusca(e.target.value)} className={`${campo} pl-9`} /></label>
            <button onClick={novaFicha} className="flex items-center gap-2 rounded-xl bg-[#A76B77] px-4 py-3 text-sm font-bold text-white"><Plus size={17}/> Nova cliente</button>
          </div>
          {editando && (
            <form onSubmit={salvar} className="space-y-4 rounded-2xl border border-[#E9CDCF] bg-[#FFFDFB] p-4">
              <div className="flex justify-between gap-3"><h4 className="font-bold text-[#8D5361]">{editando === 'novo' ? 'Cadastrar cliente' : 'Editar ficha'}</h4><button type="button" onClick={() => setEditando(null)} aria-label="Fechar ficha"><X size={20}/></button></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label><span className={textoAuxiliar}>Nome da cliente *</span><input required maxLength={150} value={ficha.nome} onChange={e => setFicha({ ...ficha, nome: e.target.value })} className={campo} placeholder="Nome completo" /></label>
                <label><span className={textoAuxiliar}>WhatsApp (opcional)</span><input type="tel" maxLength={30} value={ficha.telefone} onChange={e => setFicha({ ...ficha, telefone: e.target.value })} className={campo} placeholder="(67) 99999-9999" /></label>
              </div>
              <label className="block"><span className={textoAuxiliar}>Observações, cores e preferências</span><textarea rows={3} maxLength={2000} value={ficha.observacoes} onChange={e => setFicha({ ...ficha, observacoes: e.target.value })} className={campo} placeholder="Ex.: gosta de nude; não gosta de pedrarias; prefere desenhos discretos." /></label>
              <MaoF1 titulo="Mão esquerda" valor={ficha.f1_esquerda} onChange={valor => setFicha({ ...ficha, f1_esquerda: valor })}/>
              <MaoF1 titulo="Mão direita" valor={ficha.f1_direita} onChange={valor => setFicha({ ...ficha, f1_direita: valor })}/>
              <div className="flex flex-wrap gap-2"><button type="submit" disabled={carregando} className="flex items-center gap-2 rounded-xl bg-[#A76B77] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Save size={16}/> {carregando ? 'Salvando...' : 'Salvar ficha'}</button><button type="button" onClick={() => setEditando(null)} className="rounded-xl border border-[#E9CDCF] px-4 py-3 text-sm">Cancelar</button></div>
            </form>
          )}
          <div className="space-y-3">
            {carregando && <p className="text-sm text-[#947B77]">Carregando...</p>}
            {!carregando && filtradas.length === 0 && <p className="rounded-xl bg-[#FFF8F7] p-5 text-center text-sm text-[#947B77]">Nenhuma cliente encontrada. Toque em “Nova cliente” para cadastrar.</p>}
            {filtradas.map(cliente => {
              const zap = telefoneParaWhatsapp(cliente.telefone);
              return (
                <article key={cliente.id} className="rounded-xl border border-[#EEDDD9] bg-[#FFFCFB] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h4 className="font-bold text-[#563E43]">{cliente.nome}</h4><p className="text-xs text-[#947B77]">{cliente.telefone || 'Sem WhatsApp cadastrado'}</p></div>
                    <div className="flex gap-2"><button onClick={() => abrirEdicao(cliente)} className="flex items-center gap-1 rounded-lg border border-[#DFC8C9] px-3 py-2 text-xs text-[#8D5361]"><Pencil size={13}/> Editar</button><button onClick={() => excluir(cliente)} title="Excluir ficha" aria-label={`Excluir ${cliente.nome}`} className="rounded-lg border border-rose-200 px-3 py-2 text-rose-600"><Trash2 size={14}/></button></div>
                  </div>
                  {cliente.observacoes && <p className="my-3 whitespace-pre-wrap text-sm text-[#6B555A]">{cliente.observacoes}</p>}
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {[['Esquerda',cliente.f1_esquerda],['Direita',cliente.f1_direita]].map(([mao,tamanhos]) => <div key={mao} className="rounded-lg bg-[#FDF1F1] p-3"><p className="mb-1 text-xs font-semibold text-[#8D5361]">Mão {mao.toLowerCase()}</p><div className="grid grid-cols-5 gap-1">{normalizeTamanhos(tamanhos).map((n,i) => <div key={i} className="text-center"><p className="text-[9px] text-[#8A7779]">{DEDOS[i].slice(0,3)}</p><p className="rounded-md bg-white py-1 text-xs font-bold text-[#8D5361]">{n || '—'}</p></div>)}</div></div>)}
                  </div>
                  {zap && <a href={zap} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700"><MessageCircle size={14}/> Abrir WhatsApp</a>}
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
