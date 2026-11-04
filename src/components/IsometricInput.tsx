import React from 'react';

interface IsometricInputProps {
  label: string;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  icon?: React.ReactNode;
  onButtonClick?: () => void;
  id?: string;
}

export const IsometricInput: React.FC<IsometricInputProps> = ({
  label,
  type = 'text',
  value,
  placeholder,
  onChange,
  required = false,
  autoComplete,
  icon,
  onButtonClick,
  id,
}) => {
  return (
    <div className="input-3d-wrapper">
      <div className="input__container" data-label={label}>
        <div className="shadow__input"></div>
        {icon && (
          <button
            type="button"
            className="input__button__shadow"
            onClick={onButtonClick}
            tabIndex={-1}
            title={label}
          >
            {icon}
          </button>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="input__search"
        />
      </div>
    </div>
  );
};
