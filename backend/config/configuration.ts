export default () => ({
  http: {
    host: process.env.HTTP_HOST || 'localhost',
    port: parseInt(process.env.HTTP_PORT, 10) || 3000,
  },
  db: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 27017,
  },
  huslApp: {
    webHuslApi: {
      baseURL: process.env.WEBHUSL_API_URL,
      masterKey: process.env.WEBHUSL_API_MASTER_KEY,
    },
  },
});
