<template>
    <div class="ui-select or-select__numbers">
        <select-expression
                has-search
                extendable-options
                only-merge-field
                :label="selectLabel"
                :multiple="multiple"
                :placeholder="selectPlaceholder"
                class="or-select__dropdown"
                :steps="steps"
                :step-id="stepId"
                :options.sync="localOptions"
                v-model="selectNumber"
                :disabled="readonly"
                :invalid="selectInvalid"
                :error="selectError"
        />

        <or-text-expression
                :label="textExpressionLabel"
                :steps="steps"
                :step-id="stepId"
                v-model="userNumber"
                :placeholder="textExpressionPlaceholder"
                :readonly="readonly"
                :invalid="textExpressionInvalid"
                :error="textExpressionError"
        >
        </or-text-expression>
    </div>
</template>
<script>
    import * as _ from 'lodash';
    import SelectExpression from './SelectExpression.vue';

    export default {
        name : 'select-phone-numbers',

        components : {
            SelectExpression
        },

        props : {
            multiple            : {
                type    : Boolean,
                default : false
            },
            selectLabel         : {
                type    : String,
                default : ''
            },
            options             : {
                type : Array,
                default () {
                    return [];
                }
            },
            selectInvalid       : {
                type : Boolean,
                default () {
                    return false;
                }
            },
            selectError         : {
                type : String,
                default () {
                    return '';
                }
            },
            selectPlaceholder   : {
                type : String,
                default () {
                    return '';
                }
            },
            stepId              : '',
            steps               : {
                type : Array,
                default () {
                    return [];
                }
            },
            textExpressionError : {
                type : String,
                default () {
                    return '';
                }
            },
            textExpressionInvalid : {
                type : Boolean,
                default () {
                    return false;
                }
            },
            textExpressionLabel : {
                type    : String,
                default : 'User number'
            },
            textExpressionPlaceholder : {
                type : String,
                default () {
                    return '';
                }
            },
            value               : {
                type : Object,
                default () {
                    return {};
                }
            },
            readonly            : {
                type    : Boolean,
                default : false
            },
            isNew : {
                type : Boolean
            },
            // allAvailableNumbers : Array
        },

        computed : {
            localOptions : {
                get () {
                    return this.options;
                },
                set (value) {
                    this.$emit('update:options', value);
                }
            },

            selectNumber : {
                get () {
                    let botNumber = _.get(this.value, 'botData');

                    if (this.isNew && (_.isEmpty(botNumber) || botNumber === '``')) {
                        botNumber = this.setMergeBotNumber(this.stepId);
                        if (botNumber === '``') {
                            return '';
                        }
                    }
                    return botNumber;
                },
                set (value) {
                    this.$emit('input', {botData : value, userData : this.userNumber});
                }
            },

            userNumber : {
                get () {
                    let userNumber = _.get(this.value, 'userData');
                    if (this.isNew && (_.isEmpty(userNumber) || userNumber === '``')) {
                        userNumber = this.setMergeUserNumber(this.stepId);
                    }
                    return userNumber;
                },
                set (value) {
                    this.$emit('input', {botData : this.selectNumber, userData : value});
                }
            }
        },

        mounted () {
            if (!_.isEqual(this.selectNumber, this.value.botData) || !_.isEqual(this.userNumber, this.value.userData)) {
                this.$emit('input', {botData : this.selectNumber, userData : this.userNumber});
            }
        },

        methods : {
            getPreviousSMSStep (stepId) {
                const stepParent = this.getStepParent(stepId);

                if (!stepParent) {
                    return null;
                }
                if (_.has(stepParent, 'data.selectedNumbers')) {
                    return stepParent;
                }

                return this.getPreviousSMSStep(stepParent.id);
            },
            getStepParent (stepId) {
                return _.find(this.steps, {
                    data : {
                        exits : [{stepId}]
                    }
                });
            },
            setMergeUserNumber (stepId) {
                const previousSMSStep = this.getPreviousSMSStep(stepId);
                let endUserNumber = '``';
                if (!_.isEmpty(previousSMSStep)) {
                    /* eslint-disable */
                    endUserNumber = "`${this.get('" + previousSMSStep.data.dataOut + ".endUserNumber')}`";
                    /* eslint-enable */
                }
                return endUserNumber;
            },
            setMergeBotNumber (stepId) {
                const previousSMSStep = this.getPreviousSMSStep(stepId);
                let mergeBotNumber = '``';
                if (!_.isEmpty(previousSMSStep)) {
                    /* eslint-disable */
                    mergeBotNumber = "`${this.get('" + previousSMSStep.data.dataOut + ".botNumber')}`";
                    /* eslint-enable */
                }
                return mergeBotNumber;
            }
        }
    };
</script>

<style lang="scss" rel="stylesheet/scss">
    @import '../scss/colors.scss';

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
