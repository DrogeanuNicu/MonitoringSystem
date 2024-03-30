import { createSignal } from 'solid-js';
import { Component } from 'solid-js';
import { Alert } from "@suid/material"

interface ErrorMessageProps {
  errorMsgBind?: [() => string, (newValue: string) => void];
}

const ErrorMessage: Component<ErrorMessageProps> = (props) => {
  const [error, setError] = props.errorMsgBind || createSignal('');

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

export type { ErrorMessageProps };
export default ErrorMessage;
