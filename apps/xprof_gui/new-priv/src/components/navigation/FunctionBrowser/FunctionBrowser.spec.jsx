import React from 'react';
import { shallow } from 'enzyme';
import FunctionBrowser from './FunctionBrowser';

describe('FunctionBrowser component', () => {
  const props = {
    handleKeyDown: jest.fn(),
    handleInputChange: jest.fn(),
    value: '',
    functions: [''],
    onFunctionClickedModal: jest.fn(),
  };
  it('renders', () => {
    const wrapper = shallow(<FunctionBrowser {...props} />);
    expect(wrapper).toBePresent();
  });
});
