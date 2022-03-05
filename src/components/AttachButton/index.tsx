import React, {
  ButtonHTMLAttributes,
} from 'react';

import { FiPaperclip } from 'react-icons/fi';

import styles from './styles.module.scss';

interface AttachButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  name: string;
  title: string;
  isAttached: boolean;
  unattachedText: string;
  attachedText: string;
  placeholder: string;
}

const AttachButton: React.FC<AttachButtonProps> = ({
  name, title, placeholder, isAttached, unattachedText, attachedText, ...rest
}) => (
  <div className={styles.container}>
    <button type="button" {...rest}>
      <FiPaperclip />
      {isAttached ? <span>{attachedText}</span> : <span>{unattachedText}</span>}
    </button>
  </div>
);

export default AttachButton;
