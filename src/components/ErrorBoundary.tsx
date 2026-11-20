import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[ErrorBoundary] caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-base font-bold text-slate-800">Something went wrong</p>
          <p className="text-sm text-slate-500">Please try again. If the problem persists, reload the app.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white active:scale-95"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
