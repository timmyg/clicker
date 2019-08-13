<template>
  <section>
    <div>
      <header class="site-header-center">
        <page-header></page-header>
        <div id="title">Branding</div>
      </header>
    </div>
  </section>
</template>

<script>
import { Card, createToken } from 'vue-stripe-elements-plus';
import PageHeader from './landing/PageHeader';
import * as moment from 'moment';

export default {
  data() {
    return {
      completed: false,
    };
  },

  components: { PageHeader },

  mounted: function() {},

  methods: {
    pay() {},
  },
};
</script> 

<style lang="scss">
.site-header-center {
  padding: 20px 0;
  .header-brand {
    margin: 0 auto;
  }
}
</style>

<style lang="scss" scoped>
#title {
  text-align: center;
  font-size: 18px;
  font-weight: 500;
}
$danger: #cf665b;
.error {
  border-left: 5px solid $danger;
  color: $danger;
  margin-top: 8px;
  padding: 16px;
  font-size: 14px;
}
.completed {
  margin-top: 40px;
  text-align: center;
}
</style> 