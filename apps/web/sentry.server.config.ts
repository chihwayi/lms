import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://9e9e7aa4f87377ded1484827040843c3@o4510804457095168.ingest.us.sentry.io/4510804458733568",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
