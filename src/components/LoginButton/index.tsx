import React, { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  children, className, loading, ...rest
}) => (
  <button type="button" className={className} {...rest}>
    {loading ? 'Carregando...' : children}
  </button>
);

export default Button;
