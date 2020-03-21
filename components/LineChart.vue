<template>
  <div>
    <div class="chart-container relative">
      <canvas
        id="myChart"
        ref="chart"
        height="400"
      />
    </div>
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
          @input="e => updateOffset(dataset.label, e.target.value)">
        {{ getOffset(dataset.label) }} Days
      </div>
    </div>
    <button
      class="p-3 my-2 text-sm hover:bg-grey-lighter rounded-sm uppercase"
      @click="toggleViewType">
      {{ linear ? 'linear' : 'logarithmic' }}
    </button>
  </div>
</template>

<script>
import 'chart.js';

export default {
  props: {
    datasets: { type: Array, required: true },
    labels: { type: Array, required: true },
  },
  data: () => ({
    chart: null,
    linear: true,
    offsets: {},
  }),
  watch: {
    datasets: {
      deep: true,
      handler() {
        this.chart.data.labels = this.labels;
        this.update();
      },
    },
  },
  mounted() {
    this.chart = new window.Chart(this.$refs.chart, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: this.datasets,
      },
      options: {
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        scales: {
          yAxes: [{
            type: this.linear ? 'linear' : 'logarithmic',
          }],
        },
      },
    });
  },
  methods: {
    toggleViewType() {
      this.linear = !this.linear;
      this.chart.options.scales.yAxes[0].type = this.linear ? 'linear' : 'logarithmic';
      this.chart.update();
    },
    updateOffset(label, v) {
      this.offsets = {
        ...this.offsets,
        [label]: v,
      };
      this.update();
    },
    update() {
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
        return newArr;
      }
      const newArr = [
        ...filler,
        ...arr,
      ].slice(0, arr.length);
      return newArr;
    },
  },
};
</script>

<style lang="scss" scoped>
canvas {
  width: 100%;
}

.chart-container {
  width: 100%;
  min-width: 360px;
  height: 400px;
}
</style>
