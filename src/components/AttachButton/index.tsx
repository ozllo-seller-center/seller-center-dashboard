import React, { ButtonHTMLAttributes, useCallback, useEffect, useRef, useState } from 'react';

import { FiPaperclip } from 'react-icons/fi';
import Tooltip from '../../components/Tooltip';

import styles from './styles.module.scss';
import { Form } from '@unform/web';
import { FormHandles, SubmitHandler, useField } from '@unform/core';

interface AttachButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  name: string;
  title: string;
  isAttached: boolean;
  unattachedText: string;
  attachedText: string;
  placeholder: string;
}

const AttachButton: React.FC<AttachButtonProps> = ({ name, title, placeholder, isAttached, unattachedText, attachedText, ...rest }) => {
  return (
    <div className={styles.container}>
      <button {...rest}>
        <FiPaperclip />
        {isAttached ? <span>{attachedText}</span> : <span>{unattachedText}</span>}
      </button>
    </div>
  )
}

export default AttachButton;
