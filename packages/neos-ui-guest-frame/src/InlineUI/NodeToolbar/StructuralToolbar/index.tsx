import React, {ReactElement} from 'react';
import {connect} from 'react-redux';
import mergeClassNames from 'classnames';

import {InsertPosition} from "@neos-project/neos-ts-interfaces";
import {neos} from "@neos-project/neos-ui-decorators";
import {SynchronousRegistry} from "@neos-project/neos-ui-extensibility";

import style from './style.module.css';
import {GlobalState} from "@neos-project/neos-ui-redux-store/src/System";

const withReduxState = connect((_state: GlobalState) => ({}));

const withNeosGlobals = neos((globalRegistry) => ({
    guestFrameRegistry: globalRegistry.get('@neos-project/neos-ui-guest-frame'),
}));

type StructuralToolbarProps = {
    insertPosition: InsertPosition;
    guestFrameRegistry: SynchronousRegistry<ReactElement>;
    buttonProps?: {[key: string]: any};
}

const StructuralToolbar: React.FC<StructuralToolbarProps> = ({insertPosition, buttonProps, guestFrameRegistry}) => {
    const buttons = guestFrameRegistry.getChildren('NodeToolbar/Buttons');

    const classNames = mergeClassNames({
        [style.structuralToolBar]: true,
        [style['structuralToolBar--isInside']]: insertPosition === InsertPosition.INTO,
        [style['structuralToolBar--isBelow']]: insertPosition === InsertPosition.AFTER,
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

export default React.memo(withReduxState(withNeosGlobals(StructuralToolbar as any)));
