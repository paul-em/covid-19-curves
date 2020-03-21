<template>
  <div>
    <div class="p-2">
      <div
        v-for="dataset in datasets"
        :key="dataset.label"
        class="p-1">
        Offset for {{ dataset.label }}:
        <input
          :value="getOffset(dataset.label)"
          type="range"
          name="vol"
          min="-50"
          max="50"
          @input="e => updateOffset(dataset.label, e.target.value)"
        >
        {{ getOffset(dataset.label) }} Days
      </div>
    </div>
    <button
      class="p-3 my-2 text-sm hover:bg-grey-lighter rounded-sm uppercase"
      @click="toggleViewType"
    >{{ linear ? 'linear' : 'logarithmic' }}</button>
  </div>
</template>

<script>
export default {
  props: {
    datasets: { type: Array, required: true },
    labels: { type: Array, required: true },
  },
  data: () => ({
    linear: true,
    offsets: {},
  }),
  methods: {
    toggleViewType() {
      this.linear = !this.linear;
      this.chart.options.scales.yAxes[0].type = this.linear ? 'linear' : 'logarithmic';
      this.chart.update();
    },
    updateOffset(label, v) {
      console.log('updateOffset', label, v);
      this.offsets = {
        ...this.offsets,
        [label]: v,
      };
      this.update();
    },
    update() {
      console.log('updating..');
      this.chart.data.datasets = this.datasets.map(dataset => ({
        ...dataset,
        data: this.shift(dataset.data, this.offsets[dataset.label]),
      }));
      this.chart.update();
    },
    getOffset(label) {
      return this.offsets[label] || 0;
    },
    shift(arr, offset) {
      if (offset === 0) {
        return arr;
      }
      const filler = [];
      for (let i = 0; i < Math.abs(offset); i += 1) {
        filler.push(0);
      }
      if (offset < 0) {
        const newArr = [...arr].slice(Math.abs(offset));
        // newArr.push(...filler);
        return newArr;
      }
      const newArr = [
        ...filler,
        ...arr,
      ].slice(0, arr.length);
      console.log(newArr);
      return newArr;
    },
  },
};
</script>
