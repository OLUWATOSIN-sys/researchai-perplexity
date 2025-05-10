export default function Citation({ author, year, title, url }) {
  return (
    <div className="citation">
      {author} ({year}). "{title}". <a href={url} target="_blank" rel="noopener noreferrer">View source</a>
    </div>
  );
}