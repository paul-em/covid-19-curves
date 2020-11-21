import countryNames from '../assets/countryNames.json';
import populations from './populations';

const dataSource = 'https://coronadatascraper.cors-everywhere.workers.dev/';

function getPercentChange(currentValue, prevValue) {
  if (prevValue === 0) {
    return 0;
  }
  const diff = currentValue - prevValue;
  return Math.round((diff / prevValue) * 1000) / 10;
}

function getDoubledValue(prevItems, metric, currentValue) {
  const half = currentValue / 2;
  let dayCounter;
  let found = false;
  for (dayCounter = 1; dayCounter <= prevItems.length; dayCounter += 1) {
    const item = prevItems[prevItems.length - dayCounter];
    if (item && item[metric] <= half) {
      found = true;
      break;
    }
  }
  if (!found) {
    return null;
  }
  return dayCounter;
}

/*
const mildCasesRecoveryTime = 10;
const servereCasesRecoveryTime = 30;
const servereRate = 0.2;

function estimateNewRecovered(prevItems, newDeaths) {
  let mildCases = 0;
  const mildCasesInfectDay = prevItems[prevItems.length - mildCasesRecoveryTime];
  if (mildCasesInfectDay) {
    mildCases = mildCasesInfectDay.newCases * (1 - servereRate);
  }
  let servereCases = 0;
  const servereCasesInfectDay = prevItems[prevItems.length - servereCasesRecoveryTime];
  if (servereCasesInfectDay) {
    servereCases = servereCasesInfectDay.newCases * servereRate;
  }
  return Math.max(0, Math.round(mildCases + servereCases) - newDeaths);
}
*/

function getAvrg(values) {
  let total = 0;
  values.forEach((val) => {
    total += val;
  });
  return Math.round(total / values.length);
}


