import { GroupTypeBase, Styles } from 'react-select';

const customStyles: Partial<
  Styles<
    {
      value: string;
      label: string;
    },
    false,
    GroupTypeBase<{
      value: string;
      label: string;
    }>
  >
> = {
  container: () => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    background: 'var(--white)',
    alignSelf: 'center',
    justifySelf: 'stretch',
    borderRadius: '4px',
    boxShadow: ' 0 0 20px rgba(0,0,0,0.15), 0 0 6px rgba(0,0,0,0.20)',
  }),
  control: () => ({
    // none of react-select's styles are passed to <Control />
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    padding: '0.5rem',
  }),
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = 'opacity 300ms';

    return {
      ...provided,
      opacity,
      transition,
      display: 'inline-flex',
    };
  },
  indicatorSeparator: () => ({
    display: 'none',
  }),
  menu: (provided, state) => ({
    ...provided,
  }),
  option: (provided, state) => ({
    ...provided,
    background: state.isSelected ? 'var(--red-100)' : 'var(--white)',
  }),
};

export default customStyles;
