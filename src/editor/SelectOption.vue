<template>
    <li class="ui-select-option" :class="classes">
        <slot>
            <div class="ui-select-option__basic" v-if="type === 'basic'" v-html="option[keys.label] || option"></div>

            <div class="ui-select-option__image" v-if="type === 'image'">
                <div class="ui-select-option__image-object" :style="imageStyle"></div>

                <div
                    class="ui-select-option__image-text"
                >{{ option[keys.label] }}</div>
            </div>

            <div class="ui-select-option__checkbox" v-if="multiple">
                <or-icon v-if="selected">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path d="M9.984 17.016l9-9-1.406-1.453-7.594 7.594-3.563-3.563L5.016 12zm9-14.016C20.11 3 21 3.938 21 5.016v13.97C21 20.062 20.11 21 18.984 21H5.014C3.89 21 3 20.064 3 18.986V5.015C3 3.94 3.89 3 5.014 3h13.97z"/>
                    </svg>
                </or-icon>

                <or-icon v-else>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path d="M18.984 3C20.062 3 21 3.938 21 5.016v13.97C21 20.062 20.062 21 18.984 21H5.014C3.938 21 3 20.064 3 18.986V5.015C3 3.94 3.936 3 5.014 3h13.97zm0 2.016H5.014v13.97h13.97V5.015z"/>
                    </svg>
                </or-icon>
            </div>
        </slot>
    </li>
</template>

<script>
export default {
    name : 'ui-select-option',

    props : {
        option      : {
            type     : [String, Object],
            required : true
        },
        type        : {
            type    : String,
            default : 'basic' // 'basic' or 'image'
        },
        multiple    : {
            type    : Boolean,
            default : false
        },
        highlighted : {
            type    : Boolean,
            default : false
        },
        selected    : {
            type    : Boolean,
            default : false
        },
        keys        : {
            type : Object,
            default () {
                return {
                    label : 'label',
                    image : 'image'
                };
            }
        }
    },

    computed : {
        classes () {
            return [
                `ui-select-option--type-${this.type}`,
                {'is-highlighted' : this.highlighted},
                {'is-selected' : this.selected}
            ];
        },

        imageStyle () {
            return {'background-image' : `url(${this.option[this.keys.image]})`};
        }
    }
};
</script>