function prepareTimelineItem(population, item, prevItems) {
  if (!item) {
    return null;
  }
  const preparedItem = {
    cases: item.cases || 0,
    deaths: item.deaths || 0,
    ...item,
  };
  preparedItem.casesDoubled = getDoubledValue(prevItems, 'cases', preparedItem.cases);
  preparedItem.deathsDoubled = getDoubledValue(prevItems, 'deaths', preparedItem.deaths);
  const prevItem = prevItems[prevItems.length - 1];
  if (prevItem) {
    preparedItem.newCases = preparedItem.cases - prevItem.cases;
    preparedItem.newCasesPercent = preparedItem.cases
      ? getPercentChange(preparedItem.cases, prevItem.cases)
      : 0;
    preparedItem.newDeaths = preparedItem.deaths - prevItem.deaths;
    preparedItem.newDeathsPercent = preparedItem.deaths
      ? getPercentChange(preparedItem.deaths, prevItem.deaths)
      : 0;
    if (prevItem.newCases === 0) {
      preparedItem.growthRate = 1;
    } else {
      preparedItem.growthRate = Math.round(Math.max(
        0,
        Math.min(10, (preparedItem.newCases || 0) / (prevItem.newCases || 0)),
      ) * 100) / 100;
    }
  } else {
    preparedItem.newCases = preparedItem.cases;
    preparedItem.newDeaths = preparedItem.deaths;
    preparedItem.growthRate = 1;
  }
  if (population) {
    preparedItem.newCasesInMillion = Math.round(
      (preparedItem.newCases / population) * 10000000,
    ) / 10;
    preparedItem.newCasesInMillion7dAvrg = getAvrg([
      preparedItem.newCasesInMillion,
      ...[...prevItems]
        .splice(-6)
        .map(i => i.newCasesInMillion)]);
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

  preparedItem.recovered = item.recovered || 0;
  if (prevItem) {
    preparedItem.newRecovered = preparedItem.recovered - prevItem.recovered;
  } else {
    preparedItem.newRecovered = preparedItem.recovered;
  }
  if (population) {
    preparedItem.recoveredInMillion = Math.round(
      (preparedItem.recovered / population) * 10000000,
    ) / 10;
    preparedItem.immunity = Math.round(
      (preparedItem.recovered / population) * 100000,
    ) / 1000;
  }

  preparedItem.recoveredPercent = Math.round(
    (preparedItem.recovered / preparedItem.cases) * 1000,
  ) / 10;

  preparedItem.activeCases = Math.max(
    0,
    preparedItem.cases - preparedItem.deaths - preparedItem.recovered,
  );
  if (prevItem) {
    preparedItem.newActiveCases = preparedItem.activeCases - prevItem.activeCases;
  } else {
    preparedItem.newActiveCases = preparedItem.activeCases;
  }

  if (population) {
    preparedItem.activeCasesInMillion = Math.round(
      (preparedItem.activeCases / population) * 10000000,
    ) / 10;
    preparedItem.deathsInMillion = Math.round(
      (preparedItem.deaths / population) * 10000000,
    ) / 10;
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

function formatDate(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export default ({ $axios }, inject) => {
  inject('loader', {
    async loadCasesFromJHU() {
      const [confirmed, deaths, recovered] = await Promise.all([
        $axios.get('https://covid19.cors-everywhere.workers.dev?metric=confirmed'),
        $axios.get('https://covid19.cors-everywhere.workers.dev?metric=deaths'),
        $axios.get('https://covid19.cors-everywhere.workers.dev?metric=recovered'),
      ]);
      const areas = Object.keys(confirmed.data);
      const dates = [];
      for (let i = 0; i < confirmed.data[areas[0]].length; i += 1) {
        dates.push(formatDate(new Date(2020, 0, 22 + i)));
      }
      confirmed.data.World = [];
      deaths.data.World = [];
      recovered.data.World = [];
      dates.forEach(() => {
        confirmed.data.World.push(0);
        deaths.data.World.push(0);
        recovered.data.World.push(0);
      });
      areas.forEach((area) => {
        const isCountry = !area.includes(', ');
        if (isCountry) {
          dates.forEach((date, index) => {
            confirmed.data.World[index] += confirmed.data[area][index] || 0;
            deaths.data.World[index] += deaths.data[area][index] || 0;
            recovered.data.World[index] += recovered.data[area][index] || 0;
          });
        }
      });
      areas.push('World');
      const timelines = {};
      areas.forEach((area) => {
        timelines[area] = [];
        const confirmedTimeline = confirmed.data[area] || [];
        const deathsTimeline = deaths.data[area] || [];
        const recoveredTimeline = recovered.data[area] || [];
        dates.forEach((date, index) => {
          const data = {
            date,
            cases: confirmedTimeline[index] || 0,
            deaths: deathsTimeline[index] || 0,
            active: (confirmedTimeline[index] || 0)
              - ((deathsTimeline[index] || 0) + (recoveredTimeline[index] || 0)),
            recovered: recoveredTimeline[index] || 0,
          };
          timelines[area].push(
            prepareTimelineItem(populations[area], data, timelines[area]),
          );
        });
      });
      const current = areas
        .map((area) => {
          const latestItem = timelines[area][dates.length - 1];
          if (!latestItem || !latestItem.cases) {
            return null;
          }
          const parts = area.split(', ');
          const country = parts[parts.length - 1];
          return {
            ...latestItem,
            name: area,
            location: area,
            isCountry: parts.length === 1,
            country,
            population: populations[area] || 0,
          };
        })
        .filter(item => !!item);
      return {
        timelines,
        timelineDates: dates,
        current,
      };
    },
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
          const name = countryNames[location] || location;
          timelines[name] = [];
          sortedDates.forEach((date) => {
            const locationData = data[location];
            const current = locationData.dates[date];
            timelines[name].push(
              prepareTimelineItem(locationData.population, current, timelines[name]),
            );
          });
        });

      const current = Object
        .keys(data)
        .map((location) => {
          const name = countryNames[location] || location;
          const latestItem = timelines[name][sortedDates.length - 1];
          if (!latestItem || !latestItem.cases) {
            return null;
          }
          return {
            ...data[location],
            ...latestItem,
            name,
            isCountry: !!countryNames[location],
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
