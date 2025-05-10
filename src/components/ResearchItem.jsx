import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function ResearchItem({ item, active, onClick }) {
  return (
    <div 
      className={`research-item ${active ? 'active' : ''}`}
      onClick={() => onClick(item.title)}
    >
      <div className="research-item-icon">
        <FontAwesomeIcon icon={item.icon} />
      </div>
      <div className="research-item-content">
        <div className="research-item-title">{item.title}</div>
        <div className="research-item-date">Last updated {item.updated}</div>
      </div>
    </div>
  );
}