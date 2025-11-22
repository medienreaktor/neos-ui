import * as React from 'react';
import style from './style.module.css';

import {IconButton} from '@neos-project/react-ui-components';
import mergeClassNames from 'classnames';

export const Deletable: React.FC<{
    id?: string,
    onDelete(): void,
    label: string,
    hoverStyle?: 'brand' | 'none',
}> = props => (
    <div className={mergeClassNames(style.container, {[style.hoverStyleBrand]: props.hoverStyle === 'brand'})} id={props.id}>
        <div>{props.children}</div>
        <IconButton className={style.styledButton} icon="xmark" hoverStyle="brand" title={props.label} onClick={props.onDelete}/>
    </div>
)
