// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';
import { shallow } from 'enzyme';
import { Dropdown, Icon } from 'antd';

import CopyIcon from '../../../common/CopyIcon';

import KeyValuesTable, { LinkValue } from './KeyValuesTable';

describe('LinkValue', () => {
  const link = {
    text: 'titleValue',
    url: 'hrefValue',
  };
  const childrenText = 'childrenTextValue';
  const wrapper = shallow(<LinkValue link={link}>{childrenText}</LinkValue>);

  it('renders as expected', () => {
    expect(wrapper.find('a').prop('href')).toBe(link.url);
    expect(wrapper.find('a').prop('title')).toBe(link.text);
    expect(wrapper.find('a').text()).toMatch(/childrenText/);
  });

  it('renders correct Icon', () => {
    expect(wrapper.find(Icon).hasClass('KeyValueTable--linkIcon')).toBe(true);
    expect(wrapper.find(Icon).prop('type')).toBe('export');
  });
});

describe('<KeyValuesTable>', () => {
  let wrapper;

  const data = [
    { key: 'span.kind', value: 'client', expected: 'client' },
    { key: 'omg', value: 'mos-def', expected: 'mos-def' },
    { key: 'numericString', value: '12345678901234567890', expected: '12345678901234567890' },
    { key: 'numeric', value: 123456789, expected: '123456789' },
    { key: 'jsonkey', value: JSON.stringify({ hello: 'world' }) },
  ];

  beforeEach(() => {
    wrapper = shallow(<KeyValuesTable data={data} />);
  });

  it('renders without exploding', () => {
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.KeyValueTable').length).toBe(1);
  });

  it('renders a table row for each data element', () => {
    const trs = wrapper.find('tr');
    expect(trs.length).toBe(data.length);
    trs.forEach((tr, i) => {
      expect(tr.find('.KeyValueTable--keyColumn').text()).toMatch(data[i].key);
    });
  });

  it('renders a single link correctly', () => {
    wrapper.setProps({
      linksGetter: (array, i) =>
        array[i].key === 'span.kind'
          ? [
              {
                url: `http://example.com/?kind=${encodeURIComponent(array[i].value)}`,
                text: `More info about ${array[i].value}`,
              },
            ]
          : [],
    });

    const anchor = wrapper.find(LinkValue);
    expect(anchor).toHaveLength(1);
    expect(anchor.prop('href')).toBe('http://example.com/?kind=client');
    expect(anchor.prop('title')).toBe('More info about client');
    expect(
      anchor
        .closest('tr')
        .find('td')
        .first()
        .text()
    ).toBe('span.kind');
  });

  it('renders multiple links correctly', () => {
    wrapper.setProps({
      linksGetter: (array, i) =>
        array[i].key === 'span.kind'
          ? [
              { url: `http://example.com/1?kind=${encodeURIComponent(array[i].value)}`, text: 'Example 1' },
              { url: `http://example.com/2?kind=${encodeURIComponent(array[i].value)}`, text: 'Example 2' },
            ]
          : [],
    });
    const dropdown = wrapper.find(Dropdown);
    const menu = shallow(dropdown.prop('overlay'));
    const anchors = menu.find(LinkValue);
    expect(anchors).toHaveLength(2);
    const firstAnchor = anchors.first();
    expect(firstAnchor.prop('href')).toBe('http://example.com/1?kind=client');
    expect(firstAnchor.children().text()).toBe('Example 1');
    const secondAnchor = anchors.last();
    expect(secondAnchor.prop('href')).toBe('http://example.com/2?kind=client');
    expect(secondAnchor.children().text()).toBe('Example 2');
    expect(
      dropdown
        .closest('tr')
        .find('td')
        .first()
        .text()
    ).toBe('span.kind');
  });

  it('renders a <CopyIcon /> with correct copyText for each data element', () => {
    const copyIcons = wrapper.find(CopyIcon);
    expect(copyIcons.length).toBe(data.length);
    copyIcons.forEach((copyIcon, i) => {
      expect(copyIcon.prop('copyText')).toBe(JSON.stringify(data[i], null, 2));
      expect(copyIcon.prop('tooltipTitle')).toBe('Copy JSON');
    });
  });

  it('renders a span value containing numeric string correctly', () => {
    const el = wrapper.find('.ub-inline-block');
    expect(el.length).toBe(data.length);
    el.forEach((valueDiv, i) => {
      if (data[i].key !== 'jsonkey') {
        expect(valueDiv.html()).toMatch(data[i].expected);
      }
    });
  });
});
