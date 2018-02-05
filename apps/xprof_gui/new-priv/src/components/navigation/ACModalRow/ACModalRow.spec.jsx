import React from 'react';
import { shallow } from 'enzyme';
import ACModalRow from './ACModalRow';

describe('ACModalRow component', () => {
  const onFunctionClickedModal = jest.fn();
  const props = {
    onFunctionClickedModal,
    functionName: 'fun-fun-function',
    isHighlighted: true,
  };
  const wrapper = shallow(<ACModalRow {...props} />);

  it('outputs function name', () => {
    expect(wrapper.find('td').text()).toBe(props.functionName);
  });
  it('is highlighted', () => {
    expect(wrapper.find('tr')).toHaveClassName('row-highlight');
  });
  it('calls onFunctionSelected with functionName on click', () => {
    wrapper.find('tr').simulate('click');
    expect(onFunctionClickedModal).toBeCalledWith(props.functionName);
  });
});
