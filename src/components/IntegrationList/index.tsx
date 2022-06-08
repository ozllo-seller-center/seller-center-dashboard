import React, {
  BaseHTMLAttributes,
  HTMLAttributes,
  LiHTMLAttributes,
  useCallback,
  useEffect,
  useState,
} from 'react';

import styles from './styles.module.scss';

type Item = {
  text: string;
  value: string;
};

interface IntegrationListProps {
  items: Item[];
  setActiveItem: React.Dispatch<any>;
  defaultItem?: string;
}

const IntegrationList: React.FC<IntegrationListProps> = ({
  items,
  setActiveItem,
  defaultItem,
}) => {
  const [selectedItem, setSelectedItem] = useState(items[0]);

  useEffect(() => {
    setSelectedItem(items.find(item => item.value === defaultItem) || items[0]);
  }, [defaultItem, items]);

  return (
    <div className={styles.container}>
      <div className={styles.selectedItem}>
        <span>
          {
            items[items.findIndex(item => item.value === selectedItem.value)]
              ?.text
          }
        </span>
      </div>
      <div className={styles.items}>
        {items.map(item => {
          if (item.value !== selectedItem.value) {
            return (
              <button
                key={item.value}
                onClick={() => {
                  setSelectedItem(item);
                  setActiveItem(item.value);
                }}
              >
                {item.text}
              </button>
            );
          }
        })}
      </div>
    </div>
  );
};

export default IntegrationList;
