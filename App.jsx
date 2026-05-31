import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle, 
  Sparkles, 
  MessageSquare, 
  ChevronRight, 
  Trash2, 
  Smile, 
  Smartphone, 
  TrendingUp, 
  ClipboardList,
  AlertCircle,
  Check,
  Send,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft
} from 'lucide-react';

// --- FONTES & ESTILOS GLOBAIS ---
const injectStyles = () => {
  if (typeof document !== 'undefined') {
    const id = 'dotto-google-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..700;1,400..700&family=Inter:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(link);

      const style = document.createElement('style');
      style.innerHTML = `
        body {
          font-family: 'Inter', sans-serif;
          background-color: #FAF6F0;
        }
        .font-serif-elegant {
          font-family: 'Playfair Display', serif;
        }
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        ::-webkit-scrollbar-track {
          background: #FAF6F0;
        }
        ::-webkit-scrollbar-thumb {
          background: #E5A8A3;
          border-radius: 10px;
        }
      `;
      document.head.appendChild(style);
    }
  }
};

export default function App() {
  useEffect(() => {
    injectStyles();
  }, []);

  // --- ESTADOS GLOBAIS ---
  const [activeTab, setActiveTab] = useState('simulator'); 
  const [appointments, setAppointments] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success'); 

  // Controle de segurança para o painel admin
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false); 

  // Lista de serviços oferecidos com os valores promocionais mínimos
  const services = [
    { id: 'esmaltacao_gel', name: 'Esmaltação em Gel', category: 'Novos & Blindagem', duration: '1h30', price: 25, desc: 'Aplicação de esmalte em gel premium com secagem na cabine LED. Brilho duradouro por semanas sem descascar.' },
    { id: 'banho_gel', name: 'Banho de Gel', category: 'Novos & Blindagem', duration: '2h45', price: 50, desc: 'Ideal para blindar e fortalecer o crescimento das unhas naturais com camada de gel premium.' },
    { id: 'along_f1', name: 'Alongamento Molde F1', category: 'Novos & Blindagem', duration: '3h00', price: 80, desc: 'Extensão rápida e sofisticada utilizando a técnica moderna do Molde F1.' },
    { id: 'manut_banho', name: 'Manutenção de Banho de Gel', category: 'Manutenções', duration: '2h15', price: 40, desc: 'Manutenção periódica para repor a estrutura do gel nas unhas em crescimento.' },
    { id: 'manut_f1', name: 'Manutenção de Molde F1', category: 'Manutenções', duration: '2h30', price: 50, desc: 'Nivelamento e reposicionamento do alongamento feito na técnica F1.' },
    { id: 'remocao', name: 'Remoção de Gel / Alongamento', category: 'Remoções e Extras', duration: '1h00', price: 15, desc: 'Retirada segura do produto sem danificar a base da unha natural.' },
    { id: 'conserto', name: 'Conserto de Unha Avulsa', category: 'Remoções e Extras', duration: '0h30', price: 5, desc: 'Reparação de emergência para uma unha partida ou danificada.' }
  ];

  // --- LÓGICA DE ARMAZENAMENTO LOCAL ---
  useEffect(() => {
    loadLocalData();
  }, []);

  const loadLocalData = () => {
    const saved = localStorage.getItem('dotto_appointments');
    if (saved) {
      try {
        setAppointments(JSON.parse(saved));
      } catch (e) {
        setAppointments([]);
      }
    } else {
      setAppointments([]); 
    }
  };

  const saveAppointmentsState = (newList) => {
    setAppointments(newList);
    localStorage.setItem('dotto_appointments', JSON.stringify(newList));
  };

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleCreateAppointment = async (appointmentData) => {
    const newAppointment = {
      ...appointmentData,
      status: 'Pendente',
      createdAt: new Date().toISOString()
    };
    const localList = [...appointments, { id: 'local-' + Date.now(), ...newAppointment }];
    saveAppointmentsState(localList);
    showToast("Agendamento realizado com sucesso!", "success");
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const updated = appointments.map(app => {
      if (app.id === id) {
        return { ...app, status: newStatus };
      }
      return app;
    });
    saveAppointmentsState(updated);
    showToast(`Agendamento atualizado para ${newStatus}!`, "success");
  };

  const handleDeleteAppointment = async (id) => {
    const filtered = appointments.filter(app => app.id !== id);
    saveAppointmentsState(filtered);
    showToast("Agendamento removido.", "info");
  };

  // --- CONTROLE DO SIMULADOR ---
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Olá! ✨ Seja muito bem-vinda ao espaço Brenda Heredia Beauty. Sou a sua assistente virtual.', time: 'Agora' },
    { sender: 'bot', text: 'Deseja agendar um serviço, consultar valores ou falar conosco? Selecione uma das opções abaixo:', time: 'Agora', isOptions: true }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef(null); 

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendChatMessage = (text, isSystemOption = false) => {
    if (!text.trim()) return;

    const clientMsg = { sender: 'client', text: text, time: 'Agora' };
    setChatMessages(prev => [...prev, clientMsg]);
    setChatInput('');

    setTimeout(() => {
      let botResponse = [];

      if (isSystemOption && text === '1. Marcar Novo Serviço') {
        botResponse.push({ sender: 'bot', text: 'Perfeito! 💅 Vou guiar você no seu agendamento de unhas.', time: 'Agora' });
        botResponse.push({ sender: 'bot', text: 'Por favor, clique no botão rosa "ABRIR AGENDA ONLINE" que acabou de aparecer acima do celular para escolher o seu serviço e o melhor horário na minha agenda inteligente!', time: 'Agora', showLinkTrigger: true });
      } else if (isSystemOption && text === '2. Manutenção ou Remoção') {
        botResponse.push({ sender: 'bot', text: 'Maravilha! Manter as unhas saudáveis é essencial. ✨', time: 'Agora' });
        botResponse.push({ sender: 'bot', text: 'Clique no link "ABRIR AGENDA ONLINE" no topo para selecionar o seu serviço de manutenção ou agendar a remoção segura.', time: 'Agora', showLinkTrigger: true });
      } else if (isSystemOption && text === '3. Ver Localização') {
        botResponse.push({ sender: 'bot', text: 'Estamos localizadas em um espaço super acolhedor! 📍 Jardim Progresso, Rua Urias Ribeiro, nº 2551, Casa 21, Condomínio Espanha, próximo ao colégio Objetivo.', time: 'Agora' });
        botResponse.push({ sender: 'bot', text: 'Deseja fazer mais alguma consulta? Escolha uma das opções abaixo:', time: 'Agora', isOptions: true });
      } else if (isSystemOption && text === '4. Falar com Atendente') {
        botResponse.push({ sender: 'bot', text: 'Entendido. Notifiquei a Brenda! Como este site é uma simulação demonstrativa, em um sistema real essa conversa seria transferida agora para o WhatsApp pessoal dela. Ela responderá você em instantes! 🌸', time: 'Agora' });
        botResponse.push({ sender: 'bot', text: 'Se precisar de outra informação enquanto aguarda, escolha uma opção:', time: 'Agora', isOptions: true });
      } else {
        botResponse.push({ sender: 'bot', text: 'Por favor, escolha uma das opções do menu para que eu possa ajudar da melhor forma. 💕', time: 'Agora', isOptions: true });
      }

      setChatMessages(prev => [...prev, ...botResponse]);
    }, 1000);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === '23181213') {
      setIsAdminLoggedIn(true);
      setLoginError(false);
      showToast("Acesso autorizado! Bem-vinda, Brenda.", "success");
    } else {
      setLoginError(true); 
      showToast("Senha incorreta. Acesso negado.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#4A3F3B] flex flex-col antialiased">
      
      {/* --- BANNER DE INFORMAÇÃO / ALERTA DE TOAST --- */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-full shadow-lg bg-white border border-[#E5A8A3]">
          {toastType === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
          {toastType === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
          {toastType === 'info' && <Sparkles className="w-5 h-5 text-[#E5A8A3]" />}
          <span className="text-sm font-medium text-[#4A3F3B]">{toastMessage}</span>
        </div>
      )}

      {/* --- HEADER E NAVEGAÇÃO SUPERIOR --- */}
      <header className="bg-white border-b border-[#F0E6DC] py-4 px-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold font-serif-elegant tracking-widest text-[#8C6D62] flex items-center gap-2 justify-center md:justify-start">
              BRENDA HEREDIA <span className="text-xs bg-[#F7E6E3] text-[#B57C74] font-sans px-2.5 py-0.5 rounded-full font-medium tracking-normal">BOT + AGENDA</span>
            </h1>
            <p className="text-xs text-[#9E8B83] mt-0.5 tracking-wider uppercase font-medium">Nails Studio</p>
          </div>

          <nav className="flex bg-[#FAF6F0] p-1 rounded-full border border-[#EBE0D5] w-full md:w-auto overflow-x-auto">
            <button 
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${activeTab === 'simulator' ? 'bg-[#E5A8A3] text-white shadow-sm' : 'text-[#7D6B63] hover:text-[#4A3F3B]'}`}
            >
              <Smartphone className="w-4 h-4" />
              Simulador WhatsApp Bot
            </button>
            <button 
              onClick={() => setActiveTab('booking')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${activeTab === 'booking' ? 'bg-[#E5A8A3] text-white shadow-sm' : 'text-[#7D6B63] hover:text-[#4A3F3B]'}`}
            >
              <CalendarIcon className="w-4 h-4" />
              Agenda Online (Cliente)
            </button>
            <button 
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === 'admin' ? 'bg-[#E5A8A3] text-white shadow-sm' : 'text-[#7D6B63] hover:text-[#4A3F3B]'}`}
            >
              <Lock className="w-3.5 h-3.5" />
              Painel Profissional (Admin)
            </button>
          </nav>
        </div>
      </header>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        
        {/* ================= ABA: SIMULADOR DE BOT (WHATSAPP) ================= */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Esquerda: GUIA DE ATENDIMENTO PARA A CLIENTE */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#F0E6DC] shadow-sm">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#B57C74] bg-[#F7E6E3] px-2 py-1 rounded">Agendamento Fácil</span>
                <h2 className="text-2xl font-serif-elegant text-[#4A3F3B] mt-3">Como garantir seu horário?</h2>
                <p className="text-sm text-[#7D6B63] mt-3 leading-relaxed">
                  Seja muito bem-vinda! Desenvolvemos essa ferramenta para você escolher seus procedimentos prediletos e reservar o seu momento de autocuidado de forma rápida, em menos de um minuto.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FAF6F0] flex items-center justify-center text-xs font-bold text-[#B57C74] shrink-0 border border-[#F0E6DC]">1</div>
                    <div>
                      <h4 className="text-xs font-bold text-[#4A3F3B]">Escolha no Chat ao lado</h4>
                      <p className="text-xs text-[#7D6B63] mt-0.5">Selecione uma das opções numéricas no painel do celular simulado para ver valores e informações de endereço.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FAF6F0] flex items-center justify-center text-xs font-bold text-[#B57C74] shrink-0 border border-[#F0E6DC]">2</div>
                    <div>
                      <h4 className="text-xs font-bold text-[#4A3F3B]">Abra a Agenda Online</h4>
                      <p className="text-xs text-[#7D6B63] mt-0.5">Clique no botão "ABRIR AGENDA ONLINE" enviado pela assistente ou navegue pelas abas superiores.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FAF6F0] flex items-center justify-center text-xs font-bold text-[#B57C74] shrink-0 border border-[#F0E6DC]">3</div>
                    <div>
                      <h4 className="text-xs font-bold text-[#4A3F3B]">Confirme e Relaxe</h4>
                      <p className="text-xs text-[#7D6B63] mt-0.5">Escolha o melhor dia e horário na grade mensal e preencha seus dados de contato. Seu horário exclusivo estará salvo!</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#F0E6DC] text-center">
                  <button 
                    onClick={() => setActiveTab('booking')}
                    className="w-full bg-[#E5A8A3] hover:bg-[#DCA19C] text-white py-3 px-4 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2"
                  >
                    Ir Direto para a Agenda Online
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#EBE0D5] flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-[#B57C74] shrink-0 mt-0.5" />
                <p className="text-xs text-[#7D6B63] leading-relaxed">
                  💡 <strong className="font-bold text-[#4A3F3B]">Dica de beleza:</strong> Agora você também pode agendar a nossa <strong className="font-bold text-[#4A3F3B]">Esmaltação em Gel</strong>, perfeita para quem quer unhas impecáveis, brilhantes e secas na hora!
                </p>
              </div>
            </div>

            {/* Direita: Mockup do Celular */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-[380px] bg-white rounded-[40px] border-[10px] border-[#4A3F3B] shadow-2xl overflow-hidden flex flex-col h-[640px] relative">
                
                {/* Detalhe do Celular */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-5 w-36 bg-[#4A3F3B] rounded-b-2xl z-10 flex items-center justify-center">
                  <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
                </div>

                {/* Cabeçalho do WhatsApp */}
                <div className="bg-[#FAF6F0] border-b border-[#F0E6DC] pt-8 pb-3 px-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E5A8A3] flex items-center justify-center text-white font-bold relative shrink-0">
                    B
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#4A3F3B]">
                      Brenda Heredia ✨
                    </h3>
                    <p className="text-[10px] text-green-600 font-medium">Assistente Comercial</p>
                  </div>
                </div>

                {/* Corpo das Mensagens do Chat */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 bg-[#FAF6F0] p-4 overflow-y-auto space-y-3 flex flex-col justify-between" 
                  style={{ backgroundImage: 'radial-gradient(#F0E6DC 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                >
                  <div className="space-y-3 flex-1">
                    <div className="text-center my-1">
                      <span className="bg-[#EBE0D5] text-[#7D6B63] text-[9px] px-2.5 py-0.5 rounded font-medium">HOJE</span>
                    </div>

                    {chatMessages.map((msg, index) => (
                      <div key={index} className="flex flex-col">
                        <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                          msg.sender === 'client' 
                            ? 'bg-[#E5A8A3] text-white rounded-tr-none shadow-sm ml-auto text-right' 
                            : 'bg-white text-[#4A3F3B] rounded-tl-none shadow-xs border border-[#F0E6DC] mr-auto text-left'
                        }`}>
                          <p>{msg.text}</p>
                          
                          {msg.showLinkTrigger && (
                            <button 
                              onClick={() => {
                                showToast("Carregando a agenda...", "info");
                                setActiveTab('booking');
                              }}
                              className="mt-3 w-full bg-[#FAF6F0] border border-[#E5A8A3] hover:bg-white text-[#B57C74] font-bold py-2 px-3 rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs"
                            >
                              <CalendarIcon className="w-3.5 h-3.5" />
                              ABRIR AGENDA ONLINE
                            </button>
                          )}
                        </div>

                        {msg.isOptions && (
                          <div className="mt-2 w-full space-y-1.5 pl-2">
                            <button 
                              onClick={() => handleSendChatMessage('1. Marcar Novo Serviço', true)}
                              className="block w-full bg-white hover:bg-[#FAF6F0] text-[#B57C74] border border-[#F0E6DC] py-2 px-3 rounded-lg text-left text-[11px] font-medium transition-all"
                            >
                              💅 1. Marcar Novo Serviço
                            </button>
                            <button 
                              onClick={() => handleSendChatMessage('2. Manutenção ou Remoção', true)}
                              className="block w-full bg-white hover:bg-[#FAF6F0] text-[#B57C74] border border-[#F0E6DC] py-2 px-3 rounded-lg text-left text-[11px] font-medium transition-all"
                            >
                              🔄 2. Manutenção ou Remoção
                            </button>
                            <button 
                              onClick={() => handleSendChatMessage('3. Ver Localização', true)}
                              className="block w-full bg-white hover:bg-[#FAF6F0] text-[#B57C74] border border-[#F0E6DC] py-2 px-3 rounded-lg text-left text-[11px] font-medium transition-all"
                            >
                              📍 3. Ver Localização
                            </button>
                            <button 
                              onClick={() => handleSendChatMessage('4. Falar com Atendente', true)}
                              className="block w-full bg-white hover:bg-[#FAF6F0] text-[#B57C74] border border-[#F0E6DC] py-2 px-3 rounded-lg text-left text-[11px] font-medium transition-all"
                            >
                              👩‍🎨 4. Falar com Atendente
                            </button>
                          </div>
                        )}
                        <span className={`text-[9px] text-[#9E8B83] mt-1 px-1 ${msg.sender === 'client' ? 'text-right ml-auto' : 'text-left mr-auto'}`}>{msg.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rodapé de Mensagem */}
                <div className="bg-white p-3 border-t border-[#F0E6DC] flex gap-2 items-center">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Escreva uma mensagem..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage(chatInput)}
                    className="flex-1 bg-[#FAF6F0] text-xs px-3 py-2 rounded-full border border-[#EBE0D5] focus:outline-none focus:ring-1 focus:ring-[#E5A8A3]"
                  />
                  <button 
                    onClick={() => handleSendChatMessage(chatInput)}
                    className="w-8 h-8 rounded-full bg-[#E5A8A3] flex items-center justify-center text-white hover:bg-[#DCA19C] shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= ABA: PLATAFORMA DE AGENDAMENTO (CLIENTE) ================= */}
        {activeTab === 'booking' && (
          <div className="max-w-3xl mx-auto">
            <BookingWizard services={services} appointments={appointments} onComplete={handleCreateAppointment} />
          </div>
        )}

        {/* ================= ABA: PAINEL PROFISSIONAL (ADMIN) ================= */}
        {activeTab === 'admin' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* TELA DE LOGIN DE SEGURANÇA */}
            {!isAdminLoggedIn ? (
              <div className="bg-white p-8 rounded-2xl border border-[#F0E6DC] shadow-sm max-w-md mx-auto text-center space-y-6 mt-12">
                <div className="w-12 h-12 bg-[#F7E6E3] rounded-full flex items-center justify-center mx-auto text-[#B57C74]">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif-elegant text-[#4A3F3B]">Acesso Exclusivo Brenda</h3>
                  <p className="text-xs text-[#9E8B83] mt-2">Esta área contém dados confidenciais das clientes. Introduza a senha profissional para acessar.</p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Digite a sua senha"
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value.replace(/\D/g, ''));
                        if(loginError) setLoginError(false);
                      }}
                      className="w-full bg-[#FAF6F0] text-xs px-4 py-3 rounded-xl border border-[#F0E6DC] focus:outline-none pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9E8B83]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {loginError && (
                    <div className="text-left bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Senha incorreta. Acesso negado!</span>
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-[#E5A8A3] hover:bg-[#DCA19C] text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs"
                  >
                    Entrar no Painel Seguro
                  </button>
                </form>
              </div>
            ) : (
              /* CONTEÚDO LIBERADO DO PAINEL ADMIN */
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-[#F0E6DC] shadow-xs">
                  <div>
                    <h2 className="text-xl font-bold font-serif-elegant text-[#4A3F3B]">Gestão de Agendamentos - Brenda Heredia</h2>
                    <p className="text-xs text-[#7D6B63] mt-1">Consulte os horários agendados pelas clientes e envie os lembretes de confirmação rápidos.</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setIsAdminLoggedIn(false);
                      setAdminPassword('');
                      showToast("Sessão profissional encerrada.", "info");
                    }}
                    className="text-xs text-[#9E8B83] hover:text-rose-500 font-semibold underline"
                  >
                    Bloquear Painel (Sair)
                  </button>
                </div>

                {/* Grid de Estatísticas Rápidas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-[#F0E6DC] flex items-center justify-between shadow-xs">
                    <div>
                      <p className="text-[11px] text-[#9E8B83] font-semibold uppercase tracking-wider">Total de Agendamentos</p>
                      <h3 className="text-2xl font-bold font-serif-elegant text-[#4A3F3B] mt-1">{appointments.length}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#F7E6E3] flex items-center justify-center text-[#B57C74]">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-[#F0E6DC] flex items-center justify-between shadow-xs">
                    <div>
                      <p className="text-[11px] text-[#9E8B83] font-semibold uppercase tracking-wider">Pendentes de Confirmação</p>
                      <h3 className="text-2xl font-bold font-serif-elegant text-[#4A3F3B] mt-1">
                        {appointments.filter(app => app.status === 'Pendente').length}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#F0E6DC] flex items-center justify-between shadow-xs">
                    <div>
                      <p className="text-[11px] text-[#9E8B83] font-semibold uppercase tracking-wider">Faturamento Estimado</p>
                      <h3 className="text-2xl font-bold font-serif-elegant text-emerald-700 mt-1">
                        R$ {appointments.reduce((sum, item) => sum + (item.price || 0), 0)},00
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Listagem de Horários */}
                <div className="bg-white rounded-2xl border border-[#F0E6DC] shadow-xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#F0E6DC] flex justify-between items-center bg-[#FAF6F0]/50">
                    <h4 className="text-xs font-bold text-[#4A3F3B] uppercase tracking-wider">Próximos Atendimentos</h4>
                    <span className="text-[10px] text-[#9E8B83] bg-white px-2 py-1 rounded border border-[#F0E6DC] font-medium">Ordenado por data</span>
                  </div>

                  {appointments.length === 0 ? (
                    <div className="p-12 text-center">
                      <Smile className="w-12 h-12 text-[#E5A8A3] mx-auto opacity-70" />
                      <h5 className="text-sm font-bold text-[#4A3F3B] mt-4">Nenhum agendamento na sua lista</h5>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F0E6DC]">
                      {appointments.map((appointment) => {
                        const parsedDate = new Date(appointment.dateTime);
                        const formattedDate = !isNaN(parsedDate) 
                          ? parsedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
                          : 'Data inválida';
                        const formattedTime = !isNaN(parsedDate)
                          ? parsedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                          : 'Hora inválida';

                        const zapMessage = "Oie " + appointment.clientName + "! \u2728 Aqui é a Brenda Heredia. Passando para confirmar o seu horário de " + appointment.serviceName + " no dia " + formattedDate + " às " + formattedTime + ". Está tudo de pé? \ud83c\udf38\ud83d\udc85";

                        return (
                          <div key={appointment.id} className="p-6 hover:bg-[#FAF6F0]/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#4A3F3B]">{appointment.clientName}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  appointment.clientType === 'Novata' ? 'bg-[#F7E6E3] text-[#B57C74]' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {appointment.clientType || 'Cliente'}
                                </span>
                              </div>
                              
                              <div className="text-xs text-[#7D6B63] space-y-0.5">
                                <p className="flex items-center gap-1.5">
                                  <span className="font-semibold text-[#8C6D62]">{appointment.serviceName}</span>
                                  <span>•</span>
                                  <span>R$ {appointment.price},00</span>
                                </p>
                                <p className="flex items-center gap-1 text-[#9E8B83]">
                                  <CalendarIcon className="w-3.5 h-3.5 text-[#B57C74]" /> {formattedDate} às {formattedTime}
                                </p>
                                {appointment.notes && (
                                  <p className="italic text-[11px] text-[#A6948E] mt-1">Obs: "{appointment.notes}"</p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                              <a 
                                href={`https://wa.me/${appointment.clientPhone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(zapMessage)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#FAF6F0] hover:bg-[#F2E5D9] text-[#B57C74] border border-[#E5A8A3] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Enviar Lembrete
                              </a>

                              {appointment.status === 'Pendente' ? (
                                <button 
                                  onClick={() => handleUpdateStatus(appointment.id, 'Confirmado')}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Confirmar
                                </button>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5" /> Confirmado
                                </span>
                              )}

                              <button 
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                className="p-1.5 text-[#A6948E] hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* --- RODAPÉ INSTITUCIONAL --- */}
      <footer className="bg-white border-t border-[#F0E6DC] py-6 px-4 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#9E8B83]">
          <p>© 2026 Brenda Heredia Beauty. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <span>Sistema Inteligente de Automação e Agendamento</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

// ================= COMPONENTE DE PROCESSO: AGENDAMENTO ONLINE (WIZARD) =================
function BookingWizard({ services, appointments, onComplete }) {
  const [step, setStep] = useState(1); 
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientType, setClientType] = useState('Novata'); 
  const [notes, setNotes] = useState('');

  // Estados de navegação do calendário mensal completo (Maio 2026)
  const todayDate = new Date(2026, 4, 27); 
  const [viewDate, setViewDate] = useState(new Date(2026, 4, 1)); 

  const categories = ['Novos & Blindagem', 'Manutenções', 'Remoções e Extras'];

  const getCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const blanks = Array(firstDayIndex).fill(null);
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);

    return [...blanks, ...days];
  };

  const isDateDisabled = (dayNum) => {
    if (!dayNum) return true;
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const checkDate = new Date(year, month, dayNum);
    const dayOfWeek = checkDate.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) return true;

    const pureCheck = new Date(year, month, dayNum).setHours(0,0,0,0);
    const pureToday = new Date(2026, 4, 27).setHours(0,0,0,0);
    
    if (pureCheck < pureToday) return true;

    if (pureCheck === pureToday) {
      const slotsHoje = getAvailableTimeSlots(`${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`, true);
      if (slotsHoje.length === 0) return true; 
    }

    const maxDate = new Date(2026, 4, 27);
    maxDate.setDate(maxDate.getDate() + 30);
    if (checkDate > maxDate) return true;

    return false;
  };

  const getAvailableTimeSlots = (dateStr, ignoreOverride = false) => {
    if (!dateStr || (!selectedService && !ignoreOverride)) return [];
    
    const [year, month, dayNum] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, dayNum);
    const day = date.getDay(); 
    
    let baseSlots = [];
    
    if (day === 5) { 
      baseSlots = ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30', '17:00'];
    } else { 
      baseSlots = ['10:00', '11:30', '13:00', '14:30', '16:00'];
    }

    const timeToMins = (t) => {
      if (!t) return 0;
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const durToMins = (d) => {
      if (!d) return 0;
      const [h, m] = d.replace('h', ':').split(':').map(Number);
      return h * 60 + (m || 0);
    };

    const currentDuration = selectedService ? durToMins(selectedService.duration) : 90;

    const agoraMins = 23 * 60 + 1; 
    const pureTodayStr = "2026-05-27";

    return baseSlots.filter((slotTime) => {
      const slotStart = timeToMins(slotTime);
      const slotEnd = slotStart + currentDuration;

      if (dateStr === pureTodayStr) {
        if (slotStart <= agoraMins) return false;
      }

      const isOverlapping = appointments && appointments.some((app) => {
        const appDate = app.dateTime.split('T')[0];
        if (appDate !== dateStr) return false;
        if (app.status === 'Cancelado') return false;

        const appTime = app.dateTime.split('T')[1];
        const appStart = timeToMins(appTime);

        const existingService = services.find((s) => s.id === app.serviceId || s.name === app.serviceName);
        const existingDuration = existingService ? durToMins(existingService.duration) : 120; 

        const appEnd = appStart + existingDuration;

        return (slotStart < appEnd && slotEnd > appStart);
      });

      return !isOverlapping;
    });
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedService) return;
    if (step === 2 && (!selectedDate || !selectedTime)) return;
    setStep(step + 1);
  };

  const handleBackStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    const dateTimeCombined = `${selectedDate}T${selectedTime}`;

    onComplete({
      clientName,
      clientPhone,
      clientType,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      dateTime: dateTimeCombined,
      price: selectedService.price,
      notes
    });

    setStep(4);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setClientName('');
    setClientPhone('');
    setClientType('Novata');
    setNotes('');
    setViewDate(new Date(2026, 4, 1));
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#F0E6DC] shadow-sm overflow-hidden">
      
      <div className="bg-[#FAF6F0] p-4 border-b border-[#F0E6DC] flex justify-between items-center px-6">
        <span className="text-[11px] uppercase tracking-wider font-bold text-[#8C6D62] font-serif-elegant">Brenda Heredia Beauty</span>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((num) => (
            <div 
              key={num} 
              className={`w-5 h-1.5 rounded-full transition-all duration-300 ${
                step >= num ? 'bg-[#E5A8A3]' : 'bg-[#EBE0D5]'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8">
        
        {/* ================= PASSO 1: ESCOLHA DO SERVIÇO ================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center max-w-md mx-auto">
              <h3 className="text-xl font-bold font-serif-elegant text-[#4A3F3B]">O que vamos fazer nas suas unhas hoje?</h3>
              <p className="text-xs text-[#9E8B83] mt-1">Selecione o serviço desejado. Novos alongamentos necessitam de mais tempo de aplicação.</p>
            </div>

            <div className="space-y-6">
              {categories.map((cat) => (
                <div key={cat} className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#B57C74] border-b pb-1">{cat}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {services
                      .filter(s => s.category === cat)
                      .map((service) => (
                        <div 
                          key={service.id}
                          onClick={() => setSelectedService(service)}
                          className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left flex flex-col justify-between h-36 ${
                            selectedService?.id === service.id 
                              ? 'border-[#E5A8A3] bg-[#FCF8F5] ring-1 ring-[#E5A8A3]' 
                              : 'border-[#F0E6DC] bg-white'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h5 className="text-xs font-bold text-[#4A3F3B]">
                                {service.name}
                              </h5>
                              <span className="text-xs font-bold text-[#8C6D62]">R$ {service.price},00</span>
                            </div>
                            <p className="text-[11px] text-[#9E8B83] mt-1 line-clamp-2 leading-relaxed">{service.desc}</p>
                          </div>
                          
                          <div className="flex items-center gap-1 text-[10px] text-[#A6948E] font-medium mt-2 pt-2 border-t border-[#FAF6F0]">
                            <Clock className="w-3 h-3 text-[#E5A8A3]" />
                            Duração prevista: {service.duration}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                disabled={!selectedService}
                onClick={handleNextStep}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                  selectedService 
                    ? 'bg-[#E5A8A3] text-white hover:bg-[#DCA19C]' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Escolher Data e Hora
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= PASSO 2: ESCOLHA DE DATA E HORA ================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center max-w-md mx-auto">
              <span className="text-xs text-[#B57C74] font-medium">{selectedService?.name} (Est. {selectedService?.duration})</span>
              <h3 className="text-xl font-bold font-serif-elegant text-[#4A3F3B]">Qual a sua disponibilidade?</h3>
              <p className="text-xs text-[#9E8B83] mt-1">Selecione o dia e a hora para o seu atendimento exclusivo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              
              {/* Calendário Mensal em Grade Completa */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-[#9E8B83] uppercase tracking-wider flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#B57C74]" /> Escolha o Dia
                  </label>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={handlePrevMonth}
                      disabled={viewDate.getMonth() === todayDate.getMonth() && viewDate.getFullYear() === todayDate.getFullYear()}
                      className="p-1 rounded bg-[#FAF6F0] hover:bg-[#EBE0D5] text-[#8C6D62] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-[#4A3F3B] min-w-[80px] text-center">
                      {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </span>
                    <button 
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 rounded bg-[#FAF6F0] hover:bg-[#EBE0D5] text-[#8C6D62] transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="border border-[#F0E6DC] rounded-xl p-3 bg-white">
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#9E8B83] mb-2 border-b border-[#FAF6F0] pb-1.5">
                    <span>Dom</span>
                    <span>Seg</span>
                    <span>Ter</span>
                    <span>Qua</span>
                    <span>Qui</span>
                    <span>Sex</span>
                    <span>Sáb</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {getCalendarDays().map((day, idx) => {
                      if (day === null) {
                        return <div key={`empty-${idx}`} className="h-9"></div>;
                      }

                      const dateValStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const disabled = isDateDisabled(day);
                      const isSelected = selectedDate === dateValStr;

                      return (
                        <button
                          key={`day-${day}`}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            setSelectedDate(dateValStr);
                            setSelectedTime(''); 
                          }}
                          className={`h-9 w-full rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-[#E5A8A3] text-white font-bold shadow-xs'
                              : disabled 
                                ? 'text-gray-300 bg-gray-50/50 cursor-not-allowed lines-through opacity-30'
                                : 'text-[#4A3F3B] hover:bg-[#FCF8F5] hover:text-[#B57C74] border border-[#FAF6F0]'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Slots de Horários Disponíveis */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-[#9E8B83] uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#B57C74]" /> Horários Livres
                </label>
                
                {selectedDate ? (
                  <div className="grid grid-cols-2 gap-2">
                    {getAvailableTimeSlots(selectedDate).map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-3 px-4 rounded-xl border text-center font-medium text-xs ${
                          selectedTime === slot
                            ? 'border-[#E5A8A3] bg-[#FCF8F5] text-[#B57C74] font-bold'
                            : 'border-[#F0E6DC] bg-white hover:border-[#E5A8A3]'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                    {getAvailableTimeSlots(selectedDate).length === 0 && (
                      <div className="col-span-2 p-4 text-center border border-[#FAF6F0] rounded-xl bg-rose-50/50">
                        <AlertCircle className="w-5 h-5 text-rose-400 mx-auto" />
                        <p className="text-xs text-rose-700 mt-2 font-medium">Não há horários livres com folga suficiente para este dia ou os horários de hoje já passaram.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-44 rounded-xl border border-[#F0E6DC] border-dashed flex flex-col items-center justify-center p-4 text-center bg-[#FAF6F0]/20">
                    <CalendarIcon className="w-8 h-8 text-[#A6948E] opacity-50" />
                    <p className="text-xs text-[#9E8B83] mt-2">Por favor, selecione primeiro um dia no calendário mensal para carregar os horários livres.</p>
                  </div>
                )}
              </div>

            </div>

            <div className="pt-6 border-t border-[#F0E6DC] flex justify-between">
              <button
                onClick={handleBackStep}
                className="px-4 py-2 text-xs font-semibold text-[#7D6B63] hover:text-[#4A3F3B]"
              >
                Voltar
              </button>
              
              <button
                disabled={!selectedDate || !selectedTime}
                onClick={handleNextStep}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                  selectedDate && selectedTime 
                    ? 'bg-[#E5A8A3] text-white hover:bg-[#DCA19C]' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Confirmar Dados de Contato
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= PASSO 3: DADOS DE CONTATO E CONFIRMAÇÃO ================= */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center max-w-md mx-auto">
              <h3 className="text-xl font-bold font-serif-elegant text-[#4A3F3B]">Só precisamos do seu contato!</h3>
              <p className="text-xs text-[#9E8B83] mt-1">Preencha o seu nome e celular para podermos enviar o lembrete de confirmação de segurança.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#9E8B83] uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#B57C74]" /> Nome Completo
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Ana Souza"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-white text-xs px-3.5 py-3 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-1 focus:ring-[#E5A8A3]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#9E8B83] uppercase tracking-wider flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-[#B57C74]" /> Celular (WhatsApp)
                </label>
                
