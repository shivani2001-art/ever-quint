import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import styles from './Select.module.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string;
  options: SelectOption[];
  error?: string;
  id?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, error, id: externalId, className, ...props },
  ref,
) {
  const generatedId = useId();
  const selectId = externalId ?? generatedId;
  const errorId = `${selectId}-error`;

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
        {props.required && <span className={styles.required} aria-hidden="true"> *</span>}
      </label>
      <div className={styles.selectContainer}>
        <select
          ref={ref}
          id={selectId}
          className={`${styles.select} ${error ? styles.selectError : ''}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.arrow} aria-hidden="true">
          &#9662;
        </span>
      </div>
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export { Select };
export type { SelectProps, SelectOption };
