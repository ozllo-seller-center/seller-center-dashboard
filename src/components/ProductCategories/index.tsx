import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { GetStaticProps } from 'next';
import { Nationality } from 'src/shared/types/nationality';
import { Category, SubCategory } from 'src/shared/types/category';

import api from 'src/services/api';
import { useLoading } from 'src/hooks/loading';
import Loader from 'src/components/Loader';
import styles from './styles.module.scss';
import StateButton from '../../components/StateButton';
import Button from '../../components/PrimaryButton';

interface CategoriesDTO {
  nationalities: Nationality[];
  setNationality?: any;
  setCategory?: any;
  setSubCategory?: any;
  setDisplay?: any;
  nationality?: any;
  category?: any;
  subCategory?: any;
}

const ProductCategories: React.FC<CategoriesDTO> = props => {
  const [nationality, setNationality] = useState<Nationality>();
  const [category, setCategory] = useState<Category>();
  const [subCategory, setSubCategory] = useState<SubCategory>();

  const [nationalities, setNationalities] = useState([] as Nationality[]);
  const [categories, setCategories] = useState([] as Category[]);
  const [subCategories, setSubCategories] = useState([] as SubCategory[]);
  const [currentCategoryCode, setCurrentCategoryCode] = useState(0);
  const [currentSubCategoryCode, setCurrentSubCategoryCode] = useState(0);

  const { setLoading, isLoading } = useLoading();

  const { width } = useMemo(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth };
    }

    return {
      width: undefined,
    };
  }, [process.browser]);

  useEffect(() => {
    setLoading(true);

    setNationalities(props.nationalities);

    api
      .get('/category/all')
      .then(response => {
        setCategories(response.data);

        setLoading(false);
      })
      .catch(err => {
        console.log(err);

        setLoading(false);

        return [];
      });
  }, [setLoading]);

  useEffect(() => {
    if (category || currentCategoryCode) {
      setLoading(true);

      api
        .get(`/category/${category?.code || currentCategoryCode}/subcategories`)
        .then(response => {
          setSubCategories(response.data);

          setLoading(false);
        })
        .catch(err => {
          console.log(err);
          setLoading(false);
        });
    }

    setSubCategories([]);
  }, [category, currentCategoryCode, setLoading]);

  const handleNationality = useCallback(
    (n: Nationality) => {
      if (nationality?.id === n.id) {
        setNationality(undefined);
        return;
      }

      setNationality(n);
    },
    [nationality],
  );

  const handleCategory = useCallback(
    (c: Category) => {
      setCategory(undefined);
      if (category?.code === c.code) {
        setCategory(undefined);
        return;
      }

      setCategory(c);
    },
    [category],
  );

  const handleSubCategory = useCallback(
    (sc: SubCategory) => {
      if (subCategory?.code === sc.code) {
        setSubCategory(undefined);
        return;
      }

      setSubCategory(sc);
    },
    [subCategory],
  );

  const handleActiveNationality = (n: Nationality) => {
    if (nationality?.id > 0 && props.nationality > 0) {
      return nationality?.id == n.id;
    }

    return nationality?.id == n.id || props.nationality == n.id;
  };

  const handleActiveCategory = (c: Category) => {
    if (category?.code && category?.code > 0 && currentCategoryCode > 0) {
      return category?.code == c.code;
    }

    return category?.code == c.code || currentCategoryCode == c.code;
  };

  useEffect(() => {
    if (nationality?.id) props.setNationality(nationality.id);
    if (category?.code) props.setCategory(category.code);
    if (subCategory?.code) props.setSubCategory(subCategory.code);
    return () => {
      props.setDisplay(false);
    };
  }, [subCategory]);

  useEffect(() => {
    if (props.category) setCurrentCategoryCode(props.category);
    if (props.subCategory) setCurrentSubCategoryCode(props.subCategory);
  }, [props.subCategory]);

  return (
    <div className={styles.container}>
      <div className={styles.divider} />
      <div className={styles.content}>
        <div className={styles.contentBody}>
          <div className={styles.nationalityContainer}>
            {nationalities.map(n => (
              <StateButton
                key={n.id}
                onClick={() => handleNationality(n)}
                isActive={handleActiveNationality(n)}
                pointer={!!width && width >= 768}
              >
                {n.name}
              </StateButton>
            ))}
          </div>
          {(!!nationality || !!currentCategoryCode) && (
            <div className={styles.categoriesContainer}>
              <div className={styles.categoryContainer}>
                {categories.map((c: Category) => (
                  <StateButton
                    key={c.code}
                    onClick={() => handleCategory(c)}
                    isActive={handleActiveCategory(c)}
                    pointer={!!width && width >= 768}
                    borders
                  >
                    {c.value}
                  </StateButton>
                ))}
              </div>
              {(!!category || !!currentSubCategoryCode) && !isLoading && (
                <div className={styles.subcategoryContainer}>
                  {!!subCategories && subCategories.length > 0 && (
                    <div className={styles.subCategories}>
                      {subCategories.map(sc => (
                        <Button
                          key={sc.code}
                          onClick={() => handleSubCategory(sc)}
                          isActive={
                            subCategory?.code === sc.code ||
                            currentSubCategoryCode === sc.code
                          }
                          customStyle={{
                            className: styles.subCategoryButton,
                            activeClassName: styles.subCategoryActiveButton,
                          }}
                        >
                          {sc.value}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {!!category && isLoading && (
                <div className={styles.loadingContainer}>
                  <Loader />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async props => {
  const data: CategoriesDTO = {
    nationalities: [
      {
        id: '1',
        name: 'Nacional',
      },
      {
        id: '2',
        name: 'Internacional',
      },
    ],
  };

  return {
    props: { ...data },
    revalidate: 10,
  };
};

export default ProductCategories;
