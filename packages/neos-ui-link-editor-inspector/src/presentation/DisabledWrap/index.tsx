import React from 'react';
import styles from './style.module.css'

export const DisabledWrap: React.FC = props => {
    return <div className={styles.disabled}>{props.children}</div>
}
