import React, { LiHTMLAttributes, useCallback, useState } from 'react';

import styles from './styles.module.scss';

type Item = {
  text: string;
  value: string;
}

interface HeaderDropdownProps extends LiHTMLAttributes<HTMLLIElement> {
  items: Item[];
  setActiveItem: Function;
}

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({
  items, setActiveItem, children, ...rest
}) => {
  const [selectedItem, setSelectedItem] = useState(items[0].value);
  const [isFocused, setIsFocused] = useState(false);

  const handleInputFocused = useCallback(() => {
    setIsFocused(!isFocused);
  }, [isFocused]);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <nav role="menu" className={styles.nav}>
      <li
        onFocus={handleInputFocused}
        onBlur={handleInputBlur}
        className={styles.dropdownContainer}
        {...rest}
      >
        <span>{items[items.findIndex((item) => item.value === selectedItem)].text}</span>
        <ul className={styles.dropdown}>
          {
            items.map((item) => {
              if (item.value !== selectedItem) {
                return (
                  <li onClick={() => {
                    setSelectedItem(item.value);
                    setActiveItem(item.value);
                  }}
                  >
                    {item.text}
                  </li>
                );
              }
            })
          }
        </ul>
      </li>
    </nav>
  );
};

export default HeaderDropdown;
