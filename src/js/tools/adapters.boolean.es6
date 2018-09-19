/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import BaseAdapter from './adapters.base.es6';

/**
 * @class BooleanAdapter
 */
const BooleanAdapter = BaseAdapter.extend({
    init: function (options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = BOOLEAN;
        this.defaultValue = this.defaultValue || (this.nullable ? null : false);
        this.editor = 'input';
        this.attributes = $.extend({}, this.attributes, attributes);
        this.attributes[kendo.attr('role')] = 'switch';
    },
    library: [
        {
            name: 'equal',
            formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).toLowerCase() === String(solution).toLowerCase();')
        }
    ],
    libraryDefault: 'equal'
});

/**
 * Default export
 */
export default BooleanAdapter;