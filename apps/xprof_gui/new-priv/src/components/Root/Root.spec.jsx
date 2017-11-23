import React from 'react';
import { shallow } from 'enzyme';
import Root from './Root';

describe('Root component', () => {
  it('renders', () => {
    const wrapper = shallow(<Root />);
    expect(wrapper).toBePresent();
  });
});
