'use client'
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBrain, 
  faHome, 
  faHistory, 
  faCog,
  faBookOpen,
  faMicrochip,
  faHashtag,
  faFilePdf,
  faRobot,
  faUser,
  faClock,
  faMicrophone,
  faPaperPlane,
  faCircle,
  faMicrophoneSlash,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '@/components/Sidebar';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import Badge from '@/components/Badge';
import LoadingDots from '@/components/LoadingDots';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Welcome to your AI research assistant. I can help you:\n' +
        '- Find and summarize academic papers\n' +
        '- Generate citations in multiple formats\n' +
        '- Identify key arguments and evidence\n' +
        '- Suggest related research topics\n\n' +
        'What would you like to research today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [apiStatus, setApiStatus] = useState('checking');
  const [activeResearch, setActiveResearch] = useState('AI Ethics Framework');
  const messagesEndRef = useRef(null);

  const researchItems = [
    { id: 1, title: 'AI Ethics Framework', icon: faBookOpen, updated: '2 hours ago' },
    { id: 2, title: 'Neural Networks', icon: faMicrochip, updated: 'Yesterday' }
  ];

  const tags = ['ethics', 'ai-safety', 'research'];

  useEffect(() => {
    checkBackendConnection();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkBackendConnection = async () => {
    try {
      setApiStatus('connecting');
      const response = await fetch('/api/status');
      if (!response.ok) throw new Error('Backend not connected');
      
      const data = await response.json();
      if (!data.connected) throw new Error('Backend not ready');
      
      setApiStatus('connected');
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      setApiStatus('disconnected');
      addMessage('assistant', 'Error: Could not connect to the backend server. Please ensure the server is running.');
      return false;
    }
  };

  const addMessage = (role, content) => {
    const newMessage = {
      id: Date.now(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    const message = inputValue.trim();
    if (!message) return;

    // Check backend connection first
    const isConnected = apiStatus === 'connected' || await checkBackendConnection();
    if (!isConnected) return;

    // Add user message to chat
    addMessage('user', message);
    setInputValue('');

    // Show loading indicator
    const loadingId = Date.now();
    setMessages(prev => [...prev, { 
      id: loadingId, 
      role: 'assistant', 
      content: '', 
      isLoading: true 
    }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Remove loading indicator and add response
      setMessages(prev => prev.filter(msg => msg.id !== loadingId));
      
      if (data.error) {
        addMessage('assistant', 'Error: ' + data.message);
      } else {
        addMessage('assistant', data.content);
        // TODO: Handle citations if present
      }
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== loadingId));
      addMessage('assistant', 'Error: ' + error.message);
    }
  };

  const handleGeneratePDF = async () => {
    const isConnected = apiStatus === 'connected' || await checkBackendConnection();
    if (!isConnected) return;

    try {
      // Call backend to generate PDF
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatHistory: messages
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Download the PDF
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = 'research-report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (error) {
      addMessage('assistant', 'Error generating PDF: ' + error.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      addMessage('assistant', 'Speech recognition not supported in your browser');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      handleSendMessage();
    };
    
    recognition.onerror = (event) => {
      addMessage('assistant', 'Speech recognition error: ' + event.error);
    };
    
    recognition.start();
  };

  const getStatusBadge = () => {
    switch (apiStatus) {
      case 'connected':
        return <Badge type="success" icon={faCircle} text="API Connected" />;
      case 'disconnected':
        return <Badge type="error" icon={faCircle} text="API Disconnected" />;
      case 'connecting':
        return <Badge type="warning" icon={faCircle} text="Connecting..." />;
      default:
        return <Badge icon={faCircle} text="Checking Connection..." />;
    }
  };

  return (
    <div className="container">
      <header>
        <a href="#" className="logo">
          <FontAwesomeIcon icon={faBrain} className="logo-icon" />
          <span>ResearchAI</span>
        </a>
        <nav>
          <ul>
            <li><a href="#"><FontAwesomeIcon icon={faHome} /> Home</a></li>
            <li><a href="#"><FontAwesomeIcon icon={faHistory} /> History</a></li>
            <li><a href="#"><FontAwesomeIcon icon={faCog} /> Settings</a></li>
          </ul>
        </nav>
      </header>

      <div className="main-grid">
        <Sidebar
          researchItems={researchItems}
          activeResearch={activeResearch}
          onResearchSelect={setActiveResearch}
          tags={tags}
          onGeneratePDF={handleGeneratePDF}
        />

        <main>
          <div className="chat-container">
            <div className="chat-header">
              <h2 className="chat-title">AI Research Assistant</h2>
              {getStatusBadge()}
            </div>

            <div className="chat-messages">
              {messages.map((message) => (
                message.isLoading ? (
                  <LoadingDots key={message.id} />
                ) : (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                  />
                )
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
              <ChatInput
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onSend={handleSendMessage}
                onMicClick={handleSpeechRecognition}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}