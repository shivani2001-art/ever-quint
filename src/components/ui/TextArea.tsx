import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import styles from './TextArea.module.css';

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string;
  error?: string;
  id?: string;
  rows?: number;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, id: externalId, rows = 4, className, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = externalId ?? generatedId;
  const errorId = `${textareaId}-error`;

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`}>
      <label htmlFor={textareaId} className={styles.label}>
        {label}
        {props.required && <span className={styles.required} aria-hidden="true"> *</span>}
      </label>
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
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

export { TextArea };
export type { TextAreaProps };
