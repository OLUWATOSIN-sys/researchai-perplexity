import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faUser, faClock } from '@fortawesome/free-solid-svg-icons';

export default function ChatMessage({ role, content, timestamp }) {
  return (
    <div className={`message ${role}-message`}>
      <div className="message-avatar">
        <FontAwesomeIcon icon={role === 'user' ? faUser : faRobot} />
      </div>
      <div className="message-content">
        <div className="message-role">{role === 'user' ? 'You' : 'Research Assistant'}</div>
        <div className="message-text" dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
        <div className="message-time">
          <FontAwesomeIcon icon={faClock} />
          <span>{timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
}

function formatContent(content) {
  // Simple formatting for line breaks and lists
  let formatted = content.replace(/\n/g, '<br />');
  
  // Basic markdown-style list formatting
  formatted = formatted.replace(/\*\s(.*?)\n/g, '<li>$1</li>');
  formatted = formatted.replace(/-\s(.*?)\n/g, '<li>$1</li>');
  
  return formatted;
}