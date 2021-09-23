const path = require('path');
const version = require(path.join(__dirname, 'package.json')).version;
const build_number = process.argv[2];
const today = new Date().toLocaleDateString([], {
    year: 'numeric',
    month: '2-digit',
    day: 'numeric',
}).replace(/^(\d{2})\/(\d{1,2})\/(\d{4})$/, "$3$1$2");

console.log(`${version}-${today}-build-${build_number}`);
