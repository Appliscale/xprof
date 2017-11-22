import React from 'react';
import { range } from 'lodash';
import { shallow } from 'enzyme';
import { ACModal, ACModalRow } from '../';
import * as constants from '../../constants';

describe('ACModal component', () => {
  const props = {
    functions: ['fun1', 'fun2', 'fun3'],
    onFunctionClickedModal: jest.fn(),
    position: 1,
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
    const max = constants.MAX_FUNCTIONS_AUTOCOMPLETER;
    expect(wrapper2.find(ACModalRow)).toHaveLength(max);
  });
  it('highlight only one row', () => {
    const highlightedRow = wrapper.find(ACModalRow).get(props.position);
    expect(highlightedRow.props.isHighlighted).toBeTruthy();
  });
  // it('Should now show rows if not functions', () => {
  //   const wrapper2 = shallow(<ACModal {...props2} />);
  // });
});
