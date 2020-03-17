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
    datasets: { type: Array, required: true },
    labels: { type: Array, required: true },
  },
  data: () => ({
    chart: null,
  }),
  watch: {
    datasets: {
      deep: true,
      handler() {
        this.chart.data.labels = this.labels;
        this.chart.data.datasets = this.datasets;
        this.chart.update();
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
        legend: {
          display: false,
        },
      },
    });
  },
};
</script>

<style lang="scss" scoped>
canvas {
  width: 100%;
}
</style>
