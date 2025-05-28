const env = process.env.TEST_ENV || 'dev';
const testData = require(`./users.${env}.json`);
export default testData;