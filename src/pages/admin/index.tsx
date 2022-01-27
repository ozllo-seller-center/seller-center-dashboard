import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import FilterInput from 'src/components/FilterInput';
import { Loader } from 'src/components/Loader';
import UserTableItem from 'src/components/UserTableItem';
import { useAuth, User } from 'src/hooks/auth';
import { useLoading } from 'src/hooks/loading';
import { useModalMessage } from 'src/hooks/message';
import api from 'src/services/api';
import { UserSummary } from 'src/shared/types/user';
import styles from './styles.module.scss';


interface SearchFormData {
  search: string;
}

interface ProductsProps {
  userFromApi: User;
}

export function Admin({ userFromApi }: ProductsProps) {
  const [users, setUsers] = useState([] as UserSummary[]);
  const [items, setItems] = useState([] as UserSummary[]);
  const [search, setSeacrh] = useState('');

  const { isLoading, setLoading } = useLoading();
  const { showModalMessage: showMessage, modalMessage, handleModalMessage } = useModalMessage();

  const { token, user, updateUser } = useAuth();

  useEffect(() => {
    // !!userFromApi && updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: userFromApi.shopInfo._id } })
  }, [userFromApi])

  // const itemsRef = useMemo(() => Array(items.length).fill(0).map(i => React.createRef<HTMLInputElement>()), [items]);

  const formRef = useRef<FormHandles>(null);
  const [error, setError] = useState('');

  const router = useRouter();



  useEffect(() => {
    setLoading(true);
    api.get('/account/decode').then(response => {
      if (response.data.role !== 'admin') router.push('/');
    }).catch(err => {
      console.log(err)
      setLoading(false);
    });
  }, [])


  useEffect(() => {
    setLoading(true);
    api.get('/account/detail').then(response => {
      updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: response.data.shopInfo._id } })
      setLoading(false);
      // return response.data as User;
    }).catch(err => {
      console.log(err)
      setLoading(false);
    });
  }, [])

  useEffect(() => {
    setLoading(true);

    setItems(users.filter(user => {
      return (!!user.email && (search === '' || user.email.toLowerCase().includes(search.toLowerCase())));
    }));

    setLoading(false);
  }, [search, users]);

  useEffect(() => {
    if (!!user) {
      setLoading(true);

      api.get('/admin/users').then(response => {

        const users = response.data as UserSummary[];

        setUsers(users)
        setItems(users)

        setLoading(false);

      }).catch((error) => {

        console.log(error)

        setLoading(false);
      })
    }
  }, [user]);

  const handleSubmit = useCallback(
    async (data: SearchFormData) => {
      try {
        formRef.current?.setErrors({});

        if (data.search !== search) {
          setSeacrh(data.search);
        }

      } catch (err) {
        setError('Ocorreu um erro ao fazer login, cheque as credenciais.');
      }
    },
    [search],
  );

  const handleModalVisibility = useCallback(() => {
    handleModalMessage(false);
  }, [])

  return (
    <div className={styles.usersContainer}>
      <div className={styles.usersHeader}>
        <h1>Usuários</h1>
      </div>
      <div className={styles.divider} />
      <div className={styles.productsContent}>
        <div className={styles.productsOptions}>
          <div className={styles.contentFilters}>
            <Form ref={formRef} onSubmit={handleSubmit}>
              <FilterInput
                name="search"
                icon={FiSearch}
                placeholder="Pesquise um usuário por email"
                autoComplete="off" />
            </Form>
          </div>
        </div>
        <div className={styles.tableContainer}>
          <br />
          {users.length > 0 ? (
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Usuário</th>
                  <th>Ativo</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {items.map((item, i) => (
                  <UserTableItem
                    key={i}
                    item={item}
                    users={users}
                    setUsers={setUsers}
                    adminInfo={{ adminEmail: user.email, token: token }}
                  />
                ))}
              </tbody>
            </table>
          )
            : (
              <span className={styles.emptyList}> Nenhum item foi encontrado </span>
            )}
        </div>
      </div>
      {
        isLoading && (
          <div className={styles.loadingContainer}>
            <Loader />
          </div>
        )
      }
    </div>
  )
}

export const getInitialProps = async () => {
  return ({
    props: {
    },
    revalidate: 10
  });
}

export default Admin;
