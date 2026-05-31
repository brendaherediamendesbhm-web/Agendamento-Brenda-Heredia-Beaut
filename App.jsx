import React, { useState, useEffect, useRef } from 'react';

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

  useEffect(() => {
    const saved = localStorage.getItem('dotto_appointments');
    if (saved) {
      try { setAppointments(JSON.parse(saved)); } catch (e) { setAppointments([]); }
    }
  }, []);

  const saveAppointmentsState = (newList) => {
    setAppointments(newList);
    localStorage.setItem('dotto_appointments', JSON.stringify(newList));
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => { setToastMessage(null); }, 4500);
  };

  const handleCreateAppointment = (appointmentData) => {
    const newAppointment = {
      ...appointmentData,
      status: 'Pendente',
      createdAt: new Date().toISOString()
    };
    const localList = [...appointments, { id: 'local-' + Date.now(), ...newAppointment }];
    saveAppointmentsState(localList);
    showToast("Agendamento realizado com sucesso!");
  };

  const handleUpdateStatus = (id, newStatus) => {
    const updated = appointments.map(app => app.id === id ? { ...app, status: newStatus } : app);
    saveAppointmentsState(updated);
    showToast(`Agendamento atualizado para ${newStatus}!`);
  };

  const handleDeleteAppointment = (id) => {
    const filtered = appointments.filter(app => app.id !== id);
    saveAppointmentsState(filtered);
    showToast("Agendamento removido.");
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
      showToast("Acesso autorizado! Bem-vinda, Brenda.");
    } else {
      setLoginError(true); 
      showToast("Senha incorreta. Acesso negado.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#4A3F3B] flex flex-col antialiased">
      
      {toastMessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-full shadow-lg bg-white border border-[#E5A8A3]">
          <span className="text-sm font-medium text-[#4A3F3B]">✨ {toastMessage}</span>
        </div>
      )}

      <header className="bg-white border-b border-[#F0E6DC] py-4 px-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold font-serif-elegant tracking-widest text-[#8C6D62] flex items-center gap-2 justify-center md:justify-start">
              BRENDA HEREDIA <span className="text-xs bg-[#F7E6E3] text-[#B57C74] font-sans px-2.5 py-0.5 rounded-full font-medium">BOT + AGENDA</span>
            </h1>
            <p className="text-xs text-[#9E8B83] mt-0.5 tracking-wider uppercase font-medium">Nails Studio</p>
          </div>

          <nav className="flex bg-[#FAF6F0] p-1 rounded-full border border-[#EBE0D5] w-full md:w-auto overflow-x-auto">
            <button 
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${activeTab === 'simulator' ? 'bg-[#E5A8A3] text-white' : 'text-[#7D6B63]'}`}
            >
              📱 Simulador Bot
            </button>
            <button 
              onClick={() => setActiveTab('booking')}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${activeTab === 'booking' ? 'bg-[#E5A8A3] text-white' : 'text-[#7D6B63]'}`}
            >
              📅 Agenda Online
            </button>
            <button 
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${activeTab === 'admin' ? 'bg-[#E5A8A3] text-white' : 'text-[#7D6B63]'}`}
            >
              🔒 Painel Admin
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#F0E6DC] shadow-sm">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#B57C74] bg-[#F7E6E3] px-2 py-1 rounded">Agendamento Fácil</span>
                <h2 className="text-2xl font-serif-elegant text-[#4A3F3B] mt-3">Como garantir seu horário?</h2>
                <p className="text-sm text-[#7D6B63] mt-3 leading-relaxed">
                  Seja muito bem-vinda! Desenvolvemos essa ferramenta para você reservar seu momento de autocuidado de forma rápida.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FAF6F0] flex items-center justify-center text-xs font-bold text-[#B57C74] shrink-0 border border-[#F0E6DC]">1</div>
                    <p className="text-xs text-[#7D6B63]">Escolha as opções no chat ao lado para ver valores.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FAF6F0] flex items-center justify-center text-xs font-bold text-[#B57C74] shrink-0 border border-[#F0E6DC]">2</div>
                    <p className="text-xs text-[#7D6B63]">Abra a Agenda Online no topo ou pelo link enviado no robô.</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#F0E6DC]">
                  <button 
                    onClick={() => setActiveTab('booking')}
                    className="w-full bg-[#E5A8A3] text-white py-3 px-4 rounded-xl text-xs font-bold tracking-wider uppercase"
                  >
                    Ir Direto para a Agenda Online →
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-[380px] bg-white rounded-[40px] border-[10px] border-[#4A3F3B] shadow-2xl overflow-hidden flex flex-col h-[640px] relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-5 w-36 bg-[#4A3F3B] rounded-b-2xl z-10 flex items-center justify-center">
                  <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
                </div>

                <div className="bg-[#FAF6F0] border-b border-[#F0E6DC] pt-8 pb-3 px-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E5A8A3] flex items-center justify-center text-white font-bold relative shrink-0">
                    B
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#4A3F3B]">Brenda Heredia ✨</h3>
                    <p className="text-[10px] text-green-600 font-medium">Assistente Comercial</p>
                  </div>
                </div>

                <div 
                  ref={chatContainerRef}
                  className="flex-1 bg-[#FAF6F0] p-4 overflow-y-auto space-y-3 flex flex-col justify-between" 
                  style={{ backgroundImage: 'radial-gradient(#F0E6DC 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                >
                  <div className="space-y-3 flex-1">
                    {chatMessages.map((msg, index) => (
                      <div key={index} className="flex flex-col">
                        <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                          msg.sender === 'client' ? 'bg-[#E5A8A3] text-white ml-auto' : 'bg-white text-[#4A3F3B] border border-[#F0E6DC] mr-auto'
                        }`}>
                          <p>{msg.text}</p>
                          {msg.showLinkTrigger && (
                            <button 
                              onClick={() => setActiveTab('booking')}
                              className="mt-3 w-full bg-[#FAF6F0] border border-[#E5A8A3] text-[#B57C74] font-bold py-2 px-3 rounded-lg text-[11px]"
                            >
                              📅 ABRIR AGENDA ONLINE
                            </button>
                          )}
                        </div>

                        {msg.isOptions && (
                          <div className="mt-2 w-full space-y-1.5 pl-2">
                            {['1. Marcar Novo Serviço', '2. Manutenção ou Remoção', '3. Ver Localização', '4. Falar com Atendente'].map((opt, oIdx) => (
                              <button 
                                key={oIdx}
                                onClick={() => handleSendChatMessage(opt, true)}
                                className="block w-full bg-white text-[#B57C74] border border-[#F0E6DC] py-2 px-3 rounded-lg text-left text-[11px] font-medium"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-3 border-t border-[#F0E6DC] flex gap-2 items-center">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Escreva uma mensagem..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage(chatInput)}
                    className="flex-1 bg-[#FAF6F0] text-xs px-3 py-2 rounded-full border border-[#EBE0D5] focus:outline-none"
                  />
                  <button 
                    onClick={() => handleSendChatMessage(chatInput)}
                    className="w-8 h-8 rounded-full bg-[#E5A8A3] text-white flex items-center justify-center shrink-0 text-xs"
                  >
                    ➤
                  </button>
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
              <div className="bg-white p-8 rounded-2xl border border-[#F0E6DC] max-w-md mx-auto text-center space-y-4 mt-12">
                <h3 className="text-xl font-bold font-serif-elegant text-[#4A3F3B]">Acesso Exclusivo Brenda</h3>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite a sua senha"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value.replace(/\D/g, ''));
                      if(loginError) setLoginError(false);
                    }}
                    className="w-full bg-[#FAF6F0] text-xs px-4 py-3 rounded-xl border border-[#F0E6DC] focus:outline-none"
                  />
                  <button type="submit" className="w-full bg-[#E5A8A3] text-white py-2.5 rounded-xl text-xs font-bold uppercase">
                    Entrar
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#F0E6DC]">
                  <div>
                    <h2 className="text-xl font-bold font-serif-elegant text-[#4A3F3B]">Gestão de Agendamentos</h2>
                    <p className="text-xs text-[#7D6B63]">Faturamento Estimado: R$ {appointments.reduce((sum, item) => sum + (item.price || 0), 0)},00</p>
                  </div>
                  <button onClick={() => setIsAdminLoggedIn(false)} className="text-xs text-rose-500 underline font-semibold">Sair</button>
                </div>

                <div className="bg-white rounded-2xl border border-[#F0E6DC] overflow-hidden p-6 space-y-4">
                  {appointments.length === 0 ? (
                    <p className="text-center text-xs text-[#9E8B83]">Nenhum horário marcado ainda.</p>
                  ) : (
                    appointments.map((app) => {
                      const zapMessage = `Oie ${app.clientName}! ✨ Aqui é a Brenda Heredia. Passando para confirmar o seu horário de ${app.serviceName}. Está tudo de pé? 🌸💅`;
                      return (
                        <div key={app.id} className="p-4 border border-[#FAF6F0] rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold">{app.clientName} ({app.clientType})</p>
                            <p className="text-[#8C6D62] font-semibold">{app.serviceName} • R$ {app.price},00</p>
                          </div>
                          <div className="flex gap-2">
                            <a 
                              href={`https://wa.me/${app.clientPhone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(zapMessage)}`}
                              target="_blank" rel="noopener noreferrer"
                              className="bg-[#FAF6F0] border border-[#E5A8A3] text-[#B57C74] px-3 py-1.5 rounded-lg font-semibold"
                            >
                              💬 Lembrete
                            </a>
                            <button onClick={() => handleDeleteAppointment(app.id)} className="text-rose-500 font-bold px-2">✕</button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

// ================= COMPONENTE DE PROCESSO: WIZARD =================
function BookingWizard({ services, appointments, onComplete }) {
  const [step, setStep] = useState(1); 
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const getCalendarDays = () => {
    const blanks = Array(5).fill(null); // Ajuste básico para Maio 2026
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    return [...blanks, ...days];
  };

  const getAvailableTimeSlots = () => ['09:00', '10:30', '13:30', '15:00', '16:30'];

  return (
    <div className="bg-white rounded-2xl border border-[#F0E6DC] shadow-sm overflow-hidden p-6">
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-center font-bold font-serif-elegant text-[#4A3F3B]">Escolha o Serviço 💅</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map(s => (
              <div key={s.id} onClick={() => setSelectedService(s)} className={`p-4 border rounded-xl cursor-pointer ${selectedService?.id === s.id ? 'border-[#E5A8A3] bg-[#FCF8F5]' : 'border-[#F0E6DC]'}`}>
                <div className="flex justify-between font-bold text-xs">
                  <span>{s.name}</span>
                  <span>R$ {s.price},00</span>
                </div>
              </div>
            ))}
          </div>
          <button disabled={!selectedService} onClick={() => setStep(2)} className="w-full bg-[#E5A8A3] text-white py-2 rounded-xl text-xs font-bold uppercase disabled:opacity-50">Avançar</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-center font-bold font-serif-elegant text-[#4A3F3B]">Escolha Data e Hora</h3>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {getCalendarDays().map((day, idx) => day ? (
              <button key={idx} onClick={() => setSelectedDate(`2026-05-${day}`)} className={`h-8 rounded text-xs ${selectedDate.includes(`-${day}`) ? 'bg-[#E5A8A3] text-white' : 'bg-[#FAF6F0]'}`}>{day}</button>
            ) : <div key={idx}></div>)}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {getAvailableTimeSlots().map(t => (
              <button key={t} onClick={() => setSelectedTime(t)} className={`py-2 text-xs rounded border ${selectedTime === t ? 'border-[#E5A8A3] bg-[#FCF8F5]' : 'border-[#F0E6DC]'}`}>{t}</button>
            ))}
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(1)} className="text-xs underline text-[#7D6B63]">Voltar</button>
            <button disabled={!selectedDate || !selectedTime} onClick={() => setStep(3)} className="bg-[#E5A8A3] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase disabled:opacity-50">Próximo</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={(e) => {
          e.preventDefault();
          onComplete({ clientName, clientPhone, serviceName: selectedService.name, dateTime: `${selectedDate}T${selectedTime}`, price: selectedService.price, clientType: 'Novata' });
          setStep(4);
        }} className="space-y-4">
          <h3 className="text-center font-bold font-serif-elegant text-[#4A3F3B]">Seus Dados</h3>
          <input type="text" placeholder="Seu Nome" required value={clientName} onChange={e => setClientName(e.target.value)} className="w-full p-3 border rounded-xl text-xs focus:outline-none" />
          <input type="tel" placeholder="WhatsApp" required value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full p-3 border rounded-xl text-xs focus:outline-none" />
          <div className="flex justify-between pt-4">
            <button type="button" onClick={() => setStep(2)} className="text-xs underline text-[#7D6B63]">Voltar</button>
            <button type="submit" className="bg-[#E5A8A3] text-white px-6 py-2 rounded-xl text-xs font-bold uppercase">Finalizar</button>
          </div>
        </form>
      )}

      {step === 4 && (
        <div className="text-center py-6 space-y-3">
          <h3 className="text-xl font-bold font-serif-elegant text-[#4A3F3B]">Agendado com Sucesso! 💅</h3>
          <p className="text-xs text-[#7D6B63]">Vaga reservada para o dia <strong>{selectedDate.split('-').reverse().join('/')}</strong> às <strong>{selectedTime}</strong>.</p>
          <button onClick={() => setStep(1)} className="border border-[#E5A8A3] text-[#B57C74] px-4 py-2 rounded-xl text-xs font-bold uppercase mt-4">Novo Agendamento</button>
        </div>
      )}
    </div>
  );
}
