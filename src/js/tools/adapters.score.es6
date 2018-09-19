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

// TODO this is teh number adapter with options

const { attr } = window.kendo;

/**
 * @class ScoreAdapter
 */
const ScoreAdapter = BaseAdapter.extend({
    init: function (options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = CONSTANTS.NUMBER;
        this.defaultValue = this.defaultValue || (this.nullable ? null : 0);
        this.editor = 'input';
        this.attributes = $.extend({}, this.attributes, attributes);
        this.attributes[attr('role')] = 'numerictextbox';
    }
});

/**
 * Default export
 */
export default ScoreAdapter;