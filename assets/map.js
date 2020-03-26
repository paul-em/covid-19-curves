const fs = require('fs');
const path = require('path');

const file = fs.readFileSync(path.resolve(__dirname, 'countries.json'));

const countries = JSON.parse(file);
const countryNames = {};

countries.forEach((c) => {
  countryNames[c.cca3] = c.name;
});

fs.writeFileSync(path.resolve(__dirname, 'countryNames.json'), JSON.stringify(countryNames, null, 2));
