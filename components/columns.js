function formatNumber(num) {
  if (!num) {
    return '';
  }
  return Math.floor(num).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}


export default [
  {
    label: 'Total Cases',
    value: 'cases',
    formatter: row => formatNumber(row.cases),
    width: 75,
  },
  {
    label: 'New Cases',
    value: 'newCases',
    width: 90,
    formatter: row => (row.newCases > 1 ? `+${formatNumber(row.newCases)}` : ''),
    serverity: (row) => {
      if (!row.population) {
        return 0;
      }
      return Math.min(1, (row.newCases / row.population) * 100000);
    },
  },
  {
    label: '% New Cases',
    value: 'newCasesPercent',
    width: 90,
    formatter: row => (row.newCasesPercent > 1 ? `${row.newCasesPercent}%` : ''),
    serverity: row => Math.min(1, row.newCasesPercent / 30),
  },
  {
    label: 'New Cases / Million',
    value: 'newCasesInMillion',
    width: 75,
    serverity: row => row.newCasesInMillion / 500,
  },
  {
    label: 'New Cases / Million 7d Avrg',
    value: 'newCasesInMillion7dAvrg',
    width: 75,
    serverity: row => row.newCasesInMillion7dAvrg / 500,
  },
  {
    label: 'Growth Rate',
    value: 'growthRate',
    width: 90,
    serverity: row => row.growthRate - 1,
  },
  {
    label: 'Total Cases / Million',
    value: 'casesInMillion',
    width: 75,
    serverity: row => row.casesInMillion / 500,
  },
  {
    label: 'Cases Doubled',
    value: 'casesDoubled',
    width: 75,
    formatter: (row) => {
      if (row.casesDoubled > 1) {
        return `${row.casesDoubled} days`;
      }
      if (row.casesDoubled === 1) {
        return '1 day';
      }
      return '';
    },
  },
  {
    label: 'Total Deaths',
    value: 'deaths',
    formatter: row => formatNumber(row.deaths),
    width: 75,
  },
  {
    label: 'New Deaths',
    value: 'newDeaths',
    width: 75,
    formatter: row => (row.newDeaths > 0 ? `+${row.newDeaths}` : ''),
    serverity: (row) => {
      if (!row.population) {
        return 0;
      }
      return Math.min(1, (row.newDeaths / row.population) * 100000);
    },
  },
  {
    label: 'Deaths / Million',
    value: 'deathsInMillion',
    width: 75,
    serverity: row => row.deathsInMillion / 50,
  },
  {
    label: '% Deaths',
    value: 'deathsPercent',
    width: 75,
    formatter: row => (row.deathsPercent > 0 ? `${row.deathsPercent}%` : ''),
    serverity: row => Math.min(1, row.deathsPercent / 10),
  },
  {
    label: '% New Deaths',
    value: 'newDeathsPercent',
    width: 90,
    formatter: row => (row.newDeathsPercent > 1 ? `${row.newDeathsPercent}%` : ''),
    serverity: row => Math.min(1, row.newDeathsPercent / 30),
  },
  {
    label: 'Deaths Doubled',
    value: 'deathsDoubled',
    width: 75,
    formatter: (row) => {
      if (row.deathsDoubled > 1) {
        return `${row.deathsDoubled} days`;
      }
      if (row.deathsDoubled === 1) {
        return '1 day';
      }
      return '';
    },
  },
  {
    label: 'Active Cases',
    value: 'activeCases',
    formatter: row => formatNumber(row.activeCases),
    width: 75,
  },
  {
    label: 'Active Cases change',
    value: 'newActiveCases',
    width: 75,
    formatter: row => (row.newActiveCases > 0 ? `+${row.newActiveCases}` : row.newActiveCases || ''),
    serverity: (row) => {
      if (!row.population) {
        return 0;
      }
      if (row.newActiveCases < 0) {
        return -1;
      }
      return Math.min(1, (row.newActiveCases / row.population) * 100000);
    },
  },
  {
    label: 'Active Cases / Million',
    value: 'activeCasesInMillion',
    width: 75,
    serverity: row => row.activeCasesInMillion / 500,
  },
  {
    label: 'New Recovered',
    value: 'newRecovered',
    width: 75,
    formatter: row => (row.newRecovered > 1 ? `+${row.newRecovered}` : ''),
    serverity: (row) => {
      if (!row.population) {
        return 0;
      }
      return -Math.min(1, (row.newRecovered / row.population) * 100000);
    },
  },
  {
    label: 'Total Recovered',
    value: 'recovered',
    width: 75,
  },
  {
    label: '% Recovered',
    value: 'recoveredPercent',
    width: 75,
    formatter: row => (row.recoveredPercent > 0 ? `${row.recoveredPercent}%` : ''),
  },
  {
    label: 'Recovered / Million',
    value: 'recoveredInMillion',
    width: 75,
  },
  {
    label: 'Immunity',
    value: 'immunity',
    width: 75,
    formatter: row => (row.immunity > 0 ? `${row.immunity}%` : ''),
  },
];
