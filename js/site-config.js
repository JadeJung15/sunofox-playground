window.__SEVENCHECK_CONFIG__ = window.__SEVENCHECK_CONFIG__ || {};

window.__SEVENCHECK_CONFIG__.sunoGenerator = {
  // Example: "http://localhost:8787/api/suno-draft"
  endpointUrl: "",
  requestTimeoutMs: 15000,
  access: {
    // SHA-256 hex string only. Do not store plaintext passcodes in source.
    passcodeHash: "479904cc2d928ec415b03c0c66f914e9e8e630042f82eb5066d59dd7dc7a0f48",
    allowedEmails: [],
    allowFirebaseWhitelist: true,
    sessionHours: 12
  },
  storage: {
    enabled: false,
    collection: "sunoDrafts"
  }
};
