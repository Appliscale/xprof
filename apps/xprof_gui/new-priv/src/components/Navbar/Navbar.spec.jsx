import React from 'react';
import { shallow } from 'enzyme';
import Navbar from './Navbar';

describe('Navbar component', () => {
  const props = {
    status: '',
    toggleTraceStatus: jest.fn(),
    handleKeyDown: jest.fn(),
    handleInputChange: jest.fn(),
    value: '',
    functions: [''],
    onFunctionClickedModal: jest.fn(),
  };
  it('renders', () => {
    const wrapper = shallow(<Navbar {...props} />);
    expect(wrapper).toBePresent();
  });
});
