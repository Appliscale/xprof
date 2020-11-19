import React from 'react';
import { shallow } from 'enzyme';
import Root from './Root';

describe('Root component', () => {
  let props;
  let wrapper;

  beforeEach(() => {
    props = {
      getTraceStatus: jest.fn(),
      getMode: jest.fn(),
      getFavourites: jest.fn(),
    };
    wrapper = shallow(<Root {...props} />);
  });

  it('renders', () => {
    expect(wrapper).toBePresent();
  });
});
