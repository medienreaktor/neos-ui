import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import mergeClassNames from 'classnames';

import {neos} from '@neos-project/neos-ui-decorators';

import style from './style.module.css';

@neos(globalRegistry => ({
    containerRegistry: globalRegistry.get('containers')
}))
@connect(state => ({
    isFringedLeft: state?.ui?.leftSideBar?.isHidden,
    isFringedRight: state?.ui?.rightSideBar?.isHidden,
    isFullScreen: state?.ui?.fullScreen?.isFullScreen,
}))
export default class SecondaryToolbar extends PureComponent {
    static propTypes = {
        containerRegistry: PropTypes.object.isRequired,
        isFringedLeft: PropTypes.bool.isRequired,
        isFringedRight: PropTypes.bool.isRequired,
        isFullScreen: PropTypes.bool.isRequired,
    };

    render() {
        const {
            containerRegistry,
            isFringedLeft,
            isFringedRight,
            isFullScreen
        } = this.props;
        const classNames = mergeClassNames({
            [style.secondaryToolbar]: true,
            [style['secondaryToolbar--isFringeLeft']]: !isFullScreen && isFringedLeft,
            [style['secondaryToolbar--isFringeRight']]: !isFullScreen && isFringedRight
        });

        // TODO: Introduce a left hand side for the secondary toolbar as we now have space for it
        const SecondaryToolbarRight = containerRegistry.getChildren('SecondaryToolbar/Right');

        return (
            <div className={classNames}>
                <div className={style.secondaryToolbar__rightHandedActions}>
                    {SecondaryToolbarRight.map((Item, key) => <Item key={key}/>)}
                </div>
            </div>
        );
    }
}
