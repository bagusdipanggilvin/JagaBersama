const API = (() => {
  
  // Helper to handle fetch requests with auth headers and standard JSON parser
  const request = async (endpoint, options = {}) => {
    const url = `${CONFIG.API_URL}${endpoint}`;
    
    // Setup default headers
    const headers = new Headers(options.headers || {});
    
    // Retrieve Auth Token
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Format JSON request payload
    if (options.body && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
      options.body = JSON.stringify(options.body);
    }
    
    const config = {
      ...options,
      headers
    };
    
    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'Terjadi kesalahan sistem.'
        };
      }
      return data;
    } catch (err) {
      if (err.status) throw err;
      throw {
        status: 0,
        message: 'Koneksi ke server gagal. Pastikan backend server menyala.'
      };
    }
  };

  return {
    // Authentication Endpoints
    auth: {
      register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
      login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
      getProfile: () => request('/auth/profile', { method: 'GET' }),
      updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: profileData }),
      changePassword: (passwordData) => request('/auth/password', { method: 'PUT', body: passwordData })
    },
    
    // Reports Endpoints
    reports: {
      createReport: (reportData) => request('/reports', { method: 'POST', body: reportData }),
      getMyReports: (userId) => request(`/reports/my-reports/${userId}`, { method: 'GET' }),
      getReportStatus: (trackingNumber) => request(`/reports/${trackingNumber}`, { method: 'GET' })
    },
    
    // Educational Articles Endpoints
    articles: {
      getArticles: () => request('/articles', { method: 'GET' }),
      getArticleById: (id) => request(`/articles/${id}`, { method: 'GET' })
    }
  };

})();
