import React, {ReactElement} from 'react';
import mergeClassNames from "classnames";

import {InsertPosition} from "@neos-project/neos-ts-interfaces";

import style from './style.module.css';

type StructuralToolbarProps = {
    insertPosition: InsertPosition;
    buttons: ReactElement[];
    buttonProps?: {[key: string]: any};
}

const StructuralToolbar: React.FC<StructuralToolbarProps> = ({insertPosition, buttons, buttonProps}) => {

    const classNames = mergeClassNames({
        [style.structuralToolBar__popover]: true,
        [style['structuralToolBar__popover--isInside']]: insertPosition === InsertPosition.INTO,
        [style['structuralToolBar__popover--isBelow']]: insertPosition === InsertPosition.AFTER,
    });

    return (
        <div className={classNames}>
            <div className={style.toolBar} data-ignore_click_outside="true">
                <div className={style.toolBar__btnGroup}>
                    {buttons.map((Item: ReactElement, key: number) => <Item key={key} {...buttonProps} />)}
                </div>
            </div>
        </div>
    );
}

export default React.memo(StructuralToolbar);
