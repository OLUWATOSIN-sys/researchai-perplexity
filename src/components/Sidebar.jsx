import ResearchItem from './ResearchItem';
import Badge from './Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faTags, faFileExport, faHashtag } from '@fortawesome/free-solid-svg-icons';

export default function Sidebar({ 
  researchItems, 
  activeResearch, 
  onResearchSelect, 
  tags, 
  onGeneratePDF 
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title"><FontAwesomeIcon icon={faFolderOpen} /> Current Research</h3>
        {researchItems.map(item => (
          <ResearchItem
            key={item.id}
            item={item}
            active={item.title === activeResearch}
            onClick={onResearchSelect}
          />
        ))}
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title"><FontAwesomeIcon icon={faTags} /> Tags</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {tags.map(tag => (
            <Badge key={tag} icon={faHashtag} text={tag} />
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title"><FontAwesomeIcon icon={faFileExport} /> Export</h3>
        <button className="btn btn-primary btn-block" onClick={onGeneratePDF}>
          <FontAwesomeIcon icon={faFilePdf} />
          <span>Generate PDF Report</span>
        </button>
      </div>
    </aside>
  );
}