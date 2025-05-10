import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Badge({ type = '', icon, text }) {
  const badgeClasses = {
    '': 'badge',
    'success': 'badge badge-success',
    'warning': 'badge badge-warning',
    'error': 'badge badge-error'
  };

  return (
    <div className={badgeClasses[type]}>
      <FontAwesomeIcon icon={icon} />
      <span>{text}</span>
    </div>
  );
}