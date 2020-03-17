<template>
  <div class="flex flex-col lg:h-screen lg:overflow-hidden">
    <header class="flex items-center p-8 min-h-72">
      <h1>
        Corona Virus (COVID-19) Curves
      </h1>
      <a
        class="p-4 text-blue no-underline"
        href="https://www.who.int/emergencies/diseases/novel-coronavirus-2019/situation-reports/">Data provided by WHO</a>
      <span class="text-grey-dark">Updated: {{ lastUpdate }}</span>
      <github-corner url="https://github.com/paul-em/covid-19-curves"/>
    </header>
    <div class="flex flex-1 flex-col-reverse lg:overflow-hidden lg:flex-row">
      <section class="flex flex-col lg:overflow-y-scroll overflow-x-auto">
        <location-table
          v-model="selected"
          :data="data"/>
      </section>
      <section class="flex flex-col flex-1 mx-4">
        <line-chart
          :datasets="datasets"
          :labels="dates"
        />
      </section>
    </div>
  </div>
</template>

<script>
import csvParser from 'papaparse';
import LineChart from '../components/LineChart.vue';
import MultiSelect from '../components/MultiSelect.vue';
import LocationTable from '../components/LocationTable.vue';
import GithubCorner from '../components/GithubCorner.vue';

export default {
  components: {
    LineChart,
    MultiSelect,
    LocationTable,
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
    lastUpdate() {
      return this.dates[this.dates.length - 1];
    },
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
