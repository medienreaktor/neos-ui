import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {$get, $transform} from 'plow-js';
import {connect} from 'react-redux';
import SelectBox from '@neos-project/react-ui-components/src/SelectBox/';
import {neos} from '@neos-project/neos-ui-decorators';
import {actions, selectors} from '@neos-project/neos-ui-redux-store';
import style from './style.css';

const {publishableNodesSelector, publishableNodesInDocumentSelector, baseWorkspaceSelector, personalWorkspaceNameSelector} = selectors.CR.Workspaces;

@connect($transform({
    isSaving: $get('ui.remote.isSaving'),
    isPublishing: $get('ui.remote.isPublishing'),
    isDiscarding: $get('ui.remote.isDiscarding'),
    publishableNodes: publishableNodesSelector,
    publishableNodesInDocument: publishableNodesInDocumentSelector,
    personalWorkspaceName: personalWorkspaceNameSelector,
    baseWorkspace: baseWorkspaceSelector
}), {
    changeBaseWorkspaceAction: actions.CR.Workspaces.changeBaseWorkspace,
})
@neos(globalRegistry => ({
    i18nRegistry: globalRegistry.get('i18n')
}))

export default class WorkspaceSelector extends PureComponent {
    static propTypes = {
        isSaving: PropTypes.bool,
        isPublishing: PropTypes.bool,
        isDiscarding: PropTypes.bool,
        publishableNodes: PropTypes.array,
        publishableNodesInDocument: PropTypes.array,
        personalWorkspaceName: PropTypes.string.isRequired,
        baseWorkspace: PropTypes.string.isRequired,
        changeBaseWorkspaceAction: PropTypes.func.isRequired,
        neos: PropTypes.object.isRequired,
        i18nRegistry: PropTypes.object.isRequired
    };

    render() {
        const {isSaving, isPublishing, isDiscarding, publishableNodes, publishableNodesInDocument, personalWorkspaceName, baseWorkspace, changeBaseWorkspaceAction, i18nRegistry, neos} = this.props;

        const allowedWorkspaces = $get('configuration.allowedTargetWorkspaces', neos);
        const canPublishLocally = !isSaving && !isPublishing && !isDiscarding && publishableNodesInDocument && (publishableNodesInDocument.length > 0);
        const canPublishGlobally = !isSaving && !isPublishing && !isDiscarding && publishableNodes && (publishableNodes.length > 0);
        const changingWorkspaceAllowed = !canPublishGlobally;

        const workspacesOptions = Object.keys(allowedWorkspaces).map(i => $transform({label: $get('title'), value: $get('name')}, allowedWorkspaces[i]));
        const onWorkspaceSelect = workspaceName => {
            changeBaseWorkspaceAction(workspaceName);
        };
        const anyWorkspacesAvailable = Object.keys(allowedWorkspaces).length > 1;
        const baseWorkspaceTitle = $get([baseWorkspace, 'title'], allowedWorkspaces);

        return (<div className={style.wrapper}>
            {anyWorkspacesAvailable && (changingWorkspaceAllowed ?
                <SelectBox
                    className={style.selectBox}
                    options={workspacesOptions}
                    value={baseWorkspace}
                    onValueChange={onWorkspaceSelect}
                    /> :
                <div className={style.notAllowed} title={i18nRegistry.translate('Neos.Neos:Main:content.components.dirtyWorkspaceDialog.dirtyWorkspaceContainsChanges')}>
                    {baseWorkspaceTitle} – {i18nRegistry.translate('Neos.Neos:Main:content.components.dirtyWorkspaceDialog.dirtyWorkspaceHeader')}
                </div>
            )}
        </div>);
    }
}
