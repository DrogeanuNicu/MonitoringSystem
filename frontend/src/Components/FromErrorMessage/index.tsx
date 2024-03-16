import { createSignal } from 'solid-js';

const FormErrorMessage = (props) => {
  const [error, setError] = props.bind || createSignal('');

  return (
    <div>
      {error() && (
        <div class="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md shadow-md">
          <p>{error()}</p>
        </div>
      )}
    </div>
  );
};

export default FormErrorMessage;
