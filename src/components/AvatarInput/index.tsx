import React from 'react';
import { FiCamera } from 'react-icons/fi';

import styles from './styles.module.scss';

interface AvatarInputProps {
  avatarUrl: string;
  userName: string;
  handleAvatarChange: React.ChangeEventHandler<HTMLInputElement>;
}

const AvatarInput: React.FC<AvatarInputProps> = ({ avatarUrl, userName, handleAvatarChange }) => (
  <div className={avatarUrl ? styles.avatarInput : styles.emptyAvatarInput}>
    {!!avatarUrl && <img src={avatarUrl} alt={userName} />}
    <label htmlFor="avatar">
      <FiCamera />

      <input type="file" accept="image/x-png,image/gif,image/jpeg" id="avatar" onChange={handleAvatarChange} />
    </label>
  </div>
);

export default AvatarInput;
