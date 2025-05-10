"use client"; 

import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function ResearchAIPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to your AI research assistant. I can help you:\n' +
        '<ul style="margin-top: 0.5rem; margin-left: 1rem; list-style-type: disc;">\n' +
        '<li style="margin-bottom: 0.25rem;">Find and summarize academic papers</li>\n' +
        '<li style="margin-bottom: 0.25rem;">Generate citations in multiple formats</li>\n' +
        '<li style="margin-bottom: 0.25rem;">Identify key arguments and evidence</li>\n' +
        '<li>Suggest related research topics</li>\n' +
        '</ul>\n' +
        'What would you like to research today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    connected: false,
    message: 'Checking Connection...',
    badgeClass: 'badge'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check backend connection
  const checkBackendConnection = async () => {
    try {
      setApiStatus({
        connected: false,
        message: 'Connecting...',
        badgeClass: 'badge badge-warning'
      });
      
      const response = await fetch('/api/status');
      if (!response.ok) throw new Error('Backend not connected');
      
      const data = await response.json();
      if (!data.connected) throw new Error('Backend not ready');
      
      setApiStatus({
        connected: true,
        message: 'API Connected',
        badgeClass: 'badge badge-success'
      });
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      setApiStatus({
        connected: false,
        message: 'API Disconnected',
        badgeClass: 'badge badge-error'
      });
      addMessage('assistant', 'Error: Could not connect to the backend server. Please ensure the server is running.');
      return false;
    }
  };

  // Send message to backend
  const sendMessageToBackend = async (message: string) => {
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

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Failed to get response from the server. Please try again later.'
      };
    }
  };

  // Add message to chat
  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage = {
      role,
      content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Send message function
  const sendMessage = async () => {
    const message = inputValue.trim();
    if (!message) return;

    // Check backend connection first
    const isConnected = await checkBackendConnection();
    if (!isConnected) return;

    // Add user message to chat
    addMessage('user', message);
    setInputValue('');

    setIsLoading(true);

    try {
      const response = await sendMessageToBackend(message);
      
      if (response.error) {
        addMessage('assistant', 'Error: ' + response.message);
      } else {
        addMessage('assistant', response.content);
        // You could add citations handling here if needed
      }
    } catch (error) {
      addMessage('assistant', 'Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Generate PDF report
  const generatePdfReport = async () => {
    const isConnected = await checkBackendConnection();
    if (!isConnected) return;

    try {
      // Get chat history
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content.replace(/<[^>]*>?/gm, '') // Remove HTML tags for PDF
      }));
      
      // Call backend to generate PDF
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatHistory: chatHistory
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
      addMessage('assistant', 'Error generating PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Handle input key down
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = (target.scrollHeight) + 'px';
  };

  return (
    <>
      <Head>
        <title>Perplexity Research AI</title>
      </Head>

      <div className="container">
        <header>
          <a href="#" className="logo">
            <i className="fas fa-brain logo-icon"></i>
            <span>ResearchAI</span>
          </a>
          <nav>
            <ul>
              <li><a href="#"><i className="fas fa-home"></i> Home</a></li>
              <li><a href="#"><i className="fas fa-history"></i> History</a></li>
              <li><a href="#"><i className="fas fa-cog"></i> Settings</a></li>
            </ul>
          </nav>
        </header>

        <div className="main-grid">
          <aside className="sidebar">
            <div className="sidebar-section">
              <h3 className="sidebar-title"><i className="fas fa-folder-open"></i> Current Research</h3>
              <div className="research-item active">
                <div className="research-item-icon">
                  <i className="fas fa-book-open"></i>
                </div>
                <div className="research-item-content">
                  <div className="research-item-title">AI Ethics Framework</div>
                  <div className="research-item-date">Last updated 2 hours ago</div>
                </div>
              </div>
              <div className="research-item">
                <div className="research-item-icon">
                  <i className="fas fa-microchip"></i>
                </div>
                <div className="research-item-content">
                  <div className="research-item-title">Neural Networks</div>
                  <div className="research-item-date">Yesterday</div>
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <h3 className="sidebar-title"><i className="fas fa-tags"></i> Tags</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div className="badge">
                  <i className="fas fa-hashtag"></i>
                  <span>ethics</span>
                </div>
                <div className="badge">
                  <i className="fas fa-hashtag"></i>
                  <span>ai-safety</span>
                </div>
                <div className="badge">
                  <i className="fas fa-hashtag"></i>
                  <span>research</span>
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <h3 className="sidebar-title"><i className="fas fa-file-export"></i> Export</h3>
              <button className="btn btn-primary btn-block" id="pdf-button" onClick={generatePdfReport}>
                <i className="fas fa-file-pdf"></i>
                <span>Generate PDF Report</span>
              </button>
            </div>
          </aside>

          <main>
            <div className="chat-container">
              <div className="chat-header">
                <h2 className="chat-title">AI Research Assistant</h2>
                <div className={apiStatus.badgeClass} id="api-status">
                  <i className="fas fa-circle"></i>
                  <span>{apiStatus.message}</span>
                </div>
              </div>

              <div className="chat-messages" id="chat-messages">
                {messages.map((message, index) => (
                  <div key={index} className={`message ${message.role}-message`}>
                    <div className="message-avatar">
                      <i className={`fas ${message.role === 'user' ? 'fa-user' : 'fa-robot'}`}></i>
                    </div>
                    <div className="message-content">
                      <div className="message-role">{message.role === 'user' ? 'You' : 'Research Assistant'}</div>
                      <div className="message-text" dangerouslySetInnerHTML={{ __html: message.content }} />
                      <div className="message-time">
                        <i className="fas fa-clock"></i>
                        <span>{message.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message assistant-message">
                    <div className="message-avatar">
                      <i className="fas fa-robot"></i>
                    </div>
                    <div className="message-content">
                      <div className="message-role">Research Assistant</div>
                      <div className="message-text">
                        <div className="loading-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-container">
                <div className="chat-input-wrapper">
                  <textarea
                    className="chat-input"
                    placeholder="Ask a research question or paste text to analyze..."
                    rows={1}
                    id="user-input"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onInput={handleInput}
                  />
                  <div className="chat-buttons">
                    <button className="chat-button" id="mic-button">
                      <i className="fas fa-microphone"></i>
                    </button>
                    <button 
                      className="chat-button chat-button-primary" 
                      id="send-button"
                      onClick={sendMessage}
                      disabled={isLoading}
                    >
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --primary: #2563eb;
          --primary-hover: #1d4ed8;
          --secondary: #f3f4f6;
          --text: #111827;
          --text-light: #6b7280;
          --border: #e5e7eb;
          --card-bg: #ffffff;
          --success: #10b981;
          --warning: #f59e0b;
          --error: #ef4444;
          --radius: 0.5rem;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        body {
          background-color: #f9fafb;
          color: var(--text);
          min-height: 100vh;
          line-height: 1.5;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text);
          text-decoration: none;
        }

        .logo-icon {
          color: var(--primary);
          font-size: 1.75rem;
        }

        nav ul {
          display: flex;
          gap: 1.5rem;
          list-style: none;
        }

        nav a {
          text-decoration: none;
          color: var(--text-light);
          font-weight: 500;
          transition: all 0.2s ease;
          font-size: 0.95rem;
        }

        nav a:hover {
          color: var(--primary);
        }

        .main-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2rem;
        }

        .sidebar {
          background: var(--card-bg);
          border-radius: var(--radius);
          padding: 1.5rem;
          box-shadow: var(--shadow);
          height: fit-content;
          position: sticky;
          top: 2rem;
        }

        .sidebar-section {
          margin-bottom: 1.75rem;
        }

        .sidebar-title {
          font-size: 0.8125rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-light);
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sidebar-title i {
          font-size: 0.9rem;
        }

        .chat-container {
          background: var(--card-bg);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: calc(100vh - 10rem);
        }

        .chat-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--card-bg);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .chat-title {
          font-weight: 600;
          font-size: 1.125rem;
          color: var(--text);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          scroll-behavior: smooth;
        }

        .message {
          margin-bottom: 1.5rem;
          display: flex;
          gap: 0.875rem;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--primary);
          font-weight: 600;
          font-size: 0.9375rem;
        }

        .message-content {
          flex: 1;
          min-width: 0;
        }

        .message-role {
          font-weight: 600;
          margin-bottom: 0.375rem;
          font-size: 0.9375rem;
          color: var(--text);
        }

        .message-text {
          line-height: 1.6;
          font-size: 0.9375rem;
          color: var(--text);
        }

        .message-text pre {
          background: #f8fafc;
          border-radius: 0.375rem;
          padding: 0.75rem;
          overflow-x: auto;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          font-size: 0.875rem;
          margin: 0.5rem 0;
        }

        .message-text code {
          background: #f8fafc;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          font-size: 0.875rem;
        }

        .message-text ul,
        .message-text ol {
          padding-left: 1.25rem;
          margin: 0.5rem 0;
        }

        .message-text li {
          margin-bottom: 0.25rem;
        }

        .message-time {
          font-size: 0.75rem;
          color: var(--text-light);
          margin-top: 0.375rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .user-message .message-avatar {
          background: var(--primary);
          color: white;
        }

        .assistant-message .message-avatar {
          background: #e0e7ff;
        }

        .chat-input-container {
          padding: 1.25rem 1.5rem;
          border-top: 1px solid var(--border);
          background: var(--card-bg);
          position: sticky;
          bottom: 0;
        }

        .chat-input-wrapper {
          position: relative;
        }

        .chat-input {
          width: 100%;
          padding: 0.875rem 4rem 0.875rem 1.25rem;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          resize: none;
          min-height: 56px;
          max-height: 200px;
          outline: none;
          transition: all 0.2s ease;
          font-size: 0.9375rem;
          line-height: 1.6;
          background: var(--card-bg);
          color: var(--text);
        }

        .chat-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .chat-buttons {
          position: absolute;
          right: 0.75rem;
          bottom: 0.75rem;
          display: flex;
          gap: 0.5rem;
        }

        .chat-button {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          color: var(--text-light);
          transition: all 0.2s ease;
        }

        .chat-button:hover {
          background: var(--primary);
          color: white;
          transform: translateY(-1px);
        }

        .chat-button:active {
          transform: translateY(0);
        }

        .chat-button-primary {
          background: var(--primary);
          color: white;
        }

        .chat-button-primary:hover {
          background: var(--primary-hover);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          padding: 0.375rem 0.625rem;
          border-radius: 9999px;
          background: var(--secondary);
          color: var(--text-light);
          font-weight: 500;
        }

        .badge i {
          font-size: 0.65rem;
        }

        .badge-success {
          background: #ecfdf5;
          color: var(--success);
        }

        .badge-warning {
          background: #fffbeb;
          color: var(--warning);
        }

        .badge-error {
          background: #fef2f2;
          color: var(--error);
        }

        .citation {
          font-size: 0.8125rem;
          color: var(--text-light);
          margin-top: 0.75rem;
          padding-left: 0.75rem;
          border-left: 2px solid var(--border);
        }

        .citation a {
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
        }

        .citation a:hover {
          text-decoration: underline;
        }

        .loading-dots {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
        }

        .loading-dots span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--text-light);
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .loading-dots span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .loading-dots span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .research-item {
          padding: 0.75rem;
          border-radius: var(--radius);
          margin-bottom: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .research-item:hover {
          background: var(--secondary);
        }

        .research-item.active {
          background: #e0e7ff;
        }

        .research-item-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          flex-shrink: 0;
        }

        .research-item-content {
          flex: 1;
          min-width: 0;
        }

        .research-item-title {
          font-weight: 500;
          font-size: 0.9375rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .research-item-date {
          font-size: 0.75rem;
          color: var(--text-light);
          margin-top: 0.125rem;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          border-radius: var(--radius);
          font-weight: 500;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .btn-primary:hover {
          background: var(--primary-hover);
          border-color: var(--primary-hover);
          transform: translateY(-1px);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-block {
          width: 100%;
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
          
          .sidebar {
            position: static;
          }

          .chat-container {
            height: auto;
            min-height: 70vh;
          }
        }
      `}</style>
    </>
  );
}