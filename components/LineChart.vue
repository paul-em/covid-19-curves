<template>
  <div>
    <div class="chart-container relative">
      <canvas
        id="myChart"
        ref="chart"
        height="400"
      />
      <label>
        Start Date
        <input
          v-model="startDate"
          type="date"
          min="2020-01-22"
          max="2020-05-01"
          @input="update"
        >
      </label>
    </div>
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
    startDate: '2020-01-22',
    today: null,
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
    this.today = new Date().toISOString();
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
        tooltips: {
          enabled: true,
          displayColors: false,
        },
        scales: {
          yAxes: [{
            type: 'linear',
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
    update() {
      const dateOffset = (new Date(this.startDate).getTime() - new Date('2020-01-22').getTime()) / (1000 * 60 * 60 * 24);
      console.log('update');
      this.chart.data.labels = this.labels.slice(dateOffset);
      this.chart.data.datasets = this.datasets.map(item => ({
        ...item,
        data: item.data.slice(dateOffset),
      }));
      this.chart.update();
    },
  },
};
</script>

<style lang="scss" scoped>
canvas {
  width: 100%;
}

label {
  display: block;
  padding: 24px;
}

.chart-container {
  width: 100%;
  min-width: 360px;
  height: 400px;
}
</style>
