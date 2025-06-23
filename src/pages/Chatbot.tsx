import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { MessageSquare, Send, Bot, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const Chatbot: React.FC = () => {
  const { darkMode } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Hello! I\'m your AI health assistant. I can help you understand symptoms and provide general health guidance. Please describe your symptoms or ask me a health-related question.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getSymptomResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Symptom keywords and responses
    const responses: { [key: string]: string } = {
      'headache': 'Headaches can have various causes including stress, dehydration, lack of sleep, or tension. Try drinking water, resting in a quiet dark room, and applying a cold compress. If headaches persist or are severe, please consult a healthcare professional.',
      
      'fever': 'A fever is often a sign that your body is fighting an infection. Rest, stay hydrated, and monitor your temperature. Seek medical attention if fever exceeds 103°F (39.4°C), persists for more than 3 days, or is accompanied by severe symptoms.',
      
      'cough': 'Coughs can be caused by various factors including infections, allergies, or irritants. Stay hydrated, use a humidifier, and avoid irritants. If the cough persists for more than 2 weeks, produces blood, or is accompanied by fever, consult a doctor.',
      
      'stomach': 'Stomach pain can range from mild indigestion to serious conditions. Try eating bland foods, staying hydrated, and avoiding spicy or fatty foods. Seek immediate medical attention if you experience severe pain, vomiting blood, or signs of dehydration.',
      
      'chest pain': 'Chest pain can be serious and should not be ignored. If you\'re experiencing severe chest pain, shortness of breath, or pain radiating to your arm or jaw, seek emergency medical attention immediately. This could be a sign of a heart attack.',
      
      'shortness of breath': 'Difficulty breathing can be caused by various conditions including asthma, infections, or heart problems. If you\'re experiencing severe shortness of breath, chest pain, or bluish lips/fingernails, seek emergency medical care immediately.',
      
      'nausea': 'Nausea can be caused by various factors including food poisoning, motion sickness, or infections. Try sipping clear fluids, eating bland foods like crackers, and resting. If nausea persists with vomiting, fever, or severe abdominal pain, consult a healthcare provider.',
      
      'dizziness': 'Dizziness can be caused by dehydration, low blood sugar, inner ear problems, or medication side effects. Sit or lie down, drink water, and avoid sudden movements. If dizziness is severe, persistent, or accompanied by chest pain or difficulty speaking, seek medical attention.',
      
      'rash': 'Skin rashes can be caused by allergies, infections, or irritants. Keep the area clean and dry, avoid scratching, and consider using a cool compress. If the rash spreads rapidly, is accompanied by fever, or shows signs of infection, consult a healthcare provider.',
      
      'fatigue': 'Persistent fatigue can be caused by lack of sleep, stress, poor nutrition, or underlying medical conditions. Ensure adequate sleep, maintain a balanced diet, and manage stress. If fatigue persists despite lifestyle changes, consult a healthcare professional.'
    };

    // Check for symptom keywords
    for (const [symptom, response] of Object.entries(responses)) {
      if (lowerMessage.includes(symptom)) {
        return response;
      }
    }

    // General health questions
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
      return 'If you\'re experiencing a medical emergency, please call emergency services (911) immediately or go to the nearest emergency room. This chatbot is for general health information only and cannot replace emergency medical care.';
    }

    if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
      return 'I cannot provide specific medication advice. Please consult with a healthcare professional or pharmacist for medication-related questions. They can provide personalized guidance based on your medical history and current medications.';
    }

    if (lowerMessage.includes('diet') || lowerMessage.includes('nutrition')) {
      return 'A balanced diet includes fruits, vegetables, whole grains, lean proteins, and healthy fats. Stay hydrated and limit processed foods, sugar, and excessive salt. For personalized nutrition advice, consider consulting with a registered dietitian.';
    }

    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
      return 'Regular exercise is important for overall health. Aim for at least 150 minutes of moderate aerobic activity per week, plus strength training exercises. Start slowly and gradually increase intensity. Consult a healthcare provider before starting a new exercise program.';
    }

    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia')) {
      return 'Good sleep hygiene includes maintaining a regular sleep schedule, creating a comfortable sleep environment, avoiding caffeine late in the day, and limiting screen time before bed. Adults typically need 7-9 hours of sleep per night.';
    }

    // Default responses
    const defaultResponses = [
      'I understand you\'re concerned about your health. Can you provide more specific details about your symptoms? For example, when did they start, how severe are they, and are there any other accompanying symptoms?',
      'Thank you for sharing that information. While I can provide general health guidance, it\'s important to consult with a healthcare professional for proper diagnosis and treatment, especially if symptoms persist or worsen.',
      'I\'m here to help with general health information. Could you describe your symptoms in more detail? Remember, if you\'re experiencing severe symptoms, please seek immediate medical attention.',
      'Based on what you\'ve described, I recommend monitoring your symptoms and consulting with a healthcare provider if they persist or worsen. Is there anything specific about your symptoms you\'d like to know more about?'
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: getSymptomResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          AI Symptom Checker
        </h1>
        <p className={`text-lg mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Get general health guidance and symptom information from our AI assistant
        </p>
      </div>

      {/* Disclaimer */}
      <div className={`p-4 rounded-lg border-l-4 border-yellow-400 ${
        darkMode ? 'bg-yellow-900 bg-opacity-20' : 'bg-yellow-50'
      }`}>
        <div className="flex">
          <div className="ml-3">
            <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
              <strong>Important:</strong> This AI assistant provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical concerns.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className={`rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`p-2 rounded-full ${
                  message.sender === 'user' 
                    ? 'bg-blue-600' 
                    : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  {message.sender === 'user' ? (
                    <User size={16} className="text-white" />
                  ) : (
                    <Bot size={16} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                  )}
                </div>
                
                <div className={`p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-100'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm leading-relaxed">{message.message}</p>
                  <p className={`text-xs mt-2 opacity-70`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-3xl">
                <div className={`p-2 rounded-full ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <Bot size={16} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                </div>
                
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className="flex space-x-1">
                    <div className={`w-2 h-2 rounded-full animate-bounce ${
                      darkMode ? 'bg-gray-400' : 'bg-gray-500'
                    }`} style={{ animationDelay: '0ms' }}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${
                      darkMode ? 'bg-gray-400' : 'bg-gray-500'
                    }`} style={{ animationDelay: '150ms' }}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${
                      darkMode ? 'bg-gray-400' : 'bg-gray-500'
                    }`} style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className={`border-t p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex space-x-4">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your symptoms or ask a health question..."
              rows={2}
              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};