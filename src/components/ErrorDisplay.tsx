import './ErrorDisplay.css';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorDisplay({ error, onRetry, onDismiss }: ErrorDisplayProps) {
  return (
    <div className="error-display">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <div className="error-message">
          <h3>Something went wrong</h3>
          <p>{error}</p>
        </div>
        <div className="error-actions">
          {onRetry && (
            <button className="retry-button" onClick={onRetry}>
              Try Again
            </button>
          )}
          {onDismiss && (
            <button className="dismiss-button" onClick={onDismiss}>
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}