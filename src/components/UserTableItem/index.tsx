import { createTheme, MuiThemeProvider, Switch } from '@material-ui/core';
import { useRouter } from 'next/router';
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { FiLogIn } from 'react-icons/fi';
import { useAuth } from 'src/hooks/auth';
import { UserSummary } from 'src/shared/types/user';
import styles from './styles.module.scss';

const theme = createTheme({
  palette: {
    primary: {
      main: '#E2E2E2',
    },
    secondary: {
      main: '#FFFFFF',
    },
  },
});

interface UserItemProps {
  users: UserSummary[],
  setUsers: Function,
  item: UserSummary,
  adminInfo: {
    adminEmail: string,
    token: string
  }
}

const UserTableItem: React.FC<UserItemProps> = ({
  item, users, setUsers, adminInfo,
}) => {
  const [isActive, setIsActive] = useState(item.isActive);

  const itemRef = useRef<HTMLInputElement>(null);

  const { adminSignIn } = useAuth();

  const router = useRouter();

  useEffect(() => {
    const index = users.findIndex((user) => user._id === item._id);

    const updateUsers = users;

    updateUsers[index].isActive = item.isActive;

    setUsers(updateUsers);
  }, [item]);

  const handleLogin = useCallback(async (id: string) => {
    await adminSignIn({
      adminEmail: adminInfo.adminEmail,
      userId: id,
      authToken: adminInfo.token,
    });

    router.push('/');
  }, []);

  return (
    <tr className={styles.tableItem} key={item._id}>
      <td id={styles.nameCell}>
        {item.email}
      </td>

      <td id={styles.switchCell}>
        <MuiThemeProvider theme={theme}>
          <Switch
            inputRef={itemRef}
            checked={item.isActive}
          />
        </MuiThemeProvider>
        <span className={styles.switchSubtitle}>{isActive ? 'Ativado' : 'Desativado'}</span>
      </td>
      <td id={styles.editCell}>
        <div onClick={() => {
          handleLogin(item._id);
        }}
        >
          <FiLogIn />
          <span> Logar </span>
        </div>
      </td>
    </tr>
  );
};

export default UserTableItem;
