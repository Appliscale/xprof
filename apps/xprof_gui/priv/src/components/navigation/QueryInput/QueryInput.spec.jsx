import React from 'react';
import { shallow } from 'enzyme';
import QueryInput from './QueryInput';
import { HANDLED_KEY_CODES } from '../../../constants';

describe('QueryInput component', () => {
  let props;
  let wrapper;

  beforeEach(() => {
    props = {
      queryKeyDown: jest.fn(),
      queryInputChange: jest.fn(),
      query: '',
      isConnection: true,
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
    expect(props.queryKeyDown).toHaveBeenCalledTimes(HANDLED_KEY_CODES.length);
  });
  it('should not call handleKeyDown() for not supported keys', () => {
    wrapper
      .find('input')
      .simulate('keyDown', { keyCode: 36, preventDefault() {} });
    expect(props.queryKeyDown).toHaveBeenCalledTimes(0);
  });
  it('should call handleInputChange() on change', () => {
    const event = { target: { value: 'Foo' } };
    wrapper.find('input').simulate('change', event);
    expect(props.queryInputChange).toHaveBeenCalledTimes(1);
    expect(props.queryInputChange).toHaveBeenCalledWith(event.target.value);
  });
});
