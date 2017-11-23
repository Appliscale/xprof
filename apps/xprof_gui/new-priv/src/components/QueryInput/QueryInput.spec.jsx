import React from 'react';
import { shallow } from 'enzyme';
import QueryInput from './QueryInput';
import { HANDLED_KEY_CODES } from '../../constants';

describe('QueryInput component', () => {
  let props;
  let wrapper;

  beforeEach(() => {
    props = {
      handleKeyDown: jest.fn(),
      handleInputChange: jest.fn(),
      value: '',
    };
    wrapper = shallow(<QueryInput {...props} />);
  });

  it('have an input', () => {
    expect(wrapper.find('input')).toBePresent();
  });
  it('should only handle control keys', () => {
    const input = wrapper.find('input');
    HANDLED_KEY_CODES.forEach(keyCode =>
      input.simulate('keyDown', { keyCode, preventDefault() {} }));
    expect(props.handleKeyDown).toHaveBeenCalledTimes(HANDLED_KEY_CODES.length);
  });
  it('should not call handleKeyDown() for not supported keys', () => {
    wrapper.find('input').simulate('keyDown', { keyCode: 36, preventDefault() {} });
    expect(props.handleKeyDown).toHaveBeenCalledTimes(0);
  });
  it('should call handleInputChange() on change', () => {
    const event = { target: { value: 'Foo' } };
    wrapper.find('input').simulate('change', event);
    expect(props.handleInputChange).toHaveBeenCalledTimes(1);
    expect(props.handleInputChange).toHaveBeenCalledWith(event.target.value);
  });
});
