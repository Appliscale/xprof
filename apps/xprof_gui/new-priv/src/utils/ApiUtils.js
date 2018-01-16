import axios from 'axios';

const handleError = error =>
  (error.response
    ? {
      error: {
        status: error.response.status,
        message: error.response.data,
      },
    }
    : { error });

const handleResponse = response => ({ json: response.data });

export const api = {
  get: (url, params) =>
    axios
      .get(url, { params })
      .then(handleResponse)
      .catch(handleError),
  post: (url, payload) =>
    axios
      .post(url, payload)
      .then(handleResponse)
      .catch(handleError),
};

export default api;
