import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import mergeClassNames from 'classnames';

import {translate} from '@neos-project/neos-ui-i18n';
import {actions, selectors} from '@neos-project/neos-ui-redux-store';
import {searchOptions} from '@neos-project/neos-ui-editors/src/Editors/SelectBox/selectBoxHelpers.js';

const {
    publishableNodesSelector,
    baseWorkspaceSelector,
    allowedTargetWorkspacesSelector
} = selectors.CR.Workspaces;
import {SelectBox} from '@neos-project/react-ui-components';
import {PublishingMode} from '@neos-project/neos-ui-redux-store/src/CR/Publishing';
import {neos} from '@neos-project/neos-ui-decorators';

import style from './style.module.css';

@connect(state => ({
    isSaving: state?.ui?.remote?.isSaving,
    isPublishing: state?.cr?.publishing?.mode === PublishingMode.PUBLISH,
    publishableNodes: publishableNodesSelector(state),
    baseWorkspace: baseWorkspaceSelector(state),
    allowedWorkspaces: allowedTargetWorkspacesSelector(state)
}), {
    changeBaseWorkspaceAction: actions.CR.Workspaces.changeBaseWorkspace,
    start: actions.CR.Publishing.start
})
@neos()
export default class WorkspaceSelector extends PureComponent {
    static propTypes = {
        isSaving: PropTypes.bool,
        isPublishing: PropTypes.bool,
        publishableNodes: PropTypes.array,
        baseWorkspace: PropTypes.string.isRequired,
        allowedWorkspaces: PropTypes.object.isRequired,
        changeBaseWorkspaceAction: PropTypes.func.isRequired,
        changingWorkspaceAllowed: PropTypes.bool
    };

    state = {
        filterTerm: ''
    };

    handleFilterTermChange = filterTerm => {
        this.setState({filterTerm});
    }

    render() {
        const {
            allowedWorkspaces,
            baseWorkspace,
            changeBaseWorkspaceAction,
            isSaving,
            isPublishing,
            publishableNodes
        } = this.props;
        const hasUnpublishedNodes = publishableNodes?.length > 0;
        const canPublishGlobally = !isSaving && !isPublishing && hasUnpublishedNodes;
        const changingWorkspaceAllowed = !canPublishGlobally;

        const publicWorkspaceGroupLabel = translate('Neos.Neos.Ui:Main:publicWorkspaceGroupLabel', 'Public');
        const internalWorkspaceGroupLabel = translate('Neos.Neos.Ui:Main:internalWorkspaceGroupLabel', 'Internal');
        const readOnlyWorkspaceGroupLabel = translate('Neos.Neos.Ui:Main:readOnlyWorkspaceGroupLabel', 'Read-only');

        const workspacesOptions = Object.keys(allowedWorkspaces).map(i => {
            const workspace = allowedWorkspaces[i];
            if (!workspace) {
                return null;
            }
            const group = workspace.readonly ? readOnlyWorkspaceGroupLabel : workspace.name === 'live' ? publicWorkspaceGroupLabel : internalWorkspaceGroupLabel;
            return {
                label: workspace.title,
                value: workspace.name,
                group,
                icon: workspace.readonly ? 'eye' : null
            };
        }).filter(w => w !== null).sort((a, b) => {
            return a.label.localeCompare(b.label);
        });
        const onWorkspaceSelect = workspaceName => {
            changeBaseWorkspaceAction(workspaceName);
        };
        const anyWorkspacesAvailable = Object.keys(allowedWorkspaces).length > 1;

        const classNames = mergeClassNames({
            [style.workspaceSelector]: true,
            [style['workspaceSelector--isDirty']]: hasUnpublishedNodes
        });

        return (<div className={classNames}>
            {anyWorkspacesAvailable ? (
                <SelectBox
                    displaySearchBox
                    searchTerm={this.state.filterTerm}
                    onSearchTermChange={this.handleFilterTermChange}
                    threshold={0}
                    noMatchesFoundLabel={translate('Neos.Neos:Main:noMatchesFound')}
                    searchBoxLeftToTypeLabel={translate('Neos.Neos:Main:searchBoxLeftToType')}
                    className={style.selectBox}
                    options={searchOptions(this.state.filterTerm, workspacesOptions)}
                    value={baseWorkspace}
                    onValueChange={onWorkspaceSelect}
                    disabled={!changingWorkspaceAllowed}
                    headerIcon="layer-group"
                />
            ) : ''}
        </div>);
    }
}
