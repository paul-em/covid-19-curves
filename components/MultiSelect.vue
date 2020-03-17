<template>
  <div>
    <div
      v-for="option in options"
      :key="option"
      class="m-1 inline-block"
    >
      <input
        :id="option"
        :value="option"
        :checked="value.includes(option)"
        type="checkbox"
        @input="updateValue"
      >
      <label
        :for="option"
        class="pl-1 pr-3">{{ option }}</label>
    </div>
  </div>
</template>

<script>
export default {
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
