import {SynchronousRegistry} from '@neos-project/neos-ui-registry';

export class RichTextToolbarRegistry extends SynchronousRegistry<{
    component: React.ElementType,
    commandName?: string,
    commandArgs?: any[],
    callbackPropName?: string,
    icon?: string,
    hoverStyle?: string,
    tooltip?: string,
    isVisible: (editorOptions: any) => boolean,
    isActive?: (formattingUnderCursor: any) => boolean
}> {
}
