<template>
  <div class="flex">
    <section class="flex flex-col flex-1 h-screen">
      <h1>
        COVID-19 Curves
      </h1>
      <multi-select
        v-model="selected"
        :options="locationOptions"
        class="flex-1"
      />
    </section>
    <section class="flex flex-col flex-1 h-screen">
      <github-corner url="https://github.com/paul-em/covid-19-curves"/>
      <div class="flex items-center flex-1">
        <line-chart
          :datasets="datasets"
          :labels="dates"
        />
      </div>
    </section>
  </div>
</template>

<script>
import csvParser from 'papaparse';
import LineChart from '../components/LineChart.vue';
import MultiSelect from '../components/MultiSelect.vue';
import GithubCorner from '../components/GithubCorner.vue';

export default {
  components: {
    LineChart,
    MultiSelect,
    GithubCorner,
  },
  async asyncData({ $axios }) {
    const url = 'https://covid.ourworldindata.org/data/full_data.csv';
    const re = await $axios.get(url);
    const result = csvParser.parse(re.data, {
      header: true,
      skipEmptyLines: true,
    });
    if (result.errors && result.errors.length) {
      console.error(result.errors);
    }
    return {
      data: result.data,
    };
  },
  data: () => ({
    data: [],
    selected: ['World'],
  }),
  computed: {
    filteredData() {
      return this.data.filter(item => this.selected.includes(item.location));
    },
    locations() {
      const locations = [];
      this.data.forEach((item) => {
        if (!locations.includes(item.location)) {
          locations.push(item.location);
        }
      });
      return locations;
    },
    dates() {
      const allDates = [];
      this.data.forEach((item) => {
        if (!allDates.includes(item.date)) {
          allDates.push(item.date);
        }
      });
      return allDates.sort();
    },
    currentCounts() {
      const counts = {};
      this.locations.forEach((location) => {
        const locationData = this.data.filter(item => item.location === location);
        if (!locationData.length) {
          counts[location] = 0;
        } else {
          counts[location] = locationData[locationData.length - 1].total_cases;
        }
      });
      return counts;
    },
    locationOptions() {
      return [...this.locations]
        .sort((a, b) => this.currentCounts[b] - this.currentCounts[a])
        .map(location => ({
          value: location,
          label: `${location} (${this.currentCounts[location]})`,
        }));
    },
    datasets() {
      const totalCases = {};
      this.filteredData
        .forEach((item) => {
          if (!totalCases[item.location]) {
            totalCases[item.location] = this.getEmptyDataset();
          }
          totalCases[item.location][this.dates.indexOf(item.date)] = item.total_cases;
        });
      return Object.keys(totalCases).map(location => ({
        label: location,
        data: totalCases[location],
        backgroundColor: this.$color.rgba(location, 0.2),
        borderColor: this.$color.rgba(location, 0.8),
      }));
    },
  },
  methods: {
    getEmptyDataset() {
      return this.dates.map(() => 0);
    },
  },
};
</script>

<style>

</style>
