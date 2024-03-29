import Vue from 'vue';

Vue.filter('truncate', function(text, stop, clamp) {
  return text ? text.slice(0, stop) + (stop < text.length ? clamp || '...' : '') : '';
});
