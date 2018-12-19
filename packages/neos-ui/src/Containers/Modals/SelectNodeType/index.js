import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {$get} from 'plow-js';

import {neos} from '@neos-project/neos-ui-decorators';
import {actions, selectors} from '@neos-project/neos-ui-redux-store';

import Button from '@neos-project/react-ui-components/src/Button/';
import Dialog from '@neos-project/react-ui-components/src/Dialog/';
import I18n from '@neos-project/neos-ui-i18n';

import {InsertModeSelector} from '@neos-project/neos-ui-containers';
import NodeTypeGroupPanel from './nodeTypeGroupPanel';
import NodeTypeFilter from './nodeTypeFilter';
import style from './style.css';

const calculateInitialMode = (allowedSiblingNodeTypes, allowedChildNodeTypes, preferredMode) => {
    if (
        ((preferredMode === 'before' || preferredMode === 'after') && allowedSiblingNodeTypes.length) ||
        (preferredMode === 'into' && allowedChildNodeTypes.length)
    ) {
        return preferredMode;
    }
    if (allowedSiblingNodeTypes.length) {
        return 'after';
    }

    if (allowedChildNodeTypes.length) {
        return 'into';
    }

    return '';
};

@neos(globalRegistry => ({
    nodeTypesRegistry: globalRegistry.get('@neos-project/neos-ui-contentrepository')
}))
@connect((state, {nodeTypesRegistry}) => {
    const getAllowedSiblingNodeTypesSelector = selectors.CR.Nodes.makeGetAllowedSiblingNodeTypesSelector(nodeTypesRegistry);
    const getAllowedChildNodeTypesSelector = selectors.CR.Nodes.makeGetAllowedChildNodeTypesSelector(nodeTypesRegistry);

    return state => {
        const reference = $get('ui.selectNodeTypeModal.referenceNodeContextPath', state);
        const referenceNodeType = selectors.CR.Nodes.getPathInNode(state, reference, 'nodeType');
        const role = nodeTypesRegistry.hasRole(referenceNodeType, 'document') ? 'document' : 'content';
        const allowedSiblingNodeTypes = nodeTypesRegistry.getGroupedNodeTypeList(getAllowedSiblingNodeTypesSelector(state, {reference, role}));
        const allowedChildNodeTypes = nodeTypesRegistry.getGroupedNodeTypeList(getAllowedChildNodeTypesSelector(state, {reference, role}));

        return {
            isOpen: $get('ui.selectNodeTypeModal.isOpen', state),
            preferredMode: $get('ui.selectNodeTypeModal.preferredMode', state),
            allowedSiblingNodeTypes,
            allowedChildNodeTypes
        };
    };
}, {
    cancel: actions.UI.SelectNodeTypeModal.cancel,
    apply: actions.UI.SelectNodeTypeModal.apply
})
export default class SelectNodeType extends PureComponent {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        preferredMode: PropTypes.string,
        nodeTypesRegistry: PropTypes.object.isRequired,
        allowedSiblingNodeTypes: PropTypes.array,
        allowedChildNodeTypes: PropTypes.array,
        cancel: PropTypes.func.isRequired,
        apply: PropTypes.func.isRequired
    };

    state = {
        filterSearchTerm: '',
        insertMode: calculateInitialMode(
            this.props.allowedSiblingNodeTypes,
            this.props.allowedChildNodeTypes,
            this.props.preferredMode
        ),
        activeHelpMessageGroupPanel: '',
        showHelpMessageFor: ''
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.allowedSiblingNodeTypes !== nextProps.allowedSiblingNodeTypes ||
            this.props.allowedChildNodeTypes !== nextProps.allowedChildNodeTypes) {
            this.setState({
                insertMode: calculateInitialMode(
                    nextProps.allowedSiblingNodeTypes,
                    nextProps.allowedChildNodeTypes,
                    nextProps.preferredMode
                )
            });
        }
    }

    handleModeChange = insertMode => this.setState({insertMode});

    handleCancel = () => {
        const {cancel} = this.props;
        this.setState({
            filterSearchTerm: ''
        });
        cancel();
    }

    handleApply = nodeType => {
        const {apply} = this.props;
        const {insertMode} = this.state;

        apply(insertMode, nodeType);
    };

    handleCloseHelpMessage = () => {
        this.setState({
            showHelpMessageFor: ''
        });
    }

    handleHelpMessage = (nodeType, groupPanel) => {
        this.setState({
            showHelpMessageFor: nodeType === this.state.showHelpMessageFor ? '' : nodeType,
            activeHelpMessageGroupPanel: groupPanel
        });
    }

    getAllowedNodeTypesByCurrentInsertMode() {
        const {insertMode} = this.state;
        const {allowedSiblingNodeTypes, allowedChildNodeTypes} = this.props;

        switch (insertMode) {
            case 'into':
                return allowedChildNodeTypes;

            case 'before':
            case 'after':
                return allowedSiblingNodeTypes;

            default:
                return [];
        }
    }

    renderCancelAction() {
        return (
            <Button
                key="cancel"
                style="lighter"
                hoverStyle="brand"
                onClick={this.handleCancel}
                >
                <I18n id="Neos.Neos:Main:cancel" fallback="Cancel"/>
            </Button>
        );
    }

    renderSelectNodeTypeDialogHeader() {
        const {insertMode, filterSearchTerm} = this.state;
        const {allowedSiblingNodeTypes, allowedChildNodeTypes} = this.props;

        return (
            <div className={style.nodeTypeDialogHeader} key="nodeTypeDialogHeader">
                <InsertModeSelector
                    mode={insertMode}
                    onSelect={this.handleModeChange}
                    enableAlongsideModes={Boolean(allowedSiblingNodeTypes.length)}
                    enableIntoMode={Boolean(allowedChildNodeTypes.length)}
                    />
                <NodeTypeFilter
                    filterSearchTerm={filterSearchTerm}
                    onChange={this.handleNodeTypeFilterChange}
                    />
            </div>
        );
    }

    handleNodeTypeFilterChange = filterSearchTerm => this.setState({filterSearchTerm});

    skipNodeTypeDialogIfPossible() {
        const {insertMode} = this.state;
        if (insertMode === 'into' &&
            this.getAllowedNodeTypesByCurrentInsertMode().length === 1 &&
            this.getAllowedNodeTypesByCurrentInsertMode()[0].nodeTypes.length === 1) {
            this.handleApply(this.getAllowedNodeTypesByCurrentInsertMode()[0].nodeTypes[0].name);
            return true;
        }

        return false;
    }

    render() {
        const {isOpen} = this.props;

        if (!isOpen || this.skipNodeTypeDialogIfPossible()) {
            return null;
        }

        return (
            <Dialog
                actions={[this.renderCancelAction()]}
                title={[this.renderSelectNodeTypeDialogHeader()]}
                onRequestClose={this.handleCancel}
                isOpen
                style="wide"
                id="neos-SelectNodeTypeDialog"
                >
                {this.getAllowedNodeTypesByCurrentInsertMode().map((group, key) => (
                    <div key={key}>
                        <NodeTypeGroupPanel
                            group={group}
                            filterSearchTerm={this.state.filterSearchTerm}
                            onSelect={this.handleApply}
                            showHelpMessageFor ={this.state.showHelpMessageFor}
                            activeHelpMessageGroupPanel ={this.state.activeHelpMessageGroupPanel}
                            onHelpMessage={this.handleHelpMessage}
                            onCloseHelpMessage={this.handleCloseHelpMessage}
                            />
                    </div>
                ))}
            </Dialog>
        );
    }
}
