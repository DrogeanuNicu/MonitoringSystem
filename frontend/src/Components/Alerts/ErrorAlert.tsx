import { createSignal } from 'solid-js';
import { Component } from 'solid-js';
import { Alert } from "@suid/material"

interface ErrorAlertProps {
  errorMsg: [() => string, (newValue: string) => void];
}

const ErrorAlert: Component<ErrorAlertProps> = (props) => {
  const [error, setError] = props.errorMsg;

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

export type { ErrorAlertProps };
export default ErrorAlert;
