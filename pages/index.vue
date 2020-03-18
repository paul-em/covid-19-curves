<template>
  <div class="flex flex-col lg:h-screen lg:overflow-hidden">
    <header class="flex items-center p-8 min-h-72">
      <h1>
        Corona Virus (COVID-19) Curves
      </h1>
      <a
        class="p-4 text-blue no-underline"
        href="https://www.who.int/emergencies/diseases/novel-coronavirus-2019/situation-reports/">Data provided by WHO</a>
      <span class="text-grey-dark">Updated: {{ lastUpdate }} 10am CET</span>
      <github-corner url="https://github.com/paul-em/covid-19-curves"/>
    </header>
    <div class="flex flex-1 flex-col-reverse lg:overflow-hidden lg:flex-row">
      <section class="flex flex-col lg:overflow-y-scroll overflow-x-auto">
        <location-table
          v-model="selected"
          :data="data"
          @columnSelect="updateSelectedColumn"/>
      </section>
      <section class="flex flex-col flex-1 m-4">
        <h3
          v-if="selected.length"
          class="m-4">{{ selectedColumn.label }} in
          <span
            v-for="location in selected"
            :key="location"
            :style="{ 'border-color': $color.hex(location) }"
            class="border-b-2 mr-2">{{ location }}</span>
        </h3>
        <h3
          v-else
          class="m-4"
        >
          Select a Location to show data
        </h3>
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
import populations from '../assets/populations';

function getAllDates(data) {
  const allDates = [];
  data.forEach((item) => {
    if (!allDates.includes(item.date)) {
      allDates.push(item.date);
    }
  });
  return allDates.sort();
}

function getEmptyTimeline(dates) {
  return dates.map(date => ({
    date,
  }));
}

function getDoubledValue(timeline, prop, value) {
  const half = value / 2;
  const halfIndex = timeline.findIndex(item => parseInt(item[prop] || 0, 10) >= half);
  if (halfIndex !== -1) {
    const fullIndex = timeline.findIndex(item => parseInt(item[prop] || 0, 10) === value);
    return fullIndex - halfIndex + 1;
  }
  return null;
}
function getPercentChange(timeline, prop, date) {
  const currentIndex = timeline.findIndex(item => item.date === date);
  const prevIndex = currentIndex - 1;
  if (!timeline[prevIndex]) {
    return 0;
  }
  const currentValue = parseInt(timeline[currentIndex][prop] || 0, 10);
  const prevValue = parseInt(timeline[prevIndex][prop] || 0, 10);
  const diff = currentValue - prevValue;
  return Math.round((diff / prevValue) * 100);
}

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
    const dates = getAllDates(result.data);
    const locationTimelines = {};
    result.data.forEach((item) => {
      if (!locationTimelines[item.location]) {
        locationTimelines[item.location] = getEmptyTimeline(dates);
      }
      const index = dates.indexOf(item.date);
      locationTimelines[item.location][index] = item;
    });
    return {
      data: result.data.map((item) => {
        const totalCases = parseInt(item.total_cases || 0, 10);
        const totalDeaths = parseInt(item.total_deaths || 0, 10);
        const population = populations[item.location];
        let casesInMillion = null;
        let deathsInMillion = null;
        if (population) {
          casesInMillion = Math.round((totalCases / population) * 10000000) / 10;
          deathsInMillion = Math.round((totalDeaths / population) * 10000000) / 10;
        }
        const newCases = parseInt(item.new_cases || 0, 10);
        const newDeaths = parseInt(item.new_deaths || 0, 10);
        return {
          ...item,
          new_cases: newCases,
          new_cases_percent: newCases ? getPercentChange(locationTimelines[item.location], 'total_cases', item.date) : 0,
          new_deaths: newDeaths,
          new_deaths_percent: newDeaths ? getPercentChange(locationTimelines[item.location], 'total_deaths', item.date) : 0,
          total_cases: totalCases,
          total_deaths: totalDeaths,
          cases_in_million: casesInMillion,
          deaths_in_million: deathsInMillion,
          cases_doubled: getDoubledValue(locationTimelines[item.location], 'total_cases', totalCases),
          deaths_doubled: getDoubledValue(locationTimelines[item.location], 'total_deaths', totalDeaths),
        };
      }),
    };
  },
  data: () => ({
    data: [],
    selected: ['World'],
    selectedColumn: {
      value: 'total_cases',
      label: 'Total Cases',
    },
  }),
  computed: {
    lastUpdate() {
      return this.dates[this.dates.length - 1];
    },
    filteredData() {
      return this.data.filter(item => this.selected.includes(item.location));
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
    datasets() {
      const totalCases = {};
      this.filteredData
        .forEach((item) => {
          if (!totalCases[item.location]) {
            totalCases[item.location] = this.getEmptyDataset();
          }
          const index = this.dates.indexOf(item.date);
          totalCases[item.location][index] = item[this.selectedColumn.value];
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
    updateSelectedColumn(column) {
      this.selectedColumn = column;
    },
  },
};
</script>

<style>

</style>
