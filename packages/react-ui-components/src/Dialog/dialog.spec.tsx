import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import Portal from 'react-portal';

import IconButton from '../IconButton';
import DialogWithEscape, {DialogProps, DialogWithoutEscape} from './dialog';

describe('<Dialog/>', () => {
    const props: DialogProps = {
        actions: ['Foo 1', 'Foo 2'],
        children: 'Foo children',
        isOpen: false,
        onRequestClose: () => null,
        style: 'wide',
        theme: {
            'dialog': 'dialogClassName',
            'dialog--narrow': 'narrowClassName',
            'dialog--wide': 'wideClassName',
            'dialog__actions': 'actionsClassName',
            'dialog__body': 'bodyClassName',
            'dialog__closeBtn': 'closeBtnClassName',
            'dialog__contents': 'contentsClassName',
            'dialog__contentsPosition': 'contentsPositionClassName',
            'dialog__title': 'titleClassName',
        },
        title: 'Foo title',
    };

    it('Portal should render correctly.', () => {
        const wrapper = shallow(<DialogWithEscape {...props}/>);

        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('Content should render correctly.', () => {
        const wrapper = shallow(<DialogWithoutEscape {...props}/>);

        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should pass a falsy "isOpened" tag to the "Portal" component if the "isOpen" prop is falsy.', () => {
        const wrapper = shallow(<DialogWithEscape {...props}/>);
        const portal = wrapper.find(Portal);

        expect(portal.prop('isOpened')).toBe(false);
    });

    it('should pass a truthy "isOpened" tag to the "Portal" component if the "isOpen" prop is truthy.', () => {
        const wrapper = shallow(<DialogWithEscape {...props} isOpen={true}/>);
        const portal = wrapper.find(Portal);

        expect(portal.prop('isOpened')).toBe(true);
    });

    it('should render the "dialog--wide" className from the "theme" prop if the style is wide.', () => {
        const wrapper = shallow(<DialogWithEscape {...props} style="wide"/>);
        const portal = wrapper.find(Portal);
        const section = portal.find('section');

        expect(section.prop('className')).toContain('wideClassName');
    });

    it('should render the "dialog--narrow" className from the "theme" prop if the style is narrow.', () => {
        const wrapper = shallow(<DialogWithEscape {...props} style="narrow"/>);
        const portal = wrapper.find(Portal);
        const section = portal.find('section');

        expect(section.prop('className')).toContain('narrowClassName');
    });

    it('should render the actions if passed.', () => {
        const wrapper = shallow(<DialogWithoutEscape {...props}/>);

        expect(wrapper.html().includes('Foo 1')).toBeTruthy();
        expect(wrapper.html().includes('Foo 2')).toBeTruthy();
    });

    it('should call the "onRequestClose" prop when clicking on the "IconButtonComponent" component.', () => {
        const onRequestClose = jest.fn();
        const wrapper = shallow(<DialogWithoutEscape {...props} onRequestClose={onRequestClose}/>);
        const btn = wrapper.find(IconButton);

        btn.simulate('click');

        expect(onRequestClose.mock.calls.length).toBe(1);
    });
});
