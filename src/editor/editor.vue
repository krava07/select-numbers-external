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
            :select-invalid="$v.schema.botNumber.$error"

            :text-expression-label="template.textExpressionLabel"
            :text-expression-placeholder="template.textExpressionPlaceholder"
            :text-expression-error="template.textExpressionError"
            :text-expression-invalid="$v.schema.userNumber.$error"
        />
    </div>
</template>
<script>
    import * as _ from 'lodash';
    import {validators} from '_validators';
    import SelectNumbers from './SelectNumbers.vue';

    const {generateValidators} = validators;

    export default {
        name       : 'editor-select-numbers',
        props      : ['template', 'schema', 'step', 'stepId', 'steps', 'readonly'],
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

        // created () {
        //     const url = this.$flow.gatewayUrl('provider-numbers-list', this.$flow.providersAccountId());
        //     this.$http.post(url, {accountId : this.$flow.accountId, getSmsNumbers : true})
        //         .then(response => response.json())
        //         .then(responseJson => {
        //             this.botNumbers = _.chain(responseJson)
        //             .map(number => ({
        //                 id: number.id,
        //                 label: !number.isGroup ? number.phoneNumber + ' (' + number.name + ')' : number.name,
        //                 value: '`' + number.phoneNumber + '`'
        //             }))
        //             .sortBy('label')
        //             .value()
        //             .concat(this.botNumbers);
        //         });
        // },

        data () {
            return {
                botNumbers: []
            };
        },

        methods : {},

        validations () {
            return {
                schema : validator(this.template)
            };
        }

    };

    export const data = (template) => ({
        botNumber                 : '',
        userNumber                : '',
        botNumberVariable         : template.botNumberVariable,
        userNumberVariable        : template.userNumberVariable,
        selectLabel               : template.selectLabel,
        selectPlaceholder         : template.selectPlaceholder,
        selectError               : template.selectError,
        textExpressionLabel       : template.textExpressionLabel,
        textExpressionPlaceholder : template.textExpressionPlaceholder,
        textExpressionError       : template.textExpressionError
    });

    const customValidation = value => {
        return Boolean(value.slice(1, -1));
    };

    export const validator = (template) => {
        return {
            botNumber : generateValidators(true, {
                custom : customValidation
            }),
            userNumber : generateValidators(true, {
                custom : customValidation
            })
        };
    };

    export const meta = {
        name    : 'select-phone-numbers',
        type    : 'onereach-studio-form-editor',
        version : '1.0'
    };
</script>
