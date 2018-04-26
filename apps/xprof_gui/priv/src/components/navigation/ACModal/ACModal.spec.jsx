import React from 'react';
import { range } from 'lodash';
import { shallow } from 'enzyme';
import { ACModal, ACModalRow } from '../';
import { MAX_FUNCTIONS_AUTOCOMPLETER } from '../../../constants';

describe('ACModal component', () => {
  const props = {
    functions: ['fun1', 'fun2', 'fun3'],
    functionClick: jest.fn(),
    position: 1,
    setPositionOnFunction: jest.fn(),
  };
  const wrapper = shallow(<ACModal {...props} />);

  it('renders 3 ACModalRows', () => {
    expect(wrapper.find(ACModalRow)).toHaveLength(props.functions.length);
  });
  it('have a table tag', () => {
    expect(wrapper.find('table')).toBePresent();
  });
  it('limit number of visible rows', () => {
    const functions = range(0, 150).map(i => `foo${i}`);
    const props2 = Object.assign(props, { functions });
    const wrapper2 = shallow(<ACModal {...props2} />);
    expect(wrapper2.find(ACModalRow)).toHaveLength(MAX_FUNCTIONS_AUTOCOMPLETER);
  });
  it('highlight only one row', () => {
    const highlightedRow = wrapper.find(ACModalRow).get(props.position);
    expect(highlightedRow.props.isHighlighted).toBeTruthy();
  });
});
