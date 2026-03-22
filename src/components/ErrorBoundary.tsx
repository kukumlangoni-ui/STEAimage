import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Zap } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[STEAimage] Runtime error caught by ErrorBoundary:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#09090b',
            padding: '24px',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              width: '100%',
              borderRadius: '24px',
              border: '1px solid rgba(251,191,36,0.15)',
              backgroundColor: 'rgba(24,24,27,0.8)',
              padding: '48px 40px',
              textAlign: 'center',
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                backgroundColor: '#fbbf24',
                marginBottom: '24px',
                boxShadow: '0 0 40px rgba(251,191,36,0.25)',
              }}
            >
              <Zap size={36} color="#09090b" fill="#09090b" />
            </div>

            {/* Brand */}
            <p style={{ color: '#fbbf24', fontWeight: 900, fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
              STEAimage
            </p>

            {/* Heading */}
            <h1 style={{ color: '#ffffff', fontWeight: 900, fontSize: '28px', margin: '0 0 12px' }}>
              Something went wrong
            </h1>

            <p style={{ color: '#a1a1aa', lineHeight: 1.7, marginBottom: '32px' }}>
              The app hit an unexpected error. This has been logged. You can try reloading the page.
            </p>

            {/* Error detail */}
            {this.state.error && (
              <div
                style={{
                  backgroundColor: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '28px',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <AlertTriangle size={16} color="#f87171" />
                  <span style={{ color: '#f87171', fontWeight: 700, fontSize: '13px' }}>Error</span>
                </div>
                <code style={{ color: '#fca5a5', fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {this.state.error.message}
                </code>
              </div>
            )}

            {/* Retry button */}
            <button
              onClick={this.handleRetry}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#fbbf24',
                color: '#09090b',
                fontWeight: 800,
                fontSize: '15px',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 32px',
                cursor: 'pointer',
                marginBottom: '16px',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              <RefreshCw size={18} />
              Try Again
            </button>

            <button
              onClick={() => { window.location.href = '/'; }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'transparent',
                color: '#a1a1aa',
                fontWeight: 600,
                fontSize: '14px',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '12px 32px',
                cursor: 'pointer',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              Go to Home Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
