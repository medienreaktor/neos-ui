/* eslint-disable camelcase, react/jsx-pascal-case */
import React from 'react';
import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';
import {createStubComponent} from '../_lib/testUtils';
import SelectBox_Option_MultiLineWithThumbnail from './selectBox_Option_MultiLineWithThumbnail';

describe('<SelectBox_Option_MultiLineWithThumbnail/>', () => {
    let props;

    beforeEach(() => {
        props = {
            label: 'Foo label',
            title: 'Foo title',
            secondaryLabel: 'Foo secondary label',
            tertiaryLabel: 'Foo tertiary label',
            imageUri: 'https://some.image.uri/foo.png',
            icon: '<i class="fas fa-question"></i>',
            option: {label: 'Bar label'},
            onClick: jest.fn(),
            theme: {},
            ListPreviewElement: createStubComponent()
        };
    });

    it('should render correctly.', () => {
        const wrapper = shallow(<SelectBox_Option_MultiLineWithThumbnail {...props}/>);

        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
