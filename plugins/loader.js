import countryNames from '../assets/countryNames.json';

const dataSource = 'https://coronadatascraper.cors-everywhere.workers.dev/';

function formatDate(date) {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

function getPercentChange(currentValue, prevValue) {
  if (prevValue === 0) {
    return 0;
  }
  const diff = currentValue - prevValue;
  return Math.round((diff / prevValue) * 100);
}
/*
function fill(num) {
  if (num < 10) {
    return `0${num}`;
  }
  return `${num}`;
}

function getPrevDay(str) {
  const d = new Date(str);
  const prev = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
  return `${prev.getMonth() + 1}/${prev.getDate()}/${prev.getFullYear() - 2000}`;
}

function getDoubledValue(timeline, day, metric) {
  const value = timeline[day][metric];
  const half = value / 2;
  let currentDay = getPrevDay(day);
  let dayCounter = 1;
  let found = false;
  while (timeline[currentDay]) {
    if (timeline[currentDay][metric] < half) {
      found = true;
      break;
    }
    currentDay = getPrevDay(currentDay);
    dayCounter += 1;
  }
  if (!found) {
    return null;
  }
  return dayCounter;
}

*/


function prepareTimelineItem(population, item, prevItem) {
  if (!item) {
    return {};
  }
  const preparedItem = {
    cases: item.cases || 0,
    deaths: item.deaths || 0,
    ...item,
  };
  if (prevItem) {
    preparedItem.newCases = (item.cases || 0) - (prevItem.cases || 0);
    preparedItem.newCasesPercent = item.cases
      ? getPercentChange(item.cases, prevItem.cases)
      : 0;
    preparedItem.newDeaths = (item.deaths || 0) - (prevItem.deaths || 0);
    preparedItem.newDeathsPercent = item.deaths
      ? getPercentChange(item.deaths, prevItem.deaths)
      : 0;
  } else {
    preparedItem.newCases = preparedItem.cases;
    preparedItem.newDeaths = preparedItem.deaths;
  }
  if (population) {
    preparedItem.casesInMillion = Math.round(
      (preparedItem.cases / population) * 10000000,
    ) / 10;
    preparedItem.deathsInMillion = Math.round(
      (preparedItem.deaths / population) * 10000000,
    ) / 10;
  }
  if (!preparedItem.deaths) {
    preparedItem.deathsPercent = 0;
  } else {
    preparedItem.deathsPercent = Math.round(
      (preparedItem.deaths / preparedItem.cases) * 10000,
    ) / 100;
  }
  return preparedItem;
}

function getCountryDataFromRegions(data, country, population) {
  const regions = Object.keys(data)
    .filter(location => data[location].country === country);
  const dates = {};
  regions.forEach((region) => {
    const regionData = data[region];
    Object.keys(regionData.dates).forEach((date) => {
      if (!dates[date]) {
        dates[date] = {
          cases: 0,
          deaths: 0,
        };
      }
      dates[date].cases += (regionData.dates[date].cases || 0);
      dates[date].deaths += (regionData.dates[date].deaths || 0);
    });
  });
  return {
    dates,
    country,
    population,
    url: 'https://github.com/CSSEGISandData/COVID-19',
  };
}

export default ({ $axios }, inject) => {
  inject('loader', {
    async loadCases() {
      const raw = await $axios.get(dataSource);
      const { data } = raw;
      const dates = [];
      Object.keys(data).forEach((location) => {
        const locationDates = Object.keys(data[location].dates);
        locationDates.forEach((date) => {
          if (!dates.includes(date)) {
            dates.push(date);
          }
        });
      });
      const sortedDates = dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      // somehow china as whole is missing
      if (!data.CHN) {
        data.CHN = getCountryDataFromRegions(data, 'CHN', 1437843661);
      }

      const timelines = {};
      Object
        .keys(data)
        .forEach((location) => {
          timelines[location] = sortedDates.map((date) => {
            const locationData = data[location];
            const prevDate = formatDate(new Date(date).getTime() - 1000 * 60 * 60 * 24);
            const current = locationData.dates[date];
            const prev = locationData.dates[prevDate];
            return prepareTimelineItem(locationData.population, current, prev);
          });
        });

      const current = Object
        .keys(timelines)
        .map((location) => {
          const latestItem = timelines[location][sortedDates.length - 1];
          if (!latestItem || !latestItem.cases) {
            return null;
          }
          return {
            ...data[location],
            ...latestItem,
            name: countryNames[location] || location,
            location,
            population: data[location].population || 0,
          };
        })
        .filter(item => !!item);
      return {
        timelines,
        timelineDates: sortedDates,
        current,
      };
    },
  });
};
