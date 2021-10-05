import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconBaseProps } from 'react-icons';

import { FiCheck, FiX } from 'react-icons/fi';
import { BsDot } from 'react-icons/bs';
import ReactTooltip from 'react-tooltip';

import styles from './styles.module.scss'

export type Rule = {
  state?: boolean,
  descr: string,
}

interface RuledHintboxProps {
  title?: string;
  example?: string;
  icon: React.ComponentType<IconBaseProps>;
  rules: Rule[];
}

const RuledHintbox: React.FC<RuledHintboxProps> = ({ title, example, icon: Icon, rules }) => {

  const [ruleCheck, setRuleCheck] = useState(false);

  useEffect(() => {

    let check = true;

    rules.map(rule => {
      if (check && rule.state !== undefined)
        check = rule.state
    })

    setRuleCheck(check)
  }, [rules])

  return (
    <>
      <Icon
        className={ruleCheck ? styles.icon : styles.iconError}
        data-tip
        data-for='global'
      />
      <ReactTooltip
        id='global'
        effect='solid'
        backgroundColor={'var(--white)'}
        className={styles.container}
      >
        {!!title && (
          <div className={styles.titleContainer}>
            <span>{title}</span>
          </div>
        )}
        <div>
          {
            rules.map((rule, i) => (
              <div key={i} className={styles.rulesContainer}>
                {rule.state === undefined ? <BsDot /> : rule.state ? <FiCheck className={styles.green} /> : <FiX className={styles.red} />}
                <span className={rule.state === undefined ? '' : rule.state === true ? styles.green : styles.red}>{rule.descr}</span>
              </div>
            ))
          }
        </div>
        {!!example && (
          <span className={styles.example}>{example}</span>
        )}
      </ReactTooltip>
    </>
  );
};

export default RuledHintbox;
