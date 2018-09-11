import Vue from 'vue';

export default new Vue({
  data: {
    store: {}
  },
  watch: {
    'store.entities' : {
      handler(value) {
        console.log("!!!!entities!!!!");
        this.$emit('entities-change', value);
      },
      deep: true
    },
    'store.model': {
      handler() {
        this.$emit('model-change');
      },
      deep: true
    }
  }
});
