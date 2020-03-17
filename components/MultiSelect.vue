<template>
  <div class="h-32 overflow-y-scroll">
    <div
      v-for="option in options"
      :key="option.value"
      class="m-1"
    >
      <color-surface
        :value="option.value"
        class="w-8 inline-block"/>
      <input
        :id="option.value"
        :value="option.value"
        :checked="value.includes(option.value)"
        type="checkbox"
        @input="updateValue"
      >
      <label
        :for="option.value"
        class="pl-1 pr-3">{{ option.label }}</label>
    </div>
  </div>
</template>

<script>
import ColorSurface from './ColorSurface.vue';

export default {
  components: {
    ColorSurface,
  },
  props: {
    value: { type: Array, default: () => [] },
    options: { type: Array, required: true },
  },
  methods: {
    updateValue(v) {
      const item = v.target.value;
      if (this.value.includes(item)) {
        this.$emit('input', this.value.filter(selectedItem => selectedItem !== item));
      } else {
        this.$emit('input', [
          ...this.value,
          item,
        ]);
      }
    },
  },
};
</script>


<style lang="scss" scoped>

</style>
