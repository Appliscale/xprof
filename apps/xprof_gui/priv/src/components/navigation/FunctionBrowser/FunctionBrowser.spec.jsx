import React from 'react';
import { shallow } from 'enzyme';
import FunctionBrowser from './FunctionBrowser';

describe('FunctionBrowser component', () => {
  const props = {
    queryKeyDown: jest.fn(),
    queryInputChange: jest.fn(),
    query: '',
    functions: [''],
    functionClick: jest.fn(),
    setPositionOnFunction: jest.fn(),
    isConnection: true,
  };
  it('renders', () => {
    const wrapper = shallow(<FunctionBrowser {...props} />);
    expect(wrapper).toBePresent();
  });
});
