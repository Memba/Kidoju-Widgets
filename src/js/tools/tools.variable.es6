/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Create an expression adapter

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import PageComponent from '../data/models.pagecomponent.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';
import assets from '../app/app.assets.es6';

const { format, ns, template } = window.kendo;

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).image || {
            description: 'Variable',
            help: null,
            name: 'Variable',
            attributes: {
                variable: { title: 'Variable' },
                expression: { title: 'Expression' }
            },
            properties: {
                name: { title: 'Name' }
            }
        }
    );
}

/**
 * VariableTool
 * @class VariableTool
 * @extends BaseTool
 */
const VariableTool = BaseTool.extend({
    id: 'variable',
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    description: i18n().description,
    height: 64,
    help: i18n().help,
    icon: 'magic_wand',
    menu: ['attributes.variable', 'attributes.expression'],
    name: i18n().name,
    width: 64,
    templates: {
        default:
            '<img src="#: src$() #" alt="#: alt$() #" class="#: class$() #">'
    },
    attributes: {
        variable: new TextBoxAdapter({
            title: i18n().attributes.variable.title,
            defaultValue: 0
        }),
        // TODO expression: new ExpressionAdapter({
        expression: new TextBoxAdapter({
            title: i18n().attributes.expression.title,
            defaultValue: 'round(random(0, 10), 2)'
        })
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: i18n().properties.name.title
        })
    },

    /**
     * getHtmlContent
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {*}
     */
    getHtmlContent(component, mode) {
        const that = this;
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        assert.enum(
            Object.values(CONSTANTS.STAGE_MODES),
            mode,
            assert.format(
                assert.messages.enum.default,
                'mode',
                Object.values(CONSTANTS.STAGE_MODES)
            )
        );
        const tmpl = template(that.templates.default);
        $.extend(component, {
            // alternate text of an image
            alt$() {
                return component.get('attributes.name');
            },
            // add class to hide element in play and review modes
            class$() {
                return mode === 'design' ? '' : 'kj-ignore';
            },
            // ns is required for data-* declarations
            ns,
            // The src$ function resolves urls with schemes like cdn://sample.jpg
            src$() {
                // TODO use app.uris
                const src = format(
                    'cdn://images/o_collection/svg/office/{0}.svg',
                    that.icon
                );
                return assets.image.scheme2http(src);
            }
        });

        return tmpl(component);
    },

    /**
     * onResize
     * @method onResize
     * @param e
     * @param component
     */
    onResize(e, component) {
        const stageElement = $(e.currentTarget);
        assert.ok(
            stageElement.is(`${CONSTANTS.DOT}${CONSTANTS.ELEMENT_CLASS}`),
            format('e.currentTarget is expected to be a stage element')
        );
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        const content = stageElement.children('img');
        // Assuming we can get the natural size of the image, we shall keep proportions
        // TODO Cannot get naturalHeight for SVG images
        const { naturalHeight, naturalWidth } = content[0];
        if (naturalHeight && naturalWidth) {
            const height = component.get('height');
            const width = component.get('width');
            const rectLimitedByHeight = {
                height,
                width: (height * naturalWidth) / naturalHeight
            };
            /*
             // Note: comparing rectLimitedByHeight and rectLimitedByWidth does not work because
             // we are using the component size and not the mouse position
             // therefore, we can only reduce the size proportionnaly, not increase it
             var rectLimitedByWidth = {
             height: Math.round(width * naturalHeight / naturalWidth),
             width: Math.round(width)
             };
             // if (rectLimitedByHeight.height * rectLimitedByHeight.width <= rectLimitedByWidth.height * rectLimitedByWidth.width) {
             if (rectLimitedByHeight.width <= width) {
             */
            if (height !== rectLimitedByHeight.height) {
                // avoids a stack overflow
                component.set('height', rectLimitedByHeight.height);
            }
            if (width !== rectLimitedByHeight.width) {
                // avoids a stack overflow
                component.set('width', rectLimitedByHeight.width);
            }
            /*
             } else if(rectLimitedByWidth.height <= height) {
             if (height !== rectLimitedByWidth.height) {
             component.set('height', rectLimitedByWidth.height);
             }
             if (width !== rectLimitedByWidth.width) {
             component.set('width', rectLimitedByWidth.width);
             }
             }
             */
        }
        // Set content size
        content.outerHeight(
            component.get('height') -
                content.outerHeight(true) +
                content.outerHeight()
        );
        content.outerWidth(
            component.get('width') -
                content.outerWidth(true) +
                content.outerWidth()
        );
        // prevent any side effect
        e.preventDefault();
        // prevent event to bubble on stage
        e.stopPropagation();
    },

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate(component, pageIdx) {
        const ret = BaseTool.fn.validate.call(this, component, pageIdx);
        const {
            description,
            i18n: { messages }
        } = this; // tool description
        if (
            !component.attributes ||
            !component.attributes.alt ||
            component.attributes.alt === i18n().attributes.alt.defaultValue ||
            !RX_TEXT.test(component.attributes.alt)
        ) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(
                    messages.invalidAltText,
                    description,
                    pageIdx + 1
                )
            });
        }
        if (
            !component.attributes ||
            !component.attributes.src ||
            component.attributes.src === i18n().attributes.src.defaultValue ||
            !RX_IMAGE.test(component.attributes.src)
        ) {
            ret.push({
                type:
                    component.attributes.src ===
                    i18n().attributes.src.defaultValue
                        ? CONSTANTS.WARNING
                        : CONSTANTS.ERROR,
                index: pageIdx,
                message: format(
                    messages.invalidImageFile,
                    description,
                    pageIdx + 1
                )
            });
        }
        if (
            !component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style &&
                !RX_STYLE.test(component.attributes.style))
        ) {
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(messages.invalidStyle, description, pageIdx + 1)
            });
        }
        // TODO: We should also check that there is a dropZone/Selector on the page if draggable/selectable
        return ret;
    }
});

/**
 * Registration
 */
tools.register(VariableTool);