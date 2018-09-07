<template>
    <div class="ui-select or-select-expression" :class="classes">
        <input
                class="ui-select__hidden-input"
                type="hidden"

                :name="name"
                :value="submittedValue"

                v-if="name"
        >

        <div class="ui-select__icon-wrapper" v-if="icon || $slots.icon">
            <slot name="icon">
                <or-icon :icon="icon"></or-icon>
            </slot>
        </div>

        <div class="ui-select__content">
            <div
                    class="ui-select__label"
                    ref="label"

                    :tabindex="disabled ? null : '0'"

                    @click="toggleDropdown"
                    @focus="onFocus"
                    @keydown.enter.prevent="openDropdown"
                    @keydown.space.prevent="openDropdown"
                    @keydown.tab="onBlur"
            >
                <div
                        class="ui-select__label-text"
                        :class="labelClasses"
                        v-if="label || $slots.default"
                >
                    <slot>{{ label }}</slot>
                </div>

                <div class="ui-select__display">
                    <div
                            class="ui-select__display-value"
                            :class="{ 'is-placeholder': !hasDisplayText }"
                    >
                        <div v-if="!multiple" v-html="hasDisplayText ? displayText : (hasFloatingLabel && isLabelInline) ? null : placeholder"></div>

                        <div v-if="multiple">
                            <button class="ui-select__display-selected" v-for="item in value" :key="item">
                                <span v-html="getDisplayText(item)"></span>
                                <i @click.stop="removeItem(item)" v-if="!disabled" class="material-icons ui-select__display-close-button">close</i>
                            </button>
                        </div>
                    </div>

                    <or-icon class="ui-select__dropdown-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path d="M6.984 9.984h10.03L12 15z"/>
                        </svg>
                    </or-icon>
                </div>

                <transition name="ui-select--transition-fade">
                    <div
                            class="ui-select__dropdown"
                            ref="dropdown"
                            tabindex="-1"

                            @keydown.down.prevent="highlightOption(highlightedIndex + 1)"
                            @keydown.enter.prevent.stop="selectHighlighted(highlightedIndex, $event)"
                            @keydown.esc.prevent="closeDropdown()"
                            @keydown.tab="onBlur"
                            @keydown.up.prevent="highlightOption(highlightedIndex - 1)"

                            v-show="showDropdown"
                    >
                        <div
                                class="ui-select__search"

                                @click.stop
                                @keydown.space.stop

                                v-if="hasSearch"
                        >
                            <or-text-expression
                                    v-if="!simpleText"
                                    class="ui-select__search-input"
                                    ref="searchInput"
                                    type="text"
                                    name="OrTextExpression"

                                    :steps="steps"
                                    :step-id="stepId"
                                    :placeholder="searchPlaceholder"

                                    v-model="query"
                            >

                            </or-text-expression>
                            <input
                                    v-if="simpleText"
                                    autocomplete="off"
                                    class="ui-select__search-input"
                                    ref="searchInput"
                                    type="text"

                                    :placeholder="searchPlaceholder"

                                    v-model="query"
                            >

                            <or-icon class="ui-select__search-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M9.516 14.016c2.484 0 4.5-2.016 4.5-4.5s-2.016-4.5-4.5-4.5-4.5 2.016-4.5 4.5 2.016 4.5 4.5 4.5zm6 0l4.97 4.97-1.5 1.5-4.97-4.97v-.797l-.28-.282c-1.126.984-2.626 1.547-4.22 1.547-3.61 0-6.516-2.86-6.516-6.47S5.906 3 9.516 3s6.47 2.906 6.47 6.516c0 1.594-.564 3.094-1.548 4.22l.28.28h.798z"/>
                                </svg>
                            </or-icon>

                            <div class="ui-select__add" @click="addOptionFromQuery" v-show="showAddOption">
                                <span>+</span>
                            </div>

                            <or-progress-circular
                                    class="ui-select__search-progress"
                                    :size="20"
                                    :stroke="4"
                                    v-show="loading"
                            ></or-progress-circular>
                        </div>

                        <ul class="ui-select__options" ref="optionsList">
                            <select-option
                                    ref="options"

                                    :highlighted="highlightedIndex === index"
                                    :keys="keys"
                                    :key="index"
                                    :multiple="multiple"
                                    :option="option"
                                    :selected="isOptionSelected(option)"
                                    :type="type"

                                    @click.native.stop="selectOption(option, index)"
                                    @mouseover.native.stop="highlightOption(index, { autoScroll: false }); mouseoverEvent();"
                                    @mouseenter.native="mouseenterEvent()"
                                    @mouseout.native="mouseoutEvent()"

                                    v-for="(option, index) in filteredOptions"
                            >
                                <slot
                                        name="option"

                                        :highlighted="highlightedIndex === index"
                                        :index="index"
                                        :option="option"
                                        :selected="isOptionSelected(option)"
                                ></slot>
                            </select-option>
                            ТУТ БУДЕТ КНОПКА

                            <div class="ui-select__no-results" v-show="hasNoResults">
                                <slot name="no-results">No results found</slot>
                            </div>
                        </ul>
                    </div>
                </transition>
            </div>

            <div class="ui-select__feedback" v-if="hasFeedback">
                <div class="ui-select__feedback-text" v-if="showError">
                    <slot name="error">{{ error }}</slot>
                </div>

                <div class="ui-select__feedback-text" v-else-if="showHelp">
                    <slot name="help">{{ help }}</slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import * as _ from 'lodash';
    import SelectOption from './SelectOption.vue';

    import { fuzzySearch, getReadableTextExpression, looseIndexOf, looseEqual, scrollIntoView, resetScroll } from './helpers.js';


    export default {
        name    : 'select-expression',

        components : {
            SelectOption
        },

        props : {
            name: String,
            value: {
                type: [String, Number, Object, Array],
                required: true
            },
            options: {
                type: Array,
                default() {
                    return [];
                }
            },
            placeholder: String,
            icon: String,
            iconPosition: {
                type: String,
                default: 'left' // 'left' or 'right'
            },
            label: String,
            floatingLabel: {
                type: Boolean,
                default: false
            },
            type: {
                type: String,
                default: 'basic' // 'basic' or 'image'
            },
            multiple: {
                type: Boolean,
                default: false
            },
            multipleDelimiter: {
                type: String,
                default: ', '
            },
            hasSearch: {
                type: Boolean,
                default: false
            },
            searchPlaceholder: {
                type: String,
                default: 'Search'
            },
            filter: Function,
            disableFilter: {
                type: Boolean,
                default: false
            },
            loading: {
                type: Boolean,
                default: false
            },
            noResults: {
                type: Boolean,
                default: false
            },
            keys: {
                type: Object,
                default() {
                    return {
                        label: 'label',
                        value: 'value',
                        image: 'image'
                    };
                }
            },
            invalid: {
                type: Boolean,
                default: false
            },
            help: String,
            error: String,
            disabled: {
                type: Boolean,
                default: false
            },
            // keen end

            extendableOptions : {
                type : Boolean,
                default () {
                    return false;
                }
            },
            onlyMergeField : {
                type : Boolean,
                default () {
                    return false;
                }
            },
            stepId            : '',
            steps             : {
                type : Array,
                default () {
                    return [];
                }
            },
            mouseOverHandler  : {
                type : Function
            },
            mouseEnterHandler : {
                type : Function
            },
            mouseOutHandler   : {
                type : Function
            },
            searchPlaceholder : {
                type    : String,
                default : 'Search'
            },
            simpleText        : {
                type    : Boolean,
                default : false
            },
            matchFromStart    : {
                type    : Boolean,
                default : false
            }
        },

        created() {
            if (!this.value || this.value === '') {
                this.setValue(null);
            }
        },

        mounted () {
            document.addEventListener('click', this.onExternalClick);

            if (this.extendableOptions) {
                const initialValuesArray = _.isArray(this.value) ? this.value : [this.value];
                _.forEach(initialValuesArray, value => {
                    if (!this.findOptionByValue(value) && !this.isValueEmpty(value)) {
                        this.addOption(value);
                    }
                });
            }
        },

        beforeDestroy() {
            document.removeEventListener('click', this.onExternalClick);
        },

        data () {
            return {
                isActive: false,
                isTouched: false,
                selectedIndex: -1,
                highlightedIndex: -1,
                showDropdown: false,
                initialValue: JSON.stringify(this.value),

                searchOptions : this.matchFromStart ? {
                    threshold : 0,
                    location  : 0,
                    distance  : 0
                } : {
                    threshold : 0.1,
                    location  : 1,
                    distance  : 500
                },
                query         : this.simpleText ? '' : '``',
                localOptions  : _.clone(this.options)
            };
        },

        watch : {
            filteredOptions() {
                this.highlightedIndex = 0;
                resetScroll(this.$refs.optionsList);
            },
            showDropdown() {
                if (this.showDropdown) {
                    this.onOpen();
                    this.$emit('dropdown-open');
                } else {
                    this.onClose();
                    this.$emit('dropdown-close');
                }
            },
            query() {
                this.$emit('query-change', this.query);
            },
            //

            localOptions (newValue) {
                this.$emit('update:options', newValue);
            },
            options (value) {
                if (!_.isEqual(this.localOptions, value)) {
                    this.localOptions = value;
                }
            }
        },

        methods : {
            highlightOption(index, options = { autoScroll: true }) {
                if (this.highlightedIndex === index || this.$refs.options.length === 0) {
                    return;
                }
                const firstIndex = 0;
                const lastIndex = this.$refs.options.length - 1;
                if (index < firstIndex) {
                    index = lastIndex;
                } else if (index > lastIndex) {
                    index = firstIndex;
                }
                this.highlightedIndex = index;
                if (options.autoScroll) {
                    this.scrollOptionIntoView(this.$refs.options[index].$el);
                }
            },
            selectHighlighted(index, e) {
                if (this.$refs.options.length > 0) {
                    e.preventDefault();
                    this.selectOption(this.$refs.options[index].option, index);
                }
            },
            selectOption(option, index, options = { autoClose: true }) {
                const shouldSelect = this.multiple && !this.isOptionSelected(option);
                if (this.multiple) {
                    this.updateOption(option, { select: shouldSelect });
                } else {
                    this.setValue(option);
                    this.selectedIndex = index;
                }
                this.$emit('select', option, {
                    selected: this.multiple ? shouldSelect : true
                });
                this.highlightedIndex = index;
                this.clearQuery();
                if (!this.multiple && options.autoClose) {
                    this.closeDropdown();
                }
            },
            toggleDropdown() {
                this[this.showDropdown ? 'closeDropdown' : 'openDropdown']();
            },
            openDropdown() {
                if (this.disabled) {
                    return;
                }
                this.showDropdown = true;
                // IE: clicking label doesn't focus the select element
                // to set isActive to true
                if (!this.isActive) {
                    this.isActive = true;
                }
            },
            closeDropdown(options = { autoBlur: false }) {
                this.showDropdown = false;
                if (!this.isTouched) {
                    this.isTouched = true;
                    this.$emit('touch');
                }
                if (options.autoBlur) {
                    this.isActive = false;
                } else {
                    this.$refs.label.focus();
                }
            },
            onFocus(e) {
                if (this.isActive) {
                    return;
                }
                this.isActive = true;
                this.$emit('focus', e);
            },
            onBlur(e) {
                this.isActive = false;
                this.$emit('blur', e);
                if (this.showDropdown) {
                    this.closeDropdown({ autoBlur: true });
                }
            },
            onClose() {
                this.highlightedIndex = this.multiple ? -1 : this.selectedIndex;
            },
            onExternalClick(e) {
                if (!this.$el.contains(e.target)) {
                    if (this.showDropdown) {
                        this.closeDropdown({ autoBlur: true });
                    } else if (this.isActive) {
                        this.isActive = false;
                    }
                }
            },
            scrollOptionIntoView(optionEl) {
                scrollIntoView(optionEl, {
                    container: this.$refs.optionsList,
                    marginTop: 180
                });
            },
            reset() {
                this.setValue(JSON.parse(this.initialValue));
                this.clearQuery();
                this.resetTouched();
                this.selectedIndex = -1;
                this.highlightedIndex = -1;
            },
            resetTouched(options = { touched: false }) {
                this.isTouched = options.touched;
            },
            // keen end

            // or
            setValue (value) {
                if (!value) {
                    value = this.multiple ? [] : '';
                }
                if (_.isArray(value)) {
                    value = _.map(value, item => _.get(item, this.keys.value, item));
                }

                value = _.get(value, this.keys.value, value);

                this.$emit('input', value);
                this.$emit('change', value);
            },

            findOptionByValue (value) {
                return _.find(this.options, option => _.isEqual(value, _.get(option, this.keys.value, option))) || '';
            },

            isOptionSelected (option) {
                if (this.multiple) {
                    return _.some(this.value, value => _.isEqual(value, _.get(option, this.keys.value, option)));
                }

                return _.isEqual(this.value, _.get(option, this.keys.value, option));
            },

            updateOption (option, options = {select : true}) {
                let value = [];
                let updated = false;
                const i = _.findIndex(this.value, item => _.isEqual(item, _.get(option, this.keys.value, option)));

                if (options.select && i < 0) {
                    value = this.value.concat(option);
                    updated = true;
                }

                if (!options.select && i > -1) {
                    value = this.value.slice(0, i).concat(this.value.slice(i + 1));
                    updated = true;
                }

                if (updated) {
                    this.setValue(value);
                }
            },

            getDisplayText (value) {
                const option = this.findOptionByValue(value);
                return _.get(value, this.keys.label) || _.get(option, this.keys.label, option);
            },

            // or end

            defaultFilter () {
                const query = _.chain(this.simpleText ? this.query : this.getFormatedOptionTextFromValue(this.query)).toLower().trim().value();
                return fuzzySearch(this.localOptions, [this.keys.label], query, this.searchOptions);
            },
            clearQuery () {
                this.query = this.simpleText ? '' : '``';
            },
            onOpen () {
                this.$nextTick(() => {
                    this.scrollOptionIntoView(this.$refs.optionsList.querySelector('.is-selected'));
                });
            },
            addOptionFromQuery () {
                const option = this.addOption(this.query);
                this.clearQuery();
                this.selectOption(option, 0);
            },
            addOption (value) {
                const option = {
                    [this.keys.label] : this.simpleText ? value : this.getFormatedOptionTextFromValue(value),
                    [this.keys.value] : value
                };

                this.localOptions.push(option);
                return option;
            },
            mouseoverEvent () {
                if (_.isFunction(this.mouseOverHandler)) {
                    this.mouseOverHandler();
                }
            },
            mouseenterEvent () {
                if (_.isFunction(this.mouseEnterHandler)) {
                    this.mouseEnterHandler();
                }
            },
            mouseoutEvent () {
                if (_.isFunction(this.mouseOutHandler)) {
                    this.mouseOutHandler();
                }
            },
            removeItem (itemToRemove) {
                this.$emit('input', _.reject(this.value, item => _.isEqual(item, itemToRemove)));
            },
            isValueEmpty (value) {
                return _.isEmpty(this.simpleText ? value : getReadableTextExpression(value));
            },
            getFormatedOptionTextFromValue (value) {
                return getReadableTextExpression(value, {
                    mergeTagLeftWrapper  : '<span class="merge-tag">{',
                    mergeTagRightWrapper : '}</span>'
                });
            }
        },

        computed : {
            labelClasses() {
                return {
                    'is-inline': this.hasFloatingLabel && this.isLabelInline,
                    'is-floating': this.hasFloatingLabel && !this.isLabelInline
                };
            },
            hasLabel() {
                return Boolean(this.label) || Boolean(this.$slots.default);
            },
            hasFloatingLabel() {
                return this.hasLabel && this.floatingLabel;
            },
            isLabelInline() {
                return this.value.length === 0 && !this.isActive;
            },
            hasFeedback() {
                return Boolean(this.help) || Boolean(this.error) || Boolean(this.$slots.error);
            },
            showError() {
                return this.invalid && (Boolean(this.error) || Boolean(this.$slots.error));
            },
            showHelp() {
                return !this.showError && (Boolean(this.help) || Boolean(this.$slots.help));
            },
            hasDisplayText() {
                return Boolean(this.displayText.length);
            },
            hasNoResults() {
                if (this.loading || this.query.length === 0) {
                    return false;
                }
                return this.disableFilter ? this.noResults : this.filteredOptions.length === 0;
            },
            submittedValue() {
                // Assuming that if there is no name, then there's no
                // need to computed the submittedValue
                if (!this.name || !this.value) {
                    return;
                }
                if (Array.isArray(this.value)) {
                    return this.value
                        .map(option => option[this.keys.value] || option)
                        .join(',');
                }
                return this.value[this.keys.value] || this.value;
            },
            //

            classes () {
                return [
                    `ui-select--type-${this.type}`,
                    `ui-select--icon-position-${this.iconPosition}`,
                    {'dropdown-shown' : this.showDropdown},
                    {'is-active' : this.isActive},
                    {'is-invalid' : this.invalid},
                    {'is-touched' : this.isTouched},
                    {'is-disabled' : this.disabled},
                    {'is-multiple' : this.multiple},
                    {'has-label' : this.hasLabel},
                    {'has-floating-label' : this.hasFloatingLabel}
                ];
            },


            showAddOption () {
                return this.extendableOptions && (!this.onlyMergeField || this.isMergeFieldOnlyQuery) && !this.isQueryEmpty && !this.optionsContainQuery;
            },
            displayText () {
                if (this.multiple) {
                    if (this.value.length > 0) {
                        return _.chain(this.value)
                            .map(value => {
                                const option = this.findOptionByValue(value);
                                return value[this.keys.label] || _.get(option, this.keys.label, option);
                            })
                            .join(this.multipleDelimiter)
                            .value();
                    }

                    return '';
                }
                const option = this.findOptionByValue(this.value);

                return this.value ? this.value[this.keys.label] || _.get(option, this.keys.label, option) : '';
            },
            filteredOptions () {
                if (this.disableFilter) {
                    return this.options;
                }

                return this.defaultFilter();
            },
            isMergeFieldOnlyQuery () {
                return Boolean(this.query.match(/^`\$\{this\.get\([`'"](.*)[`'"]\)\}`$/g));
            },
            isQueryEmpty () {
                return this.simpleText ? _.isEmpty(_.trim(this.query)) : !_.trim(this.query.slice(1, -1)).length;
            },
            optionsContainQuery () {
                return Boolean(this.findOptionByValue(this.query));
            }
        }
    };
</script>

<style lang="scss" rel="stylesheet/scss">

    // --------- KEEN STYLES ------------

    // @import '../scss/keen-select.scss';

    @import '../scss/util.scss';
    @import '../scss/keen-variables.scss';

    .ui-select {
        align-items: flex-start;
        display: flex;
        font-family: $font-stack;
        margin-bottom: $ui-input-margin-bottom;
        outline: none;
        position: relative;
        &:hover:not(.is-disabled) {
            .ui-select__label-text {
                color: $ui-input-label-color--hover;
            }
            .ui-select__display {
                border-bottom-color: $ui-input-border-color--hover;
            }
            .ui-select__dropdown-button {
                color: $ui-input-button-color--hover;
            }
        }
        &.is-active:not(.is-disabled) {
            .ui-select__label-text,
            .ui-select__icon-wrapper .ui-icon {
                color: $ui-input-label-color--active;
            }
            .ui-select__display {
                border-bottom-color: $ui-input-border-color--active;
                border-bottom-width: $ui-input-border-width--active;
            }
        }
        &.has-floating-label {
            .ui-select__label-text {
                // Behaves like a block, but width is the width of its content.
                // Needed here so label doesn't overflow parent when scaled.
                display: table;
                &.is-inline {
                    color: $ui-input-label-color; // So the hover styles don't override it
                    cursor: pointer;
                    transform: translateY($ui-input-label-top--inline) scale(1.1);
                }
                &.is-floating {
                    transform: translateY(0) scale(1);
                }
            }
        }
        &.has-label {
            .ui-select__icon-wrapper {
                padding-top: $ui-input-icon-margin-top--with-label;
            }
            .ui-select__dropdown-button {
                top: $ui-input-button-margin-top--with-label;
            }
        }
        &:not(.is-multiple) {
            .ui-select__display {
                height: $ui-input-height;
                line-height: 1;
            }
        }
        &.is-multiple {
            .ui-select__display {
                line-height: 1.4;
                padding-bottom: rem-calc(4px);
                padding-top: rem-calc(4px);
            }
        }
        &.is-invalid:not(.is-disabled) {
            .ui-select__label-text,
            .ui-select__icon-wrapper .ui-icon {
                color: $ui-input-label-color--invalid;
            }
            .ui-select__display {
                border-bottom-color: $ui-input-border-color--invalid;
            }
            .ui-select__feedback {
                color: $ui-input-feedback-color--invalid;
            }
        }
        &.is-disabled {
            .ui-select__display {
                border-bottom-style: $ui-input-border-style--disabled;
                border-bottom-width: $ui-input-border-width--active;
                color: $ui-input-text-color--disabled;
                cursor: default;
            }
            .ui-select__dropdown-button,
            .ui-select__display-value.is-placeholder {
                color: $ui-input-text-color--disabled;
                opacity: $ui-input-button-opacity--disabled;
            }
            .ui-select__icon-wrapper .ui-icon {
                opacity: $ui-input-icon-opacity--disabled;
            }
            .ui-select__feedback {
                opacity: $ui-input-feedback-opacity--disabled;
            }
        }
    }
    .ui-select__label {
        display: block;
        margin: 0;
        outline: none;
        padding: 0;
        position: relative;
        width: 100%;
    }
    .ui-select__icon-wrapper {
        flex-shrink: 0;
        margin-right: $ui-input-icon-margin-right;
        padding-top: $ui-input-icon-margin-top;
        .ui-icon {
            color: $ui-input-icon-color;
        }
    }
    .ui-select__content {
        flex-grow: 1;
    }
    .ui-select__label-text {
        color: $ui-input-label-color;
        cursor: default;
        font-size: $ui-input-label-font-size;
        line-height: $ui-input-label-line-height;
        margin-bottom: $ui-input-label-margin-bottom;
        transform-origin: left;
        transition: color 0.1s ease, transform 0.2s ease;
    }
    .ui-select__display {
        align-items: center;
        border: none;
        border-bottom-color: $ui-input-border-color;
        border-bottom-style: solid;
        border-bottom-width: $ui-input-border-width;
        color: $ui-input-text-color;
        cursor: pointer;
        display: flex;
        font-family: $font-stack;
        font-size: $ui-input-text-font-size;
        font-weight: normal;
        padding: 0;
        transition: border 0.1s ease;
        user-select: none;
        width: 100%;
    }
    .ui-select__display-value {
        flex-grow: 1;
        &.is-placeholder {
            color: $hint-text-color;
        }
    }
    .ui-select__dropdown-button {
        color: $ui-input-button-color;
        font-size: $ui-input-button-size;
        margin-left: auto;
        margin-right: rem-calc(-4px);
    }
    .ui-select__dropdown {
        background-color: white;
        box-shadow: 1px 2px 8px $md-grey-600;
        color: $primary-text-color;
        display: block;
        list-style-type: none;
        margin: 0;
        margin-bottom: rem-calc(8px);
        min-width: rem-calc(180px);
        outline: none;
        padding: 0;
        position: absolute;
        width: 100%;
        z-index: $z-index-dropdown;
    }
    .ui-select__search-input {
        background: none;
        border: none;
        border-bottom-color: $ui-input-border-color;
        border-bottom-style: solid;
        border-bottom-width: $ui-input-border-width;
        border-radius: 0;
        color: $ui-input-text-color;
        cursor: auto;
        font-family: $font-stack;
        font-size: $ui-input-text-font-size - rem-calc(1px);
        font-weight: normal;
        height: $ui-input-height + rem-calc(4px);
        outline: none;
        padding: rem-calc(0 12px);
        padding-left: rem-calc(40px);
        transition: border 0.1s ease;
        width: 100%;
        // Hide Edge and IE input clear button
        &::-ms-clear {
            display: none;
        }
        &:focus + .ui-select__search-icon {
            color: $ui-input-label-color--active;
        }
    }
    .ui-select__search-icon,
    .ui-select__search-progress {
        position: absolute;
        top: rem-calc(8px);
    }
    .ui-select__search-icon {
        color: $ui-input-icon-color;
        font-size: rem-calc(20px);
        left: rem-calc(12px);
    }
    .ui-select__search-progress {
        right: rem-calc(12px);
    }
    .ui-select__options {
        background-color: white;
        color: $primary-text-color;
        display: block;
        list-style-type: none;
        margin: 0;
        max-height: rem-calc(256px);
        min-width: 100%;
        overflow-y: auto;
        padding: 0;
        position: relative;
    }
    .ui-select__no-results {
        color: $secondary-text-color;
        font-size: rem-calc(14px);
        padding: rem-calc(8px 12px);
        width: 100%;
    }
    .ui-select__feedback {
        color: $ui-input-feedback-color;
        font-size: $ui-input-feedback-font-size;
        line-height: $ui-input-feedback-line-height;
        margin: 0;
        padding-top: $ui-input-feedback-padding-top;
        position: relative;
    }
    // ================================================
    // Icon Positions
    // ================================================
    .ui-select--icon-position-right {
        .ui-select__icon-wrapper {
            margin-left: rem-calc(8px);
            margin-right: 0;
            order: 1;
        }
    }
    // ================================================
    // Transitions
    // ================================================
    .ui-select--transition-fade-enter-active,
    .ui-select--transition-fade-leave-active {
        transition: opacity 0.2s ease;
    }
    .ui-select--transition-fade-enter,
    .ui-select--transition-fade-leave-active {
        opacity: 0;
    }


    // --------- ONEREACH STYLES ------------
    // @import '../scss/or-select.scss';

    @import '../scss/colors.scss';
    @import '../scss/fonts.scss';

    .ui-select {
        font-family: $font-family;

        &.is-disabled {
            .ui-select__display-value {
                color: rgba(0, 0, 0, 0.38);
                opacity: 0.6;
            }
        }

        .ui-select__content {
            .ui-select__label {
                .ui-select__label-text {
                    font-size: 12px;
                    color: $text-grey;
                    line-height: 36px;

                    &.is-inline {
                        padding-left: 10px;
                        transform: translateY(36px) scale(1.1);
                    }
                }

                .ui-select__display {
                    font-size: 14px;
                    color: $dark-background;
                    padding: 2px 10px;
                    min-height: 36px;
                    border-radius: 3px;
                    background-color: $light-grey;
                    border: solid 1px $grey-main-border-color;
                    transition: background-color 0.5s ease-out;

                    &.is-placeholder {
                        color: $text-grey;
                        font-size: 14px;
                    }

                    .ui-select__dropdown-button {
                        color: $text-grey;
                    }
                }
            }
        }

        .ui-select__search-icon {
            color: $active;
        }

        .ui-select__options {
            .ui-select-option {
                font-family: inherit;
                font-size: 14px;

                &.is-highlighted {
                    color: $dark-background;
                    background-color: $light-grey;
                }

                &.is-selected {
                    font-weight: 600;
                    color: black;
                }

                &__checkbox {
                    display: none;
                }
            }
        }

        &.is-active {
            .ui-select__feedback-text {
                visibility: visible;
            }
        }

        &.dropdown-shown {
            .ui-select__content {
                .ui-select__label {
                    .ui-select__display {
                        border-bottom-left-radius: 0;
                        border-bottom-right-radius: 0;
                    }
                }
            }
        }

        &.has-floating-label {
            .ui-select__label-text {
                &.is-inline {
                    transform: translateY(36px) scale(1.1);
                    padding-left: 10px;
                }
            }
        }

        &.is-invalid:not(.is-disabled) {
            .ui-select__feedback-text {
                color: $danger;
            }
            .ui-select__label-text {
                color: $danger;
            }
            .ui-select__display {
                border-color: $danger;
            }

            &:hover {
                .ui-select__display {
                    border-color: $danger;
                }
            }
        }

        &:hover:not(.is-disabled):not(.dropdown-shown) {
            .ui-select__content {
                .ui-select__label {
                    .ui-select__display:hover {
                        background-color: $white;

                        .ui-select__dropdown-button {
                            color: $text-grey;
                        }
                    }
                }
            }
        }

        .ui-select__feedback-text {
            color: rgba(0, 0, 0, 0.38);
            line-height: 1.2;
            font-size: 12px;
            visibility: hidden;
        }

        /* fixing shadow of a drop-down */
        .ui-select__dropdown {
            width: 100%;
            background-color: #fff;
            box-shadow: 0 3px 16px 0 rgba(0, 0, 0, .08);
            border-top: 0;
            border-left: 1px solid #e4e4e4;
            border-right: 1px solid #e4e4e4;
            border-bottom: 1px solid #e4e4e4;
            border-bottom-left-radius: 3px;
            border-bottom-right-radius: 3px;
            padding: 0;
        }

        /* fixing bad positioning for an icon with negative right margin */
        .ui-select__dropdown-button {
            margin: 0;
            flex-shrink: 0;
            font-size: 30px;
        }
        /* fixing bad positioning for an icon if label test exists */
        &.has-label {
            .ui-select__dropdown-button {
                top: 0;
            }

            .ui-select__icon-wrapper {
                padding-top: 41px;
            }
        }
    }
    // -------- END ONEREACH STYLES


    // -------- SELECT EXPRESSION STYLES -----

    .or-select-expression {
        font-family: $font-family;

        .ui-select__display-value {
            font-family: $font-family;

            .merge-tag {
                color: $active;
            }
        }

        .ui-select__display-selected {
            position: relative;

            margin: 2px 4px 2px 0;
            padding: 5px 20px 5px 4px;

            font-family: $font-family;

            border: none;
            background-color: $grey-main-border-color;
        }

        .ui-select__display-close-button {
            position: absolute;
            top: 5px;
            right: 2px;

            font-size: 15px;
            color: #8C9492;

            cursor: pointer;
        }

        &.is-disabled {
            .ui-select__display-value {
                color: rgba(0, 0, 0, 0.38);
                opacity: 0.6;
            }
            .ui-select__label {
                pointer-events: none;
            }
            .ui-select__display-selected {
                padding-right: 5px;
            }
        }

        .ui-select__content {
            .ui-select__add {
                position: absolute;
                top: 2px;
                right: 0.5rem;

                padding: 0 10px;

                background: white;
                color: #d1d1d1;
                font-size: 1.25rem;

                cursor: pointer;
                z-index: 1;

                &:hover {
                    color: #2196f3;
                }
            }
        }

        &.is-multiple {
            .is-selected {
                display: none;
            }
        }

        .ui-select__options {
            .ui-select-option {
                font-family: inherit;
                font-size: 14px;

                &.is-selected {
                    font-weight: bold;
                    color: black;
                }

                .merge-tag {
                    color: $active;
                }
            }
        }

        &.is-active {
            .ui-select__feedback-text {
                visibility: visible;
            }
        }

        .ui-select__feedback-text {
            color: rgba(0, 0, 0, 0.38);
            line-height: 1.2;
            font-size: 12px;
            visibility: hidden;
        }
        /* fixing bad positioning for an icon if label test exists */
        &.has-label {
            .ui-select__dropdown-button {
                top: 0;

                font-size: 30px;
            }
        }

        .ui-icon {
            .ui-select__search-icon {
                top: 0.7rem;
            }
        }

        .ui-select__search {
            .or-text-expression {
                padding-left: 30px;
                overflow: hidden;
                margin-bottom: 0;

                .header {
                    min-height: 0;
                    height: 0;
                    margin: 0 25px 0 0;
                    z-index: 1;

                    button {
                        top: 1px;
                        right: -30px;

                        &.js-mode-btn {
                            display: none;
                        }
                    }
                }

                .input-wrapper {
                    padding: 3px 60px 3px 0;
                }

                .or-editable-wrapper {
                    background-color: transparent;
                    border: none;

                    .placeholder {
                        position: absolute;
                        top: 0;

                        margin-top: 0;

                        line-height: 15px;
                        font-size: 14px;
                    }
                    .editable,
                    .active.editable {
                        padding: 0 11px;
                        line-height: 30px;
                        background-color: transparent;
                        border: none;
                        margin: 0;
                    }
                }
            }
        }
    }

    .or-select__numbers {
        flex-direction: column;
        align-items: stretch;

        .or-select__dropdown.ui-select--type-basic {
            margin-bottom: 0;
        }
    }

    .ui-select.is-invalid:not(.is-disabled) .ui-select__feedback-text {
        visibility: visible;
    }

    .error-text {
        position: relative;

        margin: 0;

        font-size: 12px;
        line-height: 1.3;
        color: $danger;
    }
</style>
