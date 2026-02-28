window.__SEVENCHECK_CONFIG__ = window.__SEVENCHECK_CONFIG__ || {};

window.__SEVENCHECK_CONFIG__.sunoGenerator = {
  endpointUrl: "",
  requestTimeoutMs: 15000,
  access: {
    // SHA-256 hex string only. Do not store plaintext passcodes in source.
    passcodeHash: "",
    allowedEmails: [],
    allowFirebaseWhitelist: true,
    sessionHours: 12
  },
  storage: {
    enabled: false,
    collection: "sunoDrafts"
  }
};
