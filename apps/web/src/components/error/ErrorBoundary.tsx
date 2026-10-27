'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service (e.g., Sentry)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // window.Sentry?.captureException(error, { extra: errorInfo });
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 font-sans text-foreground">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-hn-md">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-error-soft">
                <AlertCircle className="h-9 w-9 text-error-ink" aria-hidden="true" />
              </div>

              <h1 className="mb-2 font-display text-2xl leading-tight text-foreground">
                Đã xảy ra lỗi
              </h1>

              <p className="mb-6 text-base leading-relaxed text-muted-foreground">
                Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 w-full text-left">
                  <summary className="mb-2 cursor-pointer text-sm font-semibold text-foreground">
                    Chi tiết lỗi (Development)
                  </summary>
                  <div className="max-h-60 overflow-auto rounded-md bg-muted p-4">
                    <pre className="whitespace-pre-wrap font-mono text-xs text-error-ink">
                      {this.state.error.toString()}
                      {this.state.errorInfo && (
                        <>
                          {'\n\n'}
                          {this.state.errorInfo.componentStack}
                        </>
                      )}
                    </pre>
                  </div>
                </details>
              )}

              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <button
                  onClick={this.handleReload}
                  className="inline-flex h-[42px] flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/[0.125] motion-reduce:transition-none"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Tải lại trang
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="inline-flex h-[42px] flex-1 items-center justify-center gap-2 rounded-md border border-primary bg-transparent px-4 text-sm font-semibold text-primary transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/[0.125] motion-reduce:transition-none"
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  Về trang chủ
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={this.handleReset}
                  className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-md px-3 text-xs font-semibold text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/[0.125] motion-reduce:transition-none"
                >
                  Reset Error Boundary (Dev)
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
