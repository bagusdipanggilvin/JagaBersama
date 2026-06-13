const CONFIG = {
  // Local host API mapping or default paths
  API_URL: (window.location.protocol === 'file:' || !window.location.hostname)
    ? 'http://127.0.0.1:5000/api'
    : (window.location.port === '5000')
      ? '/api'
      : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://127.0.0.1:5000/api'
        : '/api',

  // EmailJS integration variables (user placeholder parameters)
  EMAILJS: {
    SERVICE_ID: "service_bfke6aj", 
    TEMPLATE_ID: "template_uayqh7g",
    PUBLIC_KEY: "gf0CQrDEEp_GQa3av"
  }
};
Object.freeze(CONFIG);
