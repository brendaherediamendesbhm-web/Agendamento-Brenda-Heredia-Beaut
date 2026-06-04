import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar as CalendarIcon, Clock, User, CheckCircle, Sparkles, MessageSquare, 
  ChevronRight, Trash2, Smile, Smartphone, TrendingUp, ClipboardList,
  AlertCircle, Check, Send, Lock, Eye, EyeOff, ChevronLeft
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
        body { font-family: 'Inter', sans-serif; background-color: #FAF6F0; }
        .font-serif-elegant { font-family: 'Playfair Display', serif; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #FAF6F0; }
        ::-webkit-scrollbar-thumb { background: #E5A8A3; border-radius: 10px; }
      `;
      document.head.appendChild(style);
    }
  }
};

export default function App() {
  useEffect(() => { injectStyles(); }, []);

  // --- ESTADOS GLOBAIS ---
  const [activeTab, setActiveTab] = useState('simulator'); 
  const [appointments, setAppointments] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success'); 

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false); 

  const services = [
    { id: 'esmaltacao_gel', name: 'Esmaltação em Gel', category: 'Novos & Blindagem', duration: '1h30', price: 20, desc: 'Aplicação de esmalte in gel premium com secagem na cabine LED. Brilho duradouro por semanas sem descascar.' },
    { id: 'banho_gel', name: 'Banho de Gel', category: 'Novos & Blindagem', duration: '2h45', price: 20, desc: 'Ideal para blindar e fortalecer o crescimento das unhas naturais com camada de gel premium.' },
    { id: 'along_f1', name: 'Alongamento Molde F1', category: 'Novos & Blindagem', duration: '3h00', price: 30, desc: 'Extensão rápida e sofisticada utilizando a técnica moderna do Molde F1.' },
    { id: 'manut_banho', name: 'Manutenção de Banho de Gel', category: 'Manutenções', duration: '2h15', price: 10, desc: 'Manutenção periódica para repor a estrutura do gel nas unhas em crescimento.' },
    { id: 'manut_f1', name: 'Manutenção de Molde F1', category: 'Manutenções', duration: '2h30', price: 20, desc: 'Nivelamento e reposicionamento do alongamento feito na técnica F1.' },
    { id: 'remocao', name: 'Remoção de Gel / Alongamento', category: 'Remoções e Extras', duration: '1h00', price: 15, desc: 'Retirada segura do produto sem danificar a base da unha natural.' },
    { id: 'conserto', name: 'Conserto de Unha Avulsa', category: 'Remoções e Extras', duration: '0h30', price: 5, desc: 'Reparação de emergência para uma unha partida ou danificada.' }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('dotto_appointments');
    if (saved) { try { setAppointments(JSON.parse(saved)); } catch (e) { setAppointments([]); } }
  }, []);

  const saveAppointmentsState = (newList) => {
    setAppointments(newList);
    localStorage.setItem('dotto_appointments', JSON.stringify(newList));
  };

  const showToast = (message, type = 'success') => {
    setToastMessage(message); setToastType(type);
    setTimeout(() => { setToastMessage(null); }, 4500);
  };

  const handleCreateAppointment = async (appointmentData) => {
    const newAppointment = { ...appointmentData, status: 'Pendente', createdAt: new Date().toISOString() };
    const localList = [...appointments, { id: 'local-' + Date.now(), ...newAppointment }];
    saveAppointmentsState(localList);
    showToast("Agendamento realizado com sucesso!", "success");
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const updated = appointments.map(app => app.id === id ? { ...app, status: newStatus } : app);
    saveAppointmentsState(updated);
    showToast(`Agendamento updated para ${newStatus}!`, "success");
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
    if (chatContainerRef.current) { chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; }
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
        botResponse.push({ sender: 'bot', text: 'Entendido! 🌸 Estou te redirecionando agora mesmo para o WhatsApp pessoal da Brenda para que você tire suas dúvidas direto com ela.', time: 'Agora' });
        botResponse.push({ sender: 'bot', text: 'Se a nova aba não abrir em instantes, você também pode clicar no botão de suporte abaixo:', time: 'Agora', showWhatsAppRedirect: true });
        setTimeout(() => {
          const personalZapUrl = `https://wa.me/5567993312746?text=${encodeURIComponent("Olá, Brenda! ✨ Estava usando o seu assistente virtual no site e gostaria de tirar uma dúvida com você sobre os serviços de unhas! ❤️")}`;
          window.open(personalZapUrl, '_blank');
        }, 1200);
      } else {
        botResponse.push({ sender: 'bot', text: 'Por favor, escolha uma das opções do menu para que eu possa ajudar da melhor forma. 💕', time: 'Agora', isOptions: true });
      }
      setChatMessages(prev => [...prev, ...botResponse]);
    }, 1000);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === '23181213') {
      setIsAdminLoggedIn(true); setLoginError(false);
      showToast("Acesso autorizado! Bem-vinda, Brenda.", "success");
    } else {
      setLoginError(true); showToast("Senha incorreta. Acesso negado.", "error");
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
            <h1 className="text-2xl font-bold font-serif-elegant tracking-widest text-[#8C6D62] flex items-center gap-2 justify-center md:justify-start">
              BRENDA HEREDIA <span className="text-xs bg-[#F7E6E3] text-[#B57C74] font-sans px-2.5 py-0.5 rounded-full font-medium tracking-normal">BOT + AGENDA</span>
            </h1>
            <p className="text-xs text-[#9E8B83] mt-0.5 tracking-wider uppercase font-medium">Nails Studio</p>
          </div>
          <nav className="flex bg-[#FAF6F0] p-1 rounded-full border border-[#EBE0D5] w-full md:w-auto overflow-x-auto">
            <button onClick={() => setActiveTab('simulator')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${activeTab === 'simulator' ? 'bg-[#E5A8A3] text-white shadow-sm' : 'text-[#7D6B63]'}`}><Smartphone className="w-4 h-4" />Simulador WhatsApp Bot</button>
            <button onClick={() => setActiveTab('booking')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${activeTab === 'booking' ? 'bg-[#E5A8A3] text-white shadow-sm' : 'text-[#7D6B63]'}`}><CalendarIcon className="w-4 h-4" />Agenda Online (Cliente)</button>
            <button onClick={() => setActiveTab('admin')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === 'admin' ? 'bg-[#E5A8A3] text-white shadow-sm' : 'text-[#7D6B63]'}`}><Lock className="w-3.5 h-3.5" />Painel Profissional (Admin)</button>
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
                <p className="text-sm text-[#7D6B63] mt-3 leading-relaxed">Seja muito bem-vinda! Desenvolvemos essa ferramenta para você escolher seus procedimentos prediletos e reservar o seu momento de autocuidado de forma rápida.</p>
                <div className="mt-6 space-y-4">
                  <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-[#FAF6F0] flex items-center justify-center text-xs font-bold text-[#B57C74] shrink-0 border border-[#F0E6DC]">1</div><div><h4 className="text-xs font-bold text-[#4A3F3B]">Escolha no Chat ao lado</h4><p className="text-xs text-[#7D6B63] mt-0.5">Selecione uma das opções numéricas no painel do celular simulado para ver valores.</p></div></div>
                  <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-[#FAF6F0] flex items-center justify-center text-xs font-bold text-[#B57C74] shrink-0 border border-[#F0E6DC]">2</div><div><h4 className="text-xs font-bold text-[#4A3F3B]">Abra a Agenda Online</h4><p className="text-xs text-[#7D6B63] mt-0.5">Clique no botão "ABRIR AGENDA ONLINE" enviado pela assistente.</p></div></div>
                </div>
                <div className="mt-8 pt-6 border-t border-[#F0E6DC] text-center">
                  <button onClick={() => setActiveTab('booking')} className="w-full bg-[#E5A8A3] hover:bg-[#DCA19C] text-white py-3 px-4 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2">Ir Direto para a Agenda Online<ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-[380px] bg-white rounded-[40px] border-[10px] border-[#4A3F3B] shadow-2xl overflow-hidden flex flex-col h-[640px] relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-5 w-36 bg-[#4A3F3B] rounded-b-2xl z-10 flex items-center justify-center"><div className="w-12 h-1 bg-gray-600 rounded-full"></div></div>
                <div className="bg-[#FAF6F0] border-b border-[#F0E6DC] pt-8 pb-3 px-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E5A8A3] flex items-center justify-center text-white font-bold relative shrink-0">B<div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div></div>
                  <div><h3 className="text-xs font-bold text-[#4A3F3B]">Brenda Heredia ✨</h3><p className="text-[10px] text-green-600 font-medium">Assistente Comercial</p></div>
                </div>
                <div ref={chatContainerRef} className="flex-1 bg-[#FAF6F0] p-4 overflow-y-auto space-y-3 flex flex-col justify-between" style={{ backgroundImage: 'radial-gradient(#F0E6DC 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
                  <div className="space-y-3 flex-1">
                    {chatMessages.map((msg, index) => (
                      <div key={index} className="flex flex-col">
                        <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${msg.sender === 'client' ? 'bg-[#E5A8A3] text-white rounded-tr-none shadow-sm ml-auto' : 'bg-white text-[#4A3F3B] rounded-tl-none shadow-xs border border-[#F0E6DC] mr-auto'}`}><p>{msg.text}</p>
                          {msg.showLinkTrigger && <button onClick={() => setActiveTab('booking')} className="mt-3 w-full bg-[#FAF6F0] border border-[#E5A8A3] text-[#B57C74] font-bold py-2 px-3 rounded-lg text-[11px] flex items-center justify-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" />ABRIR AGENDA ONLINE</button>}
                          {msg.showWhatsAppRedirect && <a href={`https://wa.me/5567993312746?text=${encodeURIComponent("Olá!")}`} target="_blank" rel="noopener noreferrer" className="mt-3 w-full bg-[#25D366] text-white font-bold py-2 px-3 rounded-lg text-[11px] flex items-center justify-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" />ABRIR WHATSAPP</a>}
                        </div>
                        {msg.isOptions && (
                          <div className="mt-2 w-full space-y-1.5 pl-2">
                            <button onClick={() => handleSendChatMessage('1. Marcar Novo Serviço', true)} className="block w-full bg-white border border-[#F0E6DC] py-2 px-3 rounded-lg text-left text-[11px] font-medium">💅 1. Marcar Novo Serviço</button>
                            <button onClick={() => handleSendChatMessage('2. Manutenção ou Remoção', true)} className="block w-full bg-white border border-[#F0E6DC] py-2 px-3 rounded-lg text-left text-[11px] font-medium">🔄 2. Manutenção ou Remoção</button>
                            <button onClick={() => handleSendChatMessage('3. Ver Localização', true)} className="block w-full bg-white border border-[#F0E6DC] py-2 px-3 rounded-lg text-left text-[11px] font-medium">📍 3. Ver Localização</button>
                            <button onClick={() => handleSendChatMessage('4. Falar com Atendente', true)} className="block w-full bg-white border border-[#F0E6DC] py-2 px-3 rounded-lg text-left text-[11px] font-medium">👩‍🎨 4. Falar com Atendente</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-3 border-t border-[#F0E6DC] flex gap-2 items-center">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Escreva..." onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage(chatInput)} className="flex-1 bg-[#FAF6F0] text-xs px-3 py-2 rounded-full border border-[#EBE0D5] focus:outline-none" />
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
              <div className="bg-white p-8 rounded-2xl border border-[#F0E6DC] shadow-sm max-w-md mx-auto text-center space-y-6 mt-12">
                <div className="w-12 h-12 bg-[#F7E6E3] rounded-full flex items-center justify-center mx-auto text-[#B57C74]"><Lock className="w-6 h-6" /></div>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <input type={showPassword ? "text" : "password"} placeholder="Senha" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full bg-[#FAF6F0] text-xs px-4 py-3 rounded-xl border border-[#F0E6DC]" />
                  <button type="submit" className="w-full bg-[#E5A8A3] text-white py-2.5 rounded-xl text-xs font-bold uppercase">Entrar</button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Painel Administrativo Original Completo */}
                <div className="bg-white p-6 rounded-2xl border border-[#F0E6DC] flex justify-between items-center">
                  <div><h2 className="text-xl font-bold font-serif-elegant">Gestão de Agendamentos</h2></div>
                  <button onClick={() => setIsAdminLoggedIn(false)} className="text-xs text-[#9E8B83] underline">Sair</button>
                </div>
                {/* Listagem de horários cadastrados */}
              </div>
            )}
          </div>
        )}
      </main>
      <footer className="bg-white border-t border-[#F0E6DC] py-6 px-4 mt-12 text-center text-xs text-[#9E8B83]"><p>© 2026 Brenda Heredia Beauty. Todos os direitos reservados.</p></footer>
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

  const [viewDate, setViewDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); 
  const categories = ['Novos & Blindagem', 'Manutenções', 'Remoções e Extras'];

  const getCalendarDays = () => {
    const year = viewDate.getFullYear(); const month = viewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return [...Array(firstDayIndex).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    const formattedDateForSheet = selectedDate.split('-').reverse().join('/') + ' ' + selectedTime;
    const googleScriptUrl = "https://script.google.com/macros/s/AKfycbwVkoKqFrEXGcWYUCQbE_Odsl9Z4utG4hXVWwSlqUV3-OqZVXO3smV3CpD4iRCXhT1w/exec";
    
    const payload = {
      clientName,
      clientPhone,
      serviceName: selectedService.name,
      dateTime: formattedDateForSheet,
      price: `R$ ${selectedService.price},00`,
      clientType,
      notes: notes || "Sem observações"
    };

    try {
      // 1. Envia direto para a Planilha do Google
      await fetch(googleScriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // 2. Envia a notificação estruturada direto para o Telegram
      const telegramBotToken = "7449298375:AAF9Z-N386zExBq_Yt6PzV_3_lOd6K9qU1M";
      const telegramChatId = "6020583192";
      const telegramText = `💅 *Novo Agendamento!*\n\n👤 *Cliente:* ${payload.clientName}\n📱 *Contato:* ${payload.clientPhone}\n✨ *Procedimento:* ${payload.serviceName}\n📅 *Data/Hora:* ${payload.dateTime}\n💰 *Valor:* ${payload.price}\n📝 *Obs:* ${payload.notes}`;
      
      await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: telegramChatId, text: telegramText, parse_mode: "Markdown" })
      });
    } catch (err) {
      console.log("Erro na integração:", err);
    }

    onComplete({ clientName, clientPhone, clientType, serviceId: selectedService.id, serviceName: selectedService.name, dateTime: `${selectedDate}T${selectedTime}`, price: selectedService.price, notes });
    setStep(4);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#F0E6DC] shadow-sm overflow-hidden">
      <div className="bg-[#FAF6F0] p-4 border-b border-[#F0E6DC] flex justify-between items-center px-6">
        <span className="text-[11px] uppercase tracking-wider font-bold text-[#8C6D62] font-serif-elegant">Brenda Heredia Beauty</span>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((num) => (
            <div key={num} className={`w-5 h-1.5 rounded-full transition-all duration-300 ${step >= num ? 'bg-[#E5A8A3]' : 'bg-[#EBE0D5]'}`} />
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center max-w-md mx-auto">
              <h3 className="text-xl font-bold font-serif-elegant text-[#4A3F3B]">O que vamos fazer nas suas unhas hoje?</h3>
            </div>
            <div className="space-y-6">
              {categories.map((cat) => (
                <div key={cat} className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#B57C74] border-b pb-1">{cat}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {services.filter(s => s.category === cat).map((service) => (
                      <div key={service.id} onClick={() => setSelectedService(service)} className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-36 ${selectedService?.id === service.id ? 'border-[#E5A8A3] bg-[#FCF8F5] ring-1 ring-[#E5A8A3]' : 'border-[#F0E6DC] bg-white'}`}>
                        <div>
                          <div className="flex justify-between items-start gap-2"><h5 className="text-xs font-bold text-[#4A3F3B]">{service.name}</h5><span className="text-xs font-bold text-[#8C6D62]">R$ {service.price},00</span></div>
                          <p className="text-[11px] text-[#9E8B83] mt-1 line-clamp-2">{service.desc}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-[#A6948E] font-medium mt-2 pt-2 border-t border-[#FAF6F0]"><Clock className="w-3 h-3 text-[#E5A8A3]" />Duração: {service.duration}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 flex justify-end"><button disabled={!selectedService} onClick={() => setStep(2)} className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${selectedService ? 'bg-[#E5A8A3] text-white hover:bg-[#DCA19C]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>Escolher Horário <ChevronRight className="w-4 h-4 inline" /></button></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center max-w-md mx-auto"><h3 className="text-xl font-bold font-serif-elegant text-[#4A3F3B]">Qual a sua disponibilidade?</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between"><label className="text-[10px] font-bold text-[#9E8B83] uppercase tracking-wider flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5 text-[#B57C74]" /> Escolha o Dia</label></div>
                <div className="border border-[#F0E6DC] rounded-xl p-3 bg-white">
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#9E8B83] mb-2 border-b border-[#FAF6F0] pb-1.5"><span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span></div>
                  <div className="grid grid-cols-7 gap-1">
                    {getCalendarDays().map((day, idx) => {
                      if (day === null) return <div key={`empty-${idx}`} className="h-9"></div>;
                      const dateValStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      return (
                        <button key={`day-${day}`} type="button" onClick={() => { setSelectedDate(dateValStr); setSelectedTime(''); }} className={`h-9 w-full rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${selectedDate === dateValStr ? 'bg-[#E5A8A3] text-white font-bold' : 'text-[#4A3F3B] hover:bg-[#FCF8F5]'}`}>{day}</button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-[#9E8B83] uppercase tracking-wider flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#B57C74]" /> Horários Livres</label>
                {selectedDate ? (
                  <div className="grid grid-cols-2 gap-2">
                    {['08:00', '09:30', '11:00', '13:30', '15:00', '16:30', '18:00'].map((slot) => (
                      <button key={slot} type="button" onClick={() => setSelectedTime(slot)} className={`py-3 px-4 rounded-xl border text-center font-medium text-xs ${selectedTime === slot ? 'border-[#E5A8A3] bg-[#FCF8F5] text-[#B57C74] font-bold' : 'border-[#F0E6DC] bg-white hover:border-[#E5A8A3]'}`}>{slot}</button>
                    ))}
                  </div>
                ) : ( <div className="h-44 rounded-xl border border-[#F0E6DC] border-dashed flex flex-col items-center justify-center p-4 text-center bg-[#FAF6F0]/20"><p className="text-xs text-[#9E8B83]">Selecione um dia no calendário.</p></div> )}
              </div>
            </div>
            <div className="pt-6 border-t border-[#F0E6DC] flex justify-between"><button onClick={() => setStep(1)} className="px-4 py-2 text-xs font-semibold text-[#7D6B63]">Voltar</button><button disabled={!selectedDate || !selectedTime} onClick={() => setStep(3)} className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${selectedDate && selectedTime ? 'bg-[#E5A8A3] text-white' : 'bg-gray-100 text-gray-400'}`}>Prosseguir</button></div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center max-w-md mx-auto"><h3 className="text-xl font-bold font-serif-elegant text-[#4A3F3B]">Só precisamos do seu contato!</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-[#9E8B83] uppercase tracking-wider">Nome Completo</label><input type="text" required placeholder="Ex: Ana Souza" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full bg-white text-xs px-3.5 py-3 rounded-xl border border-[#F0E6DC]" /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-[#9E8B83] uppercase tracking-wider">Celular (WhatsApp)</label><input type="tel" required placeholder="Ex: (67) 99123-4567" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="w-full bg-white text-xs px-3.5 py-3 rounded-xl border border-[#F0E6DC]" /></div>
              <div className="space-y-1.5 md:col-span-2"><label className="text-[10px] font-bold text-[#9E8B83] uppercase tracking-wider">Observações (Opcional)</label><textarea rows="2" placeholder="Preferência de decoração..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-white text-xs p-3 rounded-xl border border-[#F0E6DC]" /></div>
            </div>
            <div className="pt-4 border-t border-[#F0E6DC] flex justify-between"><button type="button" onClick={() => setStep(2)} className="px-4 py-2 text-xs font-semibold text-[#7D6B63]">Voltar</button><button type="submit" className="bg-[#E5A8A3] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider">Efetuar Agendamento</button></div>
          </form>
        )}

        {step === 4 && (
          <div className="py-8 text-center space-y-6">
            <div className="w-16 h-16 bg-[#F7E6E3] rounded-full flex items-center justify-center mx-auto text-[#B57C74]"><Check className="w-8 h-8" /></div>
            <h3 className="text-2xl font-bold font-serif-elegant text-[#4A3F3B]">Agendado com Sucesso! 💅</h3>
            <p className="text-xs text-[#7D6B63]">Obrigada, sua vaga está garantida para o dia {selectedDate?.split('-').reverse().join('/')} às {selectedTime}.</p>
            <div className="pt-6"><button type="button" onClick={() => { setStep(1); setSelectedService(null); setSelectedDate(''); setSelectedTime(''); setClientName(''); setClientPhone(''); setNotes(''); }} className="bg-white border border-[#E5A8A3] text-[#B57C74] px-6 py-2.5 rounded-xl text-xs font-bold uppercase">Novo Agendamento</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
