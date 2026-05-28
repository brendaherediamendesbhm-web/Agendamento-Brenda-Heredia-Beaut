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
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator', 'booking', 'admin'
  const [appointments, setAppointments] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success'); 

  // Controle de segurança para o painel admin
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Lista de serviços oferecidos por Brenda Heredia Beauty
  const services = [
    { id: 'esmaltacao_gel', name: 'Esmaltação em Gel', category: 'Novos & Blindagem', duration: '1h30', price: 50, desc: 'Aplicação de esmalte em gel premium com secagem na cabine LED. Brilho duradouro por semanas sem descascar.' },
    { id: 'banho_gel', name: 'Banho de Gel', category: 'Novos & Blindagem', duration: '2h45', price: 85, desc: 'Ideal para blindar e fortalecer o crescimento das unhas naturais com camada de gel premium.' },
    { id: 'along_f1', name: 'Alongamento Molde F1', category: 'Novos & Blindagem', duration: '3h00', price: 100, desc: 'Extensão rápida e sofisticada utilizando a técnica moderna do Molde F1.' },
    { id: 'manut_banho', name: 'Manutenção de Banho de Gel', category: 'Manutenções', duration: '2h15', price: 65, desc: 'Manutenção periódica para repor a estrutura do gel nas unhas in crescimento.' },
    { id: 'manut_f1', name: 'Manutenção de Molde F1', category: 'Manutenções', duration: '2h30', price: 75, desc: 'Nivelamento e reposicionamento do alongamento feito na técnica F1.' },
    { id: 'remocao', name: 'Remoção de Gel / Alongamento', category: 'Remoções e Extras', duration: '1h00', price: 25, desc: 'Retirada segura do produto sem danificar a base da unha natural.' },
    { id: 'conserto', name: 'Conserto de Unha Avulsa', category: 'Remoções e Extras', duration: '0h30', price: 10, desc: 'Reparação de emergência para uma unha partida ou danificada.' }
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
        setAppointments(getMockAppointments());
      }
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
      {
        id: 'mock-1',
        clientName: 'Mariana Silva',
        clientPhone: '17991234567',
        clientType: 'Veterana',
        serviceId: 'banho_gel',
        serviceName: 'Banho de Gel',
        dateTime: `${today}T10:00`,
        price: 85,
        status: 'Pendente',
        notes: 'Quer um tom nude suave'
      },
      {
        id: 'mock-2',
        clientName: 'Beatriz Costa',
        clientPhone: '17998765432',
        clientType: 'Novata',
        serviceId: 'along_f1',
        serviceName: 'Alongamento Molde F1',
        dateTime: `${today}T14:00`,
        price: 100,
        status: 'Pendente',
        notes: 'Gostaria de formato bailarina'
      }
    ];
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
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
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
