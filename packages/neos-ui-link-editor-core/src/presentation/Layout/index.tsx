import style from './style.module.css';
import React from 'react';

export const Stack: React.FC = ({children}) => <div className={style.stack}>{children}</div>;
