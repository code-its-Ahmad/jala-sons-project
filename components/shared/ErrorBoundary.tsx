'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-danger/20 flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-danger" />
          </div>
          <h2 className="text-xl font-heading font-bold mb-2">Something went wrong</h2>
          <p className="text-sm text-muted mb-6 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <RefreshCw size={16} /> Try Again
            </button>
            <Link href="/" className="btn-secondary flex items-center gap-2 text-sm">
              <Home size={16} /> Go Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
