<template>
    <div class="external-components-wrapper">
        <select-numbers
            :steps="steps"
            :step-id="stepId"
            :readonly="readonly"

            :options.sync="botNumbers"
            v-model="localNumbers"
            :multiple="false"

            :select-label="template.selectLabel"
            :select-placeholder="template.selectPlaceholder"
            :select-error="template.selectError"
            :select-invalid="$v.schema[template.botNumberVariable].$error"
            @input="onInput"

            :text-expression-label="template.textExpressionLabel"
            :text-expression-placeholder="template.textExpressionPlaceholder"
            :text-expression-error="template.textExpressionError"
            :text-expression-invalid="$v.schema[template.userNumberVariable].$error"
            :text-expression-help="template.textExpressionHelp"

            :is-new="isNew"
            :all-available-numbers="allAvailableNumbers"
        />
    </div>
</template>
<script>
    import * as _ from 'lodash';
    import {validators} from '_validators';
    import SelectNumbers from './SelectNumbers.vue';
    import eventHub from './eventHub.js';

    // const {generateValidators, required} = validators;

    export default {
        name       : 'editor-select-numbers',
        props      : ['template', 'schema', 'step', 'stepId', 'steps', 'readonly', 'isNew'],
        components : {
            SelectNumbers
        },
        computed   : {
            localNumbers : {
                get () {
                    return {
                        botData  : _.get(this.schema, this.template.botNumberVariable, ''),
                        userData : _.get(this.schema, this.template.userNumberVariable, '')
                    }
                },
                set (newValue) {
                    this.schema[this.template.botNumberVariable] = newValue.botData;
                    this.schema[this.template.userNumberVariable] = newValue.userData;
                }
            }
        },

        created () {
            this.updateNumbersData();
            eventHub.$on('update numbers data', this.updateNumbersData);
        },
        destroyed () {
            eventHub.$off('update numbers data', this.updateNumbersData);
        },

        data () {
            return {
                botNumbers: [],
                allAvailableNumbers: []
            };
        },

        methods : {
            onInput () {
                this.$v.schema[this.template.botNumberVariable].$touch();
                this.$v.schema[this.template.userNumberVariable].$touch();
            },
            updateNumbersData () {
                const url = this.$flow.gatewayUrl('provider-numbers-list', this.$flow.providersAccountId());
                this.$http.post(url, {accountId : this.$flow.accountId, getSmsNumbers : true})
                    .then(response => response.json())
                    .then(responseJson => {
                        this.allAvailableNumbers = responseJson;
                        this.botNumbers = _.chain(responseJson)
                            .map(number => ({
                                id: number.id,
                                label: !number.isGroup ? number.phoneNumber + ' (' + number.name + ')' : number.name,
                                value: '`' + number.phoneNumber + '`'
                            }))
                            .sortBy('label')
                            .value()
                            .concat(this.botNumbers);
                    });
            }
        },

        validations () {
            return {
                schema : validator(this.template)
            };
        }

    };

    export const data = (template) => ({
        [template.botNumberVariable]  : '``',
        [template.userNumberVariable] : '``',
        selectLabel                   : template.selectLabel,
        selectPlaceholder             : template.selectPlaceholder,
        selectError                   : template.selectError,
        textExpressionLabel           : template.textExpressionLabel,
        textExpressionPlaceholder     : template.textExpressionPlaceholder,
        textExpressionError           : template.textExpressionError,
        textExpressionHelp            : template.textExpressionHelp,
        isNew                         : template.isNew
    });

    const customValidation = value => Boolean(value.slice(1,-1));

    export const validator = (template) => {
        return {
            [template.botNumberVariable] : {
                custom : customValidation
            },
            [template.userNumberVariable] : {
                custom : customValidation
            }
        };
    };

    export const meta = {
        name    : 'test-external-component',
        type    : 'onereach-studio-form-editor',
        version : '1.0'
    };
</script>
