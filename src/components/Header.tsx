import './Header.css';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title = "Curious Claude", subtitle = "Interactive AI Assistant" }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">{title}</h1>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>
    </header>
  );
}