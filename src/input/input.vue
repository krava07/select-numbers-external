<template>
    <div class="example-input-component-wrapper">
        <div class="wrapper" @click="$refs.configModal.open()">
            <editor :template="input.data"
                    :schema="defaultStep.data"
                    :step="defaultStep"
                    :steps="[defaultStep]"
                    :readonly="true">
            </editor>
        </div>

        <or-modal ref="configModal" :remove-close-button="true"
                  title="Configure component"
                  class="input-message-settings"
                  :contain-focus="false">

            <or-textbox
                name="label" label="Bot number variable" placeholder="variableName"
                v-model="input.data.botNumberVariable"
            />
            <or-textbox
                name="label" label="User number variable" placeholder="variableName"
                v-model="input.data.userNumberVariable"
            />

            <or-textbox name="label" label="Select Label" placeholder="label text"
                        v-model="input.data.selectLabel"
                        help="Select label text">
            </or-textbox>

            <or-textbox name="label" label="Select placeholder" placeholder="placeholder text"
                        v-model="input.data.selectPlaceholder"
                        help="Select placeholder text">
            </or-textbox>

            <or-textbox name="label" label="Select Error" placeholder="error text text"
                        v-model="input.data.selectError"
                        help="Select error text">
            </or-textbox>

            <or-textbox name="label" label="Text expression Label" placeholder="label text"
                        v-model="input.data.textExpressionLabel"
                        help="input label text">
            </or-textbox>

            <or-textbox name="label" label="Text expression placeholder" placeholder="placeholder text"
                        v-model="input.data.textExpressionPlaceholder"
                        help="input placeholder text">
            </or-textbox>

            <or-textbox name="label" label="Text expression Error" placeholder="error text text"
                        v-model="input.data.textExpressionError"
                        help="input error text">
            </or-textbox>

            <div slot="footer">
                <or-button color="primary"
                           type="secondary"
                           @click.prevent="$refs.configModal.close()">
                    Close
                </or-button>
            </div>
        </or-modal>
    </div>
</template>

<script>
    import _ from 'lodash';
    import base from '@default/src/inputs/_design_base.vue';
    import editor from '../editor/editor.vue';

    export default {
        extends    : base,
        components : {
            editor
        },
        defaultValue () {
            return _.cloneDeep(data);
        }
    };

    export const label = 'select-phone-numbers';
    export const data = {
        botNumberVariable         : 'botNumber',
        userNumberVariable        : 'userNumber',
        selectLabel               : 'Bot phone number',
        selectPlaceholder         : '+12323424324',
        selectError               : 'The bot phone number field is required.',
        textExpressionLabel       : 'End user phone number',
        textExpressionPlaceholder : '+12323424324',
        textExpressionError       : 'The end user phone number field is required.',
        validateRequired          : true
    };

    export const meta = {
        name    : 'test-external-component',
        type    : 'onereach-studio-form-input',
        version : '1.0'
    };
</script>
