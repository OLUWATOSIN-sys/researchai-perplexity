export default function LoadingDots() {
  return (
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
  );
}