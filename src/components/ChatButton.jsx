import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function ChatButton({ icon, onClick, primary = false }) {
  const buttonClass = primary 
    ? 'chat-button chat-button-primary' 
    : 'chat-button';

  return (
    <button className={buttonClass} onClick={onClick}>
      <FontAwesomeIcon icon={icon} />
    </button>
  );
}