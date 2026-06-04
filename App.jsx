import React, { useState, useEffect } from 'react';
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
        body { font-family: 'Inter', sans-serif; background-color: #FAF6F0; margin: 0; padding: 0; } 
        .font-serif-elegant { font-family: 'Playfair Display', serif; } 
        ::-webkit-scrollbar { width: 5px; height: 5px; } 
        ::-webkit-scrollbar-thumb { background: #E5A8A3; border-radius: 10px; }
      `;
      document.head.appendChild(style);
    }
  }
};

export default function App() {
  useEffect(() => { injectStyles(); }, []);
  
  const [activeTab, setActiveTab] = useState('booking'); 
  const [appointments, setAppointments] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success'); 
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false); 

  const services = [
    { id: 'esmaltacao_gel', name: 'Esmaltação em Gel', category: 'Novos & Blindagem', duration: '1h30', price: 20, desc: 'Aplicação de esmalte em gel premium com secagem na cabine LED.' },
    { id: 'banho_gel', name: 'Banho de Gel', category: 'Novos & Blindagem', duration: '2h45', price: 20, desc: 'Blindar e fortalecer unhas naturais evitando quebras.' },
    { id: 'along_f1', name: 'Alongamento Molde F1', category: 'Novos & Blindagem', duration: '3h00', price: 30, desc: 'Extensão rápida e moderna utilizando a técnica de Molde F1.' },
    { id: 'manut_banho', name: 'Manutenção de Banho de Gel', category: 'Manutenções', duration: '2h15', price: 10, desc: 'Manutenção periódica para nivelamento e brilho.' },
    { id: 'manut_f1', name: 'Manutenção de Molde F1', category: 'Manutenções', duration: '2h30', price: 20, desc: 'Nivelamento técnico e manutenção estrutural do Molde F1.' },
    { id: 'remocao', name: 'Remoção de Gel / Alongamento', category: 'Remoções e Extras', duration: '1h00', price: 15, desc: 'Retirada segura e saudável do material das unhas.' },
    { id: 'conserto', name: 'Conserto de Unha Avulsa', category: 'Remoções e Extras', duration: '0h30', price: 5, desc: 'Reparação estética de emergência para uma unha avulsa.' }
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

  const showToast = (message, type = 'success') => {
    setToastMessage(message); 
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleCreateAppointment = (data) => {
    const newAppointment = { id: 'local-' + Date.now(), ...data, status: 'Pendente', createdAt: new Date().toISOString() };
    saveAppointmentsState([...appointments, newAppointment]);
    showToast("Agendamento realizado com sucesso!", "success");
  };

  const handleUpdateStatus = (id, newStatus) => {
    const updated = appointments.map(app => app.id === id ? { ...app, status: newStatus } : app);
    saveAppointmentsState(updated);
    showToast(`Status atualizado para ${newStatus}!`, "success");
  };

  const handleDeleteAppointment = (id) => {
    saveAppointmentsState(appointments.filter(app => app.id !== id));
    showToast("Agendamento removido.", "info");
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === '23181213') {
      setIsAdminLoggedIn(true);
      setLoginError(false);
      showToast("Login administrativo realizado!", "success");
    } else {
      setLoginError(true);
      showToast("Senha incorreta.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#4A3F3B] flex flex-col antialiased">
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 transition-all duration-300 transform translate-y-0 ${
          toastType === 'success' ? 'bg-[#EAF6EC] border-[#B2DBB6] text-[#2B5B32]' : 
          toastType === 'error' ? 'bg-[#FCECEB] border-[#F5B8B5] text-[#7A241E]' : 'bg-[#EBF3FC] border-[#B9D5F7] text-[#1E4473]'
        }`}>
          {toastType === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <header className="bg-white border-b border-[#EFE9E1] sticky top-0 z-40 px-4 py-4 shadow-sm">
        <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E5A8A3] flex items-center justify-center text-white shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight font-serif-elegant text-[#3A2F2B]">Brenda Mendes</h1>
              <p className="text-xs text-[#8A7A74] tracking-wide uppercase">Nail Studio</p>
            </div>
          </div>

          <nav className="flex gap-2 bg-[#F3ECE3] p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('booking')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${activeTab === 'booking' ? 'bg-white text-[#4A3F3B] shadow-sm' : 'text-[#7A6A64] hover:text-[#4A3F3B]'}`}
            >
              Agendar Horário
            </button>
            <button 
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${activeTab === 'admin' ? 'bg-white text-[#4A3F3B] shadow-sm' : 'text-[#7A6A64] hover:text-[#4A3F3B]'}`}
            >
              Painel Admin
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
        {activeTab === 'booking' && (
          <BookingWizard services={services} onComplete={handleCreateAppointment} />
        )}

        {activeTab === 'admin' && (
          <div className="bg-white border border-[#EFE9E1] rounded-3xl p-6 md:p-8 shadow-sm">
            {!isAdminLoggedIn ? (
              <div className="max-w-md mx-auto py-8">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-[#F5ECE2] rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#E5A8A3]">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold font-serif-elegant text-[#3A2F2B]">Acesso Restrito</h2>
                  <p className="text-sm text-[#8A7A74] mt-1">Insira sua senha de acesso para gerenciar os agendamentos.</p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Digite a senha master"
                      className={`w-full px-4 py-3 bg-[#FAF8F5] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E5A8A3] transition-all ${loginError ? 'border-red-400 focus:ring-red-300' : 'border-[#E2DCD5]'}`}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-[#8A7A74] hover:text-[#4A3F3B]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-[#E5A8A3] hover:bg-[#D99691] text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    Entrar no Painel <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center border-b border-[#F5ECE2] pb-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold font-serif-elegant text-[#3A2F2B]">Painel de Agendamentos</h2>
                    <p className="text-xs text-[#8A7A74] mt-0.5">Gerenciamento em tempo real de clientes cadastradas.</p>
                  </div>
                  <button 
                    onClick={() => setIsAdminLoggedIn(false)}
                    className="text-xs border border-[#E2DCD5] hover:bg-gray-50 px-3 py-1.5 rounded-lg text-[#7A6A64]"
                  >
                    Sair
                  </button>
                </div>

                {appointments.length === 0 ? (
                  <div className="text-center py-12 text-[#8A7A74]">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-40 text-[#E5A8A3]" />
                    <p className="text-sm">Nenhum agendamento registrado localmente neste navegador.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {appointments.map((app) => (
                      <div key={app.id} className="border border-[#EFE9E1] bg-[#FAF9F6] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#3A2F2B]">{app.clientName}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${app.clientType === 'Novata' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'}`}>
                              {app.clientType}
                            </span>
                          </div>
                          <div className="text-xs text-[#6A5A54] space-y-0.5">
                            <p><strong className="text-[#4A3F3B]">Serviço:</strong> {app.serviceName}</p>
                            <p><strong className="text-[#4A3F3B]">Data/Hora:</strong> {app.dateTime.replace('T', ' ')}</p>
                            <p><strong className="text-[#4A3F3B]">Preço:</strong> R$ {app.price},00</p>
                            {app.notes && <p className="italic text-[#8A7A74]">"{app.notes}"</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 justify-end">
                          <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold mr-2 ${
                            app.status === 'Confirmado' ? 'bg-green-100 text-green-700' : 
                            app.status === 'Cancelado' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {app.status}
                          </span>
                          {app.status === 'Pendente' && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(app.id, 'Confirmado')}
                                className="p-2 bg-white border border-[#E2DCD5] hover:bg-green-50 hover:text-green-600 rounded-xl text-[#7A6A64]"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => handleDeleteAppointment(app.id)}
                            className="p-2 bg-white border border-[#E2DCD5] hover:bg-gray-100 hover:text-red-500 rounded-xl text-[#7A6A64]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-[#FAF6F0] py-6 text-center text-xs text-[#A0908A] border-t border-[#EFE9E1] mt-12">
        <p>© 2026 Brenda Mendes Estética. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

function BookingWizard({ services, onComplete }) {
  const [step, setStep] = useState(1); 
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientType, setClientType] = useState('Novata'); 
  const [notes, setNotes] = useState('');
  const [isSending, setIsSending] = useState(false);

  const availableHours = ['08:00', '09:30', '11:00', '13:30', '15:00', '16:30', '18:00'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !selectedService || !selectedDate || !selectedTime) return;
    setIsSending(true);

    const googleScriptUrl = "https://script.google.com/macros/s/AKfycbwVkoKqFrEXGcWYUCQbE_Odsl9Z4utG4hXVWwSlqUV3-OqZVXO3smV3CpD4iRCXhT1w/exec";
    const formattedDateTime = `${selectedDate.split('-').reverse().join('/')} às ${selectedTime}`;

    try {
      await fetch(googleScriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clientName,
          clientPhone: clientPhone,
          serviceName: selectedService.name,
          dateTime: formattedDateTime,
          price: `R$ ${selectedService.price},00`,
          clientType: clientType,
          notes: notes || "Sem observações"
        })
      });
    } catch (err) {
      console.error("Erro na requisição externa:", err);
    } finally {
      setIsSending(false);
      onComplete({
        clientName,
        clientPhone,
        serviceName: selectedService.name,
        dateTime: `${selectedDate}T${selectedTime}`,
        price: selectedService.price,
        clientType,
        notes
      });
      setStep(4);
    }
  };

  return (
    <div className="bg-white border border-[#EFE9E1] rounded-3xl p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8 max-w-xs mx-auto text-xs font-semibold text-[#8A7A74]">
        <span className={`${step >= 1 ? 'text-[#E5A8A3]' : ''}`}>1. Serviço</span>
        <ChevronRight className="w-3 h-3 opacity-40" />
        <span className={`${step >= 2 ? 'text-[#E5A8A3]' : ''}`}>2. Horário</span>
        <ChevronRight className="w-3 h-3 opacity-40" />
        <span className={`${step >= 3 ? 'text-[#E5A8A3]' : ''}`}>3. Seus Dados</span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold font-serif-elegant text-[#3A2F2B]">Selecione o Procedimento</h2>
            <p className="text-xs text-[#8A7A74] mt-1">Escolha o serviço desejado para ver mais detalhes e agendar.</p>
          </div>
          <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-1">
            {services.map(srv => (
              <button
                key={srv.id}
                onClick={() => { setSelectedService(srv); setStep(2); }}
                className="w-full text-left border border-[#EFE9E1] bg-[#FAF8F5] p-4 rounded-2xl hover:border-[#E5A8A3] hover:bg-white transition-all flex justify-between items-center group"
              >
                <div className="space-y-1 max-w-[85%]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#4A3F3B]">{srv.name}</span>
                    <span className="text-[10px] bg-[#EDE4DA] text-[#7A6A64] px-2 py-0.5 rounded-full font-medium">{srv.category}</span>
                  </div>
                  <p className="text-xs text-[#8A7A74] line-clamp-1">{srv.desc}</p>
                  <div className="flex items-center gap-3 text-[11px] text-[#A0908A] pt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {srv.duration}</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="font-bold text-sm text-[#E5A8A3]">R$ {srv.price},00</span>
                  <ChevronRight className="w-4 h-4 text-[#A0908A] opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8A7A74] cursor-pointer hover:text-[#4A3F3B]" onClick={() => setStep(1)}>
            <ChevronLeft className="w-4 h-4" /> Voltar aos Serviços
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold font-serif-elegant text-[#3A2F2B]">{selectedService?.name}</h2>
            <p className="text-xs text-[#8A7A74] mt-1">Escolha o dia e o melhor horário disponível para você.</p>
          </div>

          <div className="space-y-4 max-w-sm mx-auto">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#6A5A54] flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> Escolha o Dia</label>
              <input 
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E2DCD5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E5A8A3] transition-all"
              />
            </div>

            {selectedDate && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-[#6A5A54] flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Horários Disponíveis</label>
                <div className="grid grid-cols-3 gap-2">
                  {availableHours.map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-2.5 rounded-xl border text-xs font-medium transition-all ${selectedTime === time ? 'bg-[#E5A8A3] border-[#E5A8A3] text-white shadow-sm' : 'border-[#E2DCD5] bg-[#FAF8F5] hover:border-[#E5A8A3] text-[#4A3F3B]'}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedDate && selectedTime && (
              <button 
                onClick={() => setStep(3)}
                className="w-full mt-4 bg-[#E5A8A3] hover:bg-[#D99691] text-white py-3 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Prosseguir para Dados Pessoais <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8A7A74] cursor-pointer hover:text-[#4A3F3B]" onClick={() => setStep(2)}>
            <ChevronLeft className="w-4 h-4" /> Voltar ao Horário
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold font-serif-elegant text-[#3A2F2B]">Finalize o seu Cadastro</h2>
            <p className="text-xs text-[#8A7A74] mt-1">Preencha suas informações para fixar o agendamento.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6A5A54] flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Seu Nome Completo</label>
              <input 
                type="text" required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Ana Silva"
                className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E2DCD5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E5A8A3] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6A5A54] flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> WhatsApp / Celular</label>
              <input 
                type="tel" required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ex: (67) 99999-9999"
                className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E2DCD5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E5A8A3] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6A5A54] flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Tipo de Cliente</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setClientType('Novata')}
                  className={`py-2.5 rounded-xl border text-xs font-medium transition-all ${clientType === 'Novata' ? 'bg-[#EDE4DA] border-[#C4B3A5] text-[#4A3F3B] font-bold' : 'border-[#E2DCD5] bg-[#FAF8F5] text-[#8A7A74]'}`}
                >
                  Primeira Vez (Novata)
                </button>
                <button
                  type="button"
                  onClick={() => setClientType('Fiel / Retorno')}
                  className={`py-2.5 rounded-xl border text-xs font-medium transition-all ${clientType === 'Fiel / Retorno' ? 'bg-[#EDE4DA] border-[#C4B3A5] text-[#4A3F3B] font-bold' : 'border-[#E2DCD5] bg-[#FAF8F5] text-[#8A7A74]'}`}
                >
                  Já sou Cliente (Fiel)
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6A5A54] flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Observações (Opcional)</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Alguma alergia, detalhe ou preferência de cor..."
                rows={2}
                className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E2DCD5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E5A8A3] transition-all resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={isSending}
              className="w-full mt-2 bg-[#E5A8A3] hover:bg-[#D99691] disabled:bg-[#ECC3BF] text-white py-3 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {isSending ? "Conectando e Enviando..." : "Confirmar Meu Agendamento"} <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {step === 4 && (
        <div className="text-center py-8 max-w-sm mx-auto space-y-4">
          <div className="w-16 h-16 bg-[#EAF6EC] border border-[#B2DBB6] rounded-full flex items-center justify-center mx-auto text-green-600 shadow-sm">
            <Check className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-serif-elegant text-[#3A2F2B]">Agendamento Confirmado!</h2>
            <p className="text-xs text-[#8A7A74]">Seus dados já foram computados e enviados com sucesso.</p>
          </div>
          <div className="bg-[#FAF9F6] border border-[#EFE9E1] p-4 rounded-2xl text-left text-xs text-[#6A5A54] space-y-1.5">
            <p><strong>Procedimento:</strong> {selectedService?.name}</p>
            <p><strong>Data:</strong> {selectedDate.split('-').reverse().join('/')}</p>
            <p><strong>Horário:</strong> {selectedTime}</p>
            <p><strong>Valor estimado:</strong> R$ {selectedService?.price},00</p>
          </div>
          <p className="text-[11px] text-[#A0908A] italic">Obrigado pela preferência!</p>
          <button 
            onClick={() => {
              setStep(1); setSelectedService(null); setSelectedDate(''); setSelectedTime('');
              setClientName(''); setClientPhone(''); setNotes('');
            }}
            className="mt-2 text-xs font-semibold text-[#E5A8A3] hover:text-[#D99691] underline"
          >
            Fazer Novo Agendamento
          </button>
        </div>
      )}
    </div>
  );
}
