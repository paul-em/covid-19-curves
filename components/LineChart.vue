<template>
  <canvas
    id="myChart"
    ref="chart"
  />
</template>

<script>
import 'chart.js';

export default {
  props: {
    values: { type: Array, required: true },
    labels: { type: Array, required: true },
  },
  data: () => ({
    chart: null,
  }),
  watch: {
    values() {
      this.updateValues();
    },
  },
  mounted() {
    this.chart = new window.Chart(this.$refs.chart, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [
          {
            data: this.values,
            backgroundColor: '#008DC9',
          },
        ],
      },
      options: {
        legend: {
          display: false,
        },
      },
    });
  },
  methods: {
    updateValues() {
      this.chart.data.datasets[0].data = this.values;
      this.chart.update();
    },
  },
};
</script>

<style lang="scss" scoped>
canvas {
  width: 100%;
}
</style>
