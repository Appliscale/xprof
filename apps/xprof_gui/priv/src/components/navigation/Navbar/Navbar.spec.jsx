import React from 'react';
import { shallow } from 'enzyme';
import Navbar from './Navbar';

describe('Navbar component', () => {
  const props = {
    status: '',
    toggleTraceStatus: jest.fn(),
    queryKeyDown: jest.fn(),
    queryInputChange: jest.fn(),
    query: '',
    expansion: '',
    functions: [],
    functionClick: jest.fn(),
    setPositionOnFunction: jest.fn(),
    isConnection: true,
    switchGrid: jest.fn(),
    switchInputType: jest.fn(),
    toggleInputType: jest.fn(),
  };
  it('renders', () => {
    const wrapper = shallow(<Navbar {...props} />);
    expect(wrapper).toBePresent();
  });
});
