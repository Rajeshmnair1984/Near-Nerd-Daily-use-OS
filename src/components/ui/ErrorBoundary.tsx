import { Component, ReactNode, ErrorInfo } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-main)",
            padding: "2rem",
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: "500px",
              padding: "2rem",
              borderRadius: "1rem",
              background: "rgba(30, 41, 59, 0.7)",
              border: "1px solid var(--border)",
            }}
          >
            <AlertCircle
              size={48}
              color="var(--error)"
              style={{ marginBottom: "1rem" }}
            />
            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              Oops! Something went wrong
            </h1>
            <p
              style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}
            >
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={this.resetError}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                background: "var(--primary)",
                color: "white",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
