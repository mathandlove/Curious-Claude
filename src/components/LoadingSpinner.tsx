import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export default function LoadingSpinner({ size = 'medium', message = 'Thinking...' }: LoadingSpinnerProps) {
  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}