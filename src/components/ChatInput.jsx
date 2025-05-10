import { useState, useEffect } from 'react';
import ChatButton from './ChatButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

export default function ChatInput({ value, onChange, onKeyDown, onSend, onMicClick }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="chat-input-wrapper">
      <textarea
        ref={textareaRef}
        className="chat-input"
        placeholder="Ask a research question or paste text to analyze..."
        rows={1}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      <div className="chat-buttons">
        <ChatButton icon={faMicrophone} onClick={onMicClick} />
        <ChatButton icon={faPaperPlane} onClick={onSend} primary />
      </div>
    </div>
  );
}