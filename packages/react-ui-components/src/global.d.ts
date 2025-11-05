declare module '*.css';
declare module '*.svg';

/**
 * Extend React's HTMLAttributes to include popover attributes
 */
declare namespace React {
    // eslint-disable-next-line
    interface HTMLAttributes<T> {
        popovertarget?: string;
        popovertargetaction?: 'hide' | 'show' | 'toggle';
        popover?: 'auto' | 'manual' | '';
    }
}
