import { createSignal } from 'solid-js';
import { Component } from 'solid-js';
import { Alert } from "@suid/material"

interface ErrorMessageProps {
  errorSignalBind?: [() => string, (newValue: string) => void];
}

const ErrorMessage: Component<ErrorMessageProps> = (props) => {
  const [error, setError] = props.errorSignalBind || createSignal('');

  return (
    <div>
      {error() && (
        <div>
          <Alert severity="error">{error()}</Alert>
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;
