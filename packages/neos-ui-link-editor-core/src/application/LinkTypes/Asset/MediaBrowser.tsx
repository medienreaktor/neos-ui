import * as React from 'react'
import style from './mediaBrowserStyle.module.css'

import {getRegistryById} from '@neos-project/neos-ui-registry';
import {ErrorView} from '@neos-project/neos-ui-error';

interface Props {
    assetIdentifier: null | string
    onSelectAsset: (assetIdentifier: string) => void
}

export const MediaBrowser: React.FC<Props> = (props) => {
    const secondaryEditorsRegistry = getRegistryById('inspector')?.get('secondaryEditors');

    const secondaryEditorId = 'Neos.Neos/Inspector/Secondary/Editors/MediaSelectionScreen';
    const secondaryEditor = secondaryEditorsRegistry?.get(secondaryEditorId);

    const MediaSelectionScreenComponent = secondaryEditor?.component;

    return (
        <div className={style.container}>
            {
                MediaSelectionScreenComponent ? (
                    <MediaSelectionScreenComponent
                        assetIdentifier={props.assetIdentifier}
                        onComplete={props.onSelectAsset}
                        constraints={{mediaTypes: []}}
                    />
                ) : <ErrorView error={`Cannot find secondary editor "${secondaryEditorId}". Selected asset "${props.assetIdentifier}"`}/>
            }
        </div>
    )
}
