import React, {
  BaseHTMLAttributes,
  HTMLAttributes,
  LiHTMLAttributes,
  useCallback,
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
  defaultItem?: Item;
}

const IntegrationList: React.FC<IntegrationListProps> = ({
  items,
  setActiveItem,
  defaultItem,
}) => {
  const [selectedItem, setSelectedItem] = useState(
    !defaultItem ? items[0] : defaultItem,
  );

  return (
    <div className={styles.container}>
      <div className={styles.selectedItem}>
        <span>
          {
            items[items.findIndex(item => item.value === selectedItem.value)]
              .text
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
