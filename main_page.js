import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BookOpen, Award, Target } from 'lucide-react';

export default function SteelStructuresTutor() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState('initial');
  const [studentData, setStudentData] = useState({
    topic: '',
    level: '',
    semester: '',
    priorKnowledge: ''
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Inicializar conversación
  useEffect(() => {
    const initialMessage = {
      id: 1,
      text: "¡Hola! 👋 Soy tu tutora virtual de Estructuras de Acero, y estoy encantada de ayudarte con cualquier pregunta sobre el diseño de estructuras de acero o sus cursos prerequisito.\n\nSoy optimista, alentadora y mi objetivo es guiarte para que descubras los conceptos por ti mismo(a) a través de preguntas estratégicas.\n\n¿Qué tema o concepto te gustaría aprender hoy?",
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages([initialMessage]);
  }, []);

  const generateBotResponse = async (userMessage) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage,
          messages,
          conversationState,
          studentData
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Actualizar estado de conversación basado en la respuesta
      updateConversationState(userMessage, data.response);

      return data.response;

    } catch (error) {
      console.error('Error generating response:', error);
      return "Lo siento, he tenido un problema técnico. ¿Podrías intentar de nuevo? Estoy aquí para ayudarte con estructuras de acero. 😊";
    } finally {
      setIsLoading(false);
    }
  };

  const updateConversationState = (userMessage, botResponse) => {
    if (conversationState === 'initial' && userMessage.trim()) {
      setConversationState('topic_selected');
      setStudentData(prev => ({ ...prev, topic: userMessage }));
    } else if (conversationState === 'topic_selected' && userMessage.includes('grado')) {
      setConversationState('level_identified');
      setStudentData(prev => ({ ...prev, level: userMessage }));
    } else if (conversationState === 'level_identified') {
      setConversationState('teaching');
      setStudentData(prev => ({ ...prev, priorKnowledge: userMessage }));
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    const botResponse = await generateBotResponse(inputMessage);
    
    const botMessage = {
      id: messages.length + 2,
      text: botResponse,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getProgressStage = () => {
    switch (conversationState) {
      case 'initial': return 1;
      case 'topic_selected': return 2;
      case 'level_identified': return 3;
      case 'teaching': return 4;
      case 'verification': return 5;
      default: return 1;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-800 p-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-400 p-2 rounded-full">
              <Bot className="w-5 h-5 text-blue-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Tutora Virtual - Estructuras de Acero</h1>
              <p className="text-blue-200 text-sm">Tu guía optimista para el diseño estructural</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-white">
              <Target className="w-4 h-4" />
              <span className="text-sm">Etapa {getProgressStage()}/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-blue-700 px-4 py-1">
        <div className="flex justify-between text-xs text-blue-200 mb-1">
          <span>Inicio</span>
          <span>Tema</span>
          <span>Nivel</span>
          <span>Enseñanza</span>
          <span>Verificación</span>
        </div>
        <div className="w-full bg-blue-800 rounded-full h-1.5">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(getProgressStage() / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-3xl ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`p-2 rounded-full ${message.sender === 'user' ? 'bg-green-500' : 'bg-yellow-400'}`}>
                {message.sender === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-blue-900" />}
              </div>
              <div className={`p-4 rounded-2xl shadow-lg ${
                message.sender === 'user' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white text-gray-800 border-l-4 border-yellow-400'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-green-100' : 'text-gray-500'}`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-3xl">
              <div className="p-2 rounded-full bg-yellow-400">
                <Bot className="w-5 h-5 text-blue-900" />
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-yellow-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <span className="text-gray-600 text-sm ml-2">Pensando...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu respuesta aquí... (Presiona Enter para enviar)"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || inputMessage.trim() === ''}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* Quick Tips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {conversationState === 'initial' && (
            <>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">💡 Ejemplo: "Pandeo de columnas"</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">💡 Ejemplo: "Conexiones soldadas"</span>
            </>
          )}
          {conversationState === 'topic_selected' && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">📚 Indica tu nivel: pregrado/postgrado y semestre</span>
          )}
        </div>
      </div>

      {/* Student Info Panel (if data available) */}
      {studentData.topic && (
        <div className="bg-gray-50 border-t border-gray-200 p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <strong>Tema:</strong> <span className="text-blue-600">{studentData.topic}</span>
              </span>
              {studentData.level && (
                <span className="flex items-center space-x-1">
                  <Award className="w-4 h-4 text-green-600" />
                  <strong>Nivel:</strong> <span className="text-green-600">{studentData.level}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}