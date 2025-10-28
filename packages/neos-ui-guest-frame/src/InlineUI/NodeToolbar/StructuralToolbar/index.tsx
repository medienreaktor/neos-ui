import React, {ReactElement} from 'react';
import mergeClassNames from 'classnames';

import {InsertPosition} from "@neos-project/neos-ts-interfaces";
import {neos} from "@neos-project/neos-ui-decorators";
import {SynchronousRegistry} from "@neos-project/neos-ui-extensibility";

import style from './style.module.css';

const withNeosGlobals = neos((globalRegistry) => ({
    guestFrameRegistry: globalRegistry.get('@neos-project/neos-ui-guest-frame'),
}));

type StructuralToolbarProps = {
    insertPosition: InsertPosition;
    guestFrameRegistry: SynchronousRegistry<ReactElement>;
    buttonProps?: {[key: string]: any};
}

/**
 * The StructuralToolbar contains buttons for structural operations on nodes,
 * like adding or inserting nodes from clipboard.
 */
const StructuralToolbar: React.FC<StructuralToolbarProps> = ({insertPosition, buttonProps, guestFrameRegistry}) => {
    const buttons = guestFrameRegistry.getChildren('NodeToolbar/Buttons');

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

export default React.memo(withNeosGlobals(StructuralToolbar as any));
