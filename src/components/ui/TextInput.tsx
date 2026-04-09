import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import styles from './TextInput.module.css';

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string;
  id?: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { label, error, id: externalId, className, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = externalId ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
        {props.required && <span className={styles.required} aria-hidden="true"> *</span>}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export { TextInput };
export type { TextInputProps };
