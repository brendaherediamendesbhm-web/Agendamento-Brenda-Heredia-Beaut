import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle, 
  Sparkles, 
  MessageSquare, 
  ChevronRight, 
  Layers, 
  Trash2, 
  Smile, 
  Smartphone, 
  Calendar as AdminCalendar, 
  TrendingUp, 
  Users, 
  ClipboardList,
  AlertCircle,
  Scissors,
  Check,
  Send,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft
} from 'lucide-react';

let firebaseAvailable = false;
let db = null;
let auth = null;
let appId = 'dotto-vip-default';

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const { initializeApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    const { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } = require('firebase/firestore');
    
    const firebaseConfig = JSON.parse(__firebase_config);
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    appId = typeof __app_id !== 'undefined' ? __app_id : 'dotto-vip-default';
    firebaseAvailable = true;
  }
} catch (e) {
  console.log("Modo local.");
}

export default function App() {
  // Lista de serviços oferecidos por Brenda Heredia Beauty
  const services = [
    { id: 'banho_gel', name: 'Banho de Gel', category: 'Novos & Blindagem', duration: '2h00', price: 85, desc: 'Ideal para blindar e fortalecer o crescimento das unhas naturais com camada de gel premium.' },
    { id: 'along_f1', name: 'Alongamento Molde F1', category: 'Novos & Blindagem', duration: '3h00', price: 100, desc: 'Extensão rápida e sofisticada utilizando a técnica moderna do Molde F1.' },
    { id: 'manut_banho', name: 'Manutenção de Banho de Gel', category: 'Manutenções', duration: '2h15', price: 65, desc: 'Manutenção periódica para repor a estrutura do gel nas unhas em crescimento.' },
    { id: 'manut_f1', name: 'Manutenção de Molde F1', category: 'Manutenções', duration: '2h30', price: 75, desc: 'Nivelamento e reposicionamento do alongamento feito na técnica F1.' },
    { id: 'remocao', name: 'Remoção de Gel / Alongamento', category: 'Remoções e Extras', duration: '1h00', price: 25, desc: 'Retirada segura do produto sem danificar a base da unha natural.' },
    { id: 'conserto', name: 'Conserto de Unha Avulsa', category: 'Remoções e Extras', duration: '0h30', price: 10, desc: 'Reparação de emergência para uma unha partida ou danificada.' }
  ];

  const [activeTab, setActiveTab] = useState('simulator');
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success'); 

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (firebaseAvailable && db && auth) {
      const initAuthAndFirestore = async () => {
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            const { signInWithCustomToken } = require('firebase/auth');
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            const { signInAnonymously } = require('firebase/auth');
            await signInAnonymously(auth);
          }
        } catch (err) {
          loadLocalData();
        }
      };
      initAuthAndFirestore();
      const unsubscribeAuth = auth.onAuthStateChanged((currUser) => { setUser(currUser); });
      return () => unsubscribeAuth();
    } else {
      loadLocalData();
    }
  }, []);

  useEffect(() => {
    if (firebaseAvailable && db && user) {
      const { collection, onSnapshot } = require('firebase/firestore');
      const appointmentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'appointments');
      const unsubscribe = onSnapshot(appointmentsRef, 
        (snapshot) => {
          const list = [];
          snapshot.forEach((doc) => { list.push({ id: doc.id, ...doc.data() }); });
          list.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
          setAppointments(list);
        },
        (error) => { showToast("Erro de sincronização. Usando dados locais.", "error"); }
      );
      return () => unsubscribe();
    }
  }, [user]);

  const loadLocalData = () => {
    const saved = localStorage.getItem('dotto_appointments');
    if (saved) {
      try { setAppointments(JSON.parse(saved)); } catch (e) { setAppointments(getMockAppointments()); }
    } else {
      setAppointments(getMockAppointments());
    }
  };

  const saveAppointmentsState = (newList) => {
    setAppointments(newList);
    localStorage.setItem('dotto_appointments', JSON.stringify(newList));
  };

  const getMockAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return [
      { id: 'mock-1', clientName: 'Mariana Silva', clientPhone: '17991234567', clientType: 'Veterana', serviceId: 'banho_gel', serviceName: 'Banho de Gel', dateTime: `${today}T10:00`, price: 85, status: 'Pendente', notes: 'Quer um tom nude suave' },
      { id: 'mock-2', clientName: 'Beatriz Costa', clientPhone: '17998765432', clientType: 'Novata', serviceId: 'along_f1', serviceName: 'Alongamento Molde F1', dateTime: `${today}T14:00`, price: 100, status: 'Pendente', notes: 'Gostaria de formato bailarina' }
    ];
  };

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => { setToastMessage(null); }, 4500);
  };

  const handleCreateAppointment = async (appointmentData) => {
    const newAppointment = { ...appointmentData, status: 'Pendente', createdAt: new Date().toISOString() };
    if (firebaseAvailable && db && user) {
      try {
        const { collection, addDoc } = require('firebase/firestore');
        const appointmentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'appointments');
        await addDoc(appointmentsRef, newAppointment);
        showToast("Marcação realizada com sucesso!", "success");
      } catch (err) {
        const localList = [...appointments, { id: 'local-' + Date.now(), ...newAppointment }];
        saveAppointmentsState(localList);
        showToast("Marcação guardada com sucesso!", "success");
      }
    } else {
      const localList = [...appointments, { id: 'local-' + Date.now(), ...newAppointment }];
      saveAppointmentsState(localList);
      showToast("Marcação guardada com sucesso!", "success");
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    if (firebaseAvailable && db && user && !id.startsWith('mock-') && !id.startsWith('local-')) {
      try {
        const { doc, updateDoc } = require('firebase/firestore');
        const appointmentDoc = doc(db, 'artifacts', appId, 'public', 'data', 'appointments', id);
        await updateDoc(appointmentDoc, { status: newStatus });
        showToast(`Marcação atualizada!`, "success");
      } catch (err) {
        showToast("Não foi possível atualizar.", "error");
      }
    } else {
      const updated = appointments.map(app => app.id === id ? { ...app, status: newStatus } : app);
      saveAppointmentsState(updated);
      showToast(`Marcação atualizada!`, "success");
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (firebaseAvailable && db && user && !id.startsWith('mock-') && !id.startsWith('local-')) {
      try {
        const { doc, deleteDoc } = require('firebase/firestore');
        const appointmentDoc = doc(db, 'artifacts', appId, 'public', 'data', 'appointments', id);
        await deleteDoc(appointmentDoc);
        showToast("Marcação removida.", "info");
      } catch (err) {
        showToast("Não foi possível apagar.", "error");
      }
    } else {
      const filtered = appointments.filter(app => app.id !== id);
      saveAppointmentsState(filtered);
      showToast("Marcação removida.", "info");
    }
  };

  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Olá! ✨ Seja muito bem-vinda ao espaço Brenda Heredia Beauty. Sou a sua assistente virtual.', time: 'Agora' },
    { sender: 'bot', text: 'Deseja agendar um serviço, consultar valores ou falar conosco? Selecione uma das opções abaixo:', time: 'Agora', isOptions: true }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => { if (chatEndRef.current) { chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); } }, [chatMessages]);

  const handleSendChatMessage = (text, isSystemOption = false) => {
    if (!text.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'client', text: text, time: 'Agora' }]);
    setChatInput('');

    setTimeout(() => {
      let botResponse = [];
      if (isSystemOption && text === '1. Marcar Novo Serviço') {
        botResponse.push({ sender: 'bot', text: 'Perfeito! 💅 Vou guiar você na sua marcação de unhas.', time: 'Agora' });
        botResponse.push({ sender: 'bot', text: 'Por favor, clique no botão rosa "ABRIR AGENDA ONLINE" que acabou de aparecer acima do celular para escolher o seu serviço!', time: 'Agora', showLinkTrigger: true });
      } else if (isSystemOption && text === '2. Manutenção ou Remoção') {
        botResponse.push({ sender: 'bot', text: 'Maravilha! Manter as unhas saudáveis é essencial. ✨', time: 'Agora' });
        botResponse.push({ sender: 'bot', text: 'Clique no link "ABRIR AGENDA ONLINE" no topo para selecionar o seu serviço.', time: 'Agora', showLinkTrigger: true });
      } else if (isSystemOption && text === '3. Ver Localização') {
        botResponse.push({ sender: 'bot', text: 'Estamos localizadas no Jardim Progresso, Rua Urias Ribeiro, n⁰ 2551, Casa 21, Condomínio Espanha, próximo ao colégio Objetivo em Três Lagoas.', time: 'Agora' });
        botResponse.push({ sender: 'bot', text: 'Deseja fazer mais alguma consulta?', time: 'Agora', isOptions: true });
      } else if (isSystemOption && text === '4. Falar com Atendente') {
        botResponse.push({ sender: 'bot', text: 'Entendido. Vou encaminhar a sua mensagem para a nossa profissional. Ela responderá assim que terminar o atendimento em curso! 🌸', time: 'Agora' });
      } else {
        botResponse.push({ sender: 'bot', text: 'Por favor, escolha uma das opções do menu. 💕', time: 'Agora', isOptions: true });
      }
      setChatMessages(prev => [...prev, ...botResponse]);
    }, 1000);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === '1234' || adminPassword.toLowerCase() === 'brenda' || adminPassword === 'Brenda2026') {
      setIsAdminLoggedIn(true);
      showToast("Acesso autorizado! Bem-vinda, Brenda.", "success");
    } else {
      showToast("Senha incorreta.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#4A3F3B] flex flex-col antialiased">
      {toastMessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-full shadow-lg bg-white border border-[#E5A8A3]">
          {toastType === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
          {toastType === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
          {toastType === 'info' && <Sparkles className="w-5 h-5 text-[#E5A8A3]" />}
          <span className="text-sm font-medium text-[#4A3F3B]">{toastMessage}</span>
        </div>
      )}

      <header className="bg-white border-b border-[#F0E6DC] py-4 px-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold tracking-widest text-[#8C6D62] flex items-center gap-2 justify-center md:justify-start">
              BRENDA HEREDIA <span className="text-xs bg-[#F7E6E3] text-[#B57C74] px-2.5 py-0.5 rounded-full font-medium">BOT + AGENDA</span>
            </h1>
            <p className="text-xs text-[#9E8B83] mt-0.5 tracking-wider uppercase font-medium">Nails Studio</p>
          </div>

          <nav className="flex bg-[#FAF6F0] p-1 rounded-full border border-[#EBE0D5] w-full md:w-auto overflow-x-auto">
            <button onClick={() => setActiveTab('simulator')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeTab === 'simulator' ? 'bg-[#E5A8A3] text-white' : 'text-[#7D6B63]'}`}><Smartphone className="w-4 h-4" /> WhatsApp Bot</button>
            <button onClick={() => setActiveTab('booking')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeTab === 'booking' ? 'bg-[#E5A8A3] text-white' : 'text-[#7D6B63]'}`}><CalendarIcon className="w-4 h-4" /> Agenda Online</button>
            <button onClick={() => setActiveTab('admin')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeTab === 'admin' ? 'bg-[#E5A8A3] text-white' : 'text-[#7D6B63]'}`}><Lock className="w-3.5 h-3.5" /> Painel Admin</button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#F0E6DC] shadow-sm">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#B57C74] bg-[#F7E6E3] px-2 py-1 rounded">Guia do Seu Sistema</span>
                <h2 className="text-2xl text-[#4A3F3B] mt-3">Como funciona o seu robô Brenda?</h2>
                <p className="text-sm text-[#7D6B63] mt-3 leading-relaxed">Esse robô atende a sua cliente instantaneamente 24h por dia. Ele faz o filtro inicial e entrega o link da sua agenda online personalizada.</p>
                <button onClick={() => setActiveTab('booking')} className="w-full mt-6 bg-[#E5A8A3] text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">Abrir Agenda Online Diretamente <ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-[380px] bg-white rounded-[40px] border-[10px] border-[#4A3F3B] shadow-2xl overflow-hidden flex flex-col h-[640px] relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-5 w-36 bg-[#4A3F3B] rounded-b-2xl z-10"></div>
                <div className="bg-[#FAF6F0] border-b border-[#F0E6DC] pt-8 pb-3 px-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E5A8A3] flex items-center justify-center text-white font-bold relative">B<div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div></div>
                  <div><h3 className="text-xs font-bold text-[#4A3F3B]">Brenda Heredia ✨</h3><p className="text-[10px] text-green-600 font-medium">Assistente Comercial</p></div>
                </div>

                <div className="flex-1 bg-[#FAF6F0] p-4 overflow-y-auto space-y-3 flex flex-col justify-between">
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {chatMessages.map((msg, index) => (
                      <div key={index} className={`flex flex-col ${msg.sender === 'client' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${msg.sender === 'client' ? 'bg-[#E5A8A3] text-white rounded-tr-none' : 'bg-white text-[#4A3F3B] rounded-tl-none border border-[#F0E6DC]'}`}>
                          <p>{msg.text}</p>
                          {msg.showLinkTrigger && (
                            <button onClick={() => setActiveTab('booking')} className="mt-3 w-full bg-[#FAF6F0] border border-[#E5A8A3] text-[#B57C74] font-bold py-2 px-3 rounded-lg text-[11px] flex items-center justify-center gap-1.5">
                              <CalendarIcon className="w-3.5 h-3.5" /> ABRIR AGENDA ONLINE
                            </button>
                          )}
                        </div>
                        {msg.isOptions && (
                          <div className="mt-2 w-full space-y-1.5 pl-2">
                            <button onClick={() => handleSendChatMessage('1. Marcar Novo Serviço', true)} className="block w-full bg-white text-[#B57C74] border border-[#F0E6DC] py-2 px-3 rounded-lg text-left text-[11px] font-medium">💅 1. Marcar Novo Serviço</button>
                            <button onClick={() => handleSendChatMessage('2. Manutenção ou Remoção', true)} className="block w-full bg-white text-[#B57C74] border border-[#F0E6DC] py-2 px-3 rounded-lg text-left text-[11px] font-medium">🔄 2. Manutenção ou Remoção</button>
                            <button onClick={() => handleSendChatMessage('3. Ver Localização', true)} className="block w-full bg-white text-[#B57C74] border border-[#F0E6DC] py-2 px-3 rounded-lg text-left text-[11px] font-medium">📍 3. Ver Localização</button>
                            <button onClick={() => handleSendChatMessage('4. Falar com Atendente', true)} className="block w-full bg-white text-[#B57C74] border border-[#F0E6DC] py-2 px-3 rounded-lg text-left text-[11px] font-medium">👩‍🎨 4. Falar com Atendente</button>
                          </div>
                        )}
                        <span className="text-[9px] text-[#9E8B83] mt-1 px-1">{msg.time}</span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </div>

                <div className="bg-white p-3 border-t border-[#F0E6DC] flex gap-2 items-center">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Escreva uma mensagem..." onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage(chatInput)} className="flex-1 bg-[#FAF6F0] text-xs px-3 py-2 rounded-full border border-[#EBE0D5] focus:outline-none" />
                  <button onClick={() => handleSendChatMessage(chatInput)} className="w-8 h-8 rounded-full bg-[#E5A8A3] flex items-center justify-center text-white shrink-0"><Send className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="max-w-3xl mx-auto">
            <BookingWizard services={services} appointments={appointments} onComplete={handleCreateAppointment} />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {!isAdminLoggedIn ? (
              <div className="bg-white p-8 rounded-2xl border border-[#F0E6DC] max-w-md mx-auto text-center space-y-6 mt-12">
                <div className="w-12 h-12 bg-[#F7E6E3] rounded-full flex items-center justify-center mx-auto text-[#B57C74]"><Lock className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-xl font-bold text-[#4A3F3B]">Acesso Exclusivo Brenda</h3>
                  <p className="text-xs text-[#9E8B83] mt-2">Introduza a senha profissional para acessar.</p>
                </div>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <input type={showPassword ? "text" : "password"} placeholder="Introduza a sua senha" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full bg-[#FAF6F0] text-xs px-4 py-3 rounded-xl border border-[#F0E6DC] focus:outline-none" />
                  <button type="submit" className="w-full bg-[#E5A8A3] text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider">Entrar no Painel</button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-[#F0E6DC]">
                  <div>
                    <h2 className="text-xl font-bold text-[#4A3F3B]">Gestão de Marcações - Brenda Heredia</h2>
                    <p className="text-xs text-[#7D6B63] mt-1">Consulte os horários agendados pelas clientes.</p>
                  </div>
                  <button onClick={() => { setIsAdminLoggedIn(false); setAdminPassword(''); }} className="text-xs text-[#9E8B83] hover:text-rose-500 font-semibold underline">Sair do Painel</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-[#F0E6DC] flex items-center justify-between">
                    <div><p className="text-[11px] text-[#9E8B83] uppercase">Total de Marcações</p><h3 className="text-2xl font-bold text-[#4A3F3B] mt-1">{appointments.length}</h3></div>
                    <div className="w-10 h-10 rounded-full bg-[#F7E6E3] flex items-center justify-center text-[#B57C74]"><ClipboardList className="w-5 h-5" /></div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#F0E6DC] flex items-center justify-between">
                    <div><p className="text-[11px] text-[#9E8B83] uppercase">Pendentes</p><h3 className="text-2xl font-bold text-[#4A3F3B] mt-1">{appointments.filter(app => app.status === 'Pendente').length}</h3></div>
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><Clock className="w-5 h-5" /></div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#F0E6DC] flex items-center justify-between">
                    <div><p className="text-[11px] text-[#9E8B83] uppercase">Faturação Estimada</p><h3 className="text-2xl font-bold text-emerald-700 mt-1">R$ {appointments.reduce((sum, item) => sum + (item.price || 0), 0)},00</h3></div>
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><TrendingUp className="w-5 h-5" /></div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#F0E6DC] overflow-hidden">
                  <div className="divide-y divide-[#F0E6DC]">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2"><span className="text-sm font-bold text-[#4A3F3B]">{appointment.clientName}</span><span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F7E6E3] text-[#B57C74]">{appointment.clientType}</span></div>
                          <p className="text-xs font-semibold text-[#8C6D62] mt-1">{appointment.serviceName} • R$ {appointment.price},00</p>
                          <p className="text-[11px] text-[#9E8B83]">{appointment.dateTime.replace('T', ' às ')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={`https://wa.me/${appointment.clientPhone}?text=Confirmar`} target="_blank" rel="noopener noreferrer" className="bg-[#FAF6F0] text-[#B57C74] border border-[#E5A8A3] px-3 py-1.5 rounded-lg text-xs font-semibold">Lembrete</a>
                          {appointment.status === 'Pendente' ? (
                            <button onClick={() => handleUpdateStatus(appointment.id, 'Confirmado')} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold">Confirmar</button>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">✓ Confirmado</span>
                          )}
                          <button onClick={() => handleDeleteAppointment(appointment.id)} className="p-1.5 text-[#A6948E] hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function BookingWizard({ services, appointments, onComplete }) {
  const [step, setStep] = useState(1); 
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientType, setClientType] = useState('Novata'); 
  const [notes, setNotes] = useState('');
  const [viewDate, setViewDate] = useState(new Date(2026, 4, 1));

  const categories = ['Novos & Blindagem', 'Manutenções', 'Remoções e Extras'];

  const getCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return [...Array(firstDayIndex).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
  };

  const isDateDisabled = (dayNum) => {
    if (!dayNum) return true;
    const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNum);
    if (checkDate.getDay() === 0 || checkDate.getDay() === 6) return true;
    if (checkDate < new Date(2026, 4, 27)) return true;
    return false;
  };

  const getAvailableTimeSlots = (dateStr) => {
    if (!dateStr || !selectedService) return [];
    const [y, m, d] = dateStr.split('-').map(Number);
    const day = new Date(y, m - 1, d).getDay();
    return day === 5 ? ['08:00', '10:00', '13:00', '15:00'] : ['10:00', '13:00', '15:00', '17:00'];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete({ clientName, clientPhone, clientType, serviceId: selectedService.id, serviceName: selectedService.name, dateTime: `${selectedDate}T${selectedTime}`, price: selectedService.price, notes });
    setStep(4);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#F0E6DC] shadow-sm p-6">
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-center">O que vamos fazer hoje?</h3>
          {categories.map(cat => (
            <div key={cat} className="space-y-2">
              <h4 className="text-xs font-bold text-[#B57C74]">{cat}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.filter(s => s.category === cat).map(s => (
                  <div key={s.id} onClick={() => setSelectedService(s)} className={`p-4 rounded-xl border cursor-pointer ${selectedService?.id === s.id ? 'border-[#E5A8A3] bg-[#FCF8F5]' : 'border-[#F0E6DC]'}`}>
                    <div className="flex justify-between font-bold text-xs"><span>{s.name}</span><span>R$ {s.price}</span></div>
                    <p className="text-[11px] text-[#9E8B83] mt-1">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button disabled={!selectedService} onClick={() => setStep(2)} className="w-full bg-[#E5A8A3] text-white py-2.5 rounded-xl font-bold text-xs uppercase mt-4">Escolher Horário</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-center">Escolha a data e hora</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}>◀</button>
                <span>{viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}>▶</button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400"><span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span></div>
              <div className="grid grid-cols-7 gap-1 mt-1">
                {getCalendarDays().map((day, idx) => {
                  if (!day) return <div key={idx}></div>;
                  const dStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dis = isDateDisabled(day);
                  return <button key={idx} type="button" disabled={dis} onClick={() => { setSelectedDate(dStr); setSelectedTime(''); }} className={`h-8 rounded text-xs ${selectedDate === dStr ? 'bg-[#E5A8A3] text-white font-bold' : dis ? 'text-gray-200' : 'border border-gray-100'}`}>{day}</button>;
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">Horários:</label>
              {selectedDate ? (
                <div className="grid grid-cols-2 gap-2">
                  {getAvailableTimeSlots(selectedDate).map(t => (
                    <button key={t} type="button" onClick={() => setSelectedTime(t)} className={`py-2 rounded border text-xs ${selectedTime === t ? 'bg-[#E5A8A3] text-white font-bold' : 'border-gray-200'}`}>{t}</button>
                  ))}
                </div>
              ) : <p className="text-xs text-gray-400">Escolha um dia.</p>}
            </div>
          </div>
          <div className="flex justify-between mt-4"><button onClick={() => setStep(1)} className="text-xs text-gray-500">Voltar</button><button disabled={!selectedDate || !selectedTime} onClick={() => setStep(3)} className="bg-[#E5A8A3] text-white px-6 py-2 rounded-xl font-bold text-xs uppercase">Avançar</button></div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-bold text-center">Seus Dados</h3>
          <input type="text" required placeholder="Seu Nome" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-gray-50 text-xs p-3 rounded-xl border border-gray-200 focus:outline-none" />
          <input type="tel" required placeholder="Seu WhatsApp" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full bg-gray-50 text-xs p-3 rounded-xl border border-gray-200 focus:outline-none" />
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setClientType('Novata')} className={`p-2 rounded-xl border text-xs ${clientType === 'Novata' ? 'border-[#E5A8A3] bg-[#FCF8F5]' : 'border-gray-200'}`}>Primeira Vez</button>
            <button type="button" onClick={() => setClientType('Veterana')} className={`p-2 rounded-xl border text-xs ${clientType === 'Veterana' ? 'border-[#E5A8A3] bg-[#FCF8F5]' : 'border-gray-200'}`}>Já sou Cliente</button>
          </div>
          <textarea placeholder="Alguma observação? (Opcional)" value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-gray-50 text-xs p-3 rounded-xl border border-gray-200 focus:outline-none" />
          <div className="flex justify-between mt-4"><button type="button" onClick={() => setStep(2)} className="text-xs text-gray-500">Voltar</button><button type="submit" className="bg-[#E5A8A3] text-white px-6 py-2 rounded-xl font-bold text-xs uppercase">Concluir Agendamento</button></div>
        </form>
      )}

      {step === 4 && (
        <div className="text-center py-6 space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto font-bold">✓</div>
          <h3 className="text-xl font-bold">Agendado com Sucesso! 💅</h3>
          <p className="text-xs text-gray-600">Sua vaga está garantida para o dia {selectedDate.split('-').reverse().join('/')} às {selectedTime}.</p>
          <button type="button" onClick={() => { setStep(1); setSelectedService(null); }} className="mt-4 border border-[#E5A8A3] text-[#B57C74] px-4 py-2 rounded-xl text-xs font-bold">Novo Agendamento</button>
        </div>
      )}
    </div>
  );
}
