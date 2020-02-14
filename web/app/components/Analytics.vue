<script>
import Vue from "vue";
export default {
  name: "Analytics",
  mounted() {
    Vue.prototype.$analytics = window.analytics || { alias: function() {} };
    // console.log(Vue.prototype.$analytics);
  }
};
</script>
