import axios from 'axios';

const handleError = error =>
  (error.response
    ? {
      error: {
        status: error.response.status,
        date: error.response.data,
      },
    }
    : { error });

const handleResponse = response => ({ json: response.data });

export const get = (url, params) =>
  axios
    .get(url, { params })
    .then(handleResponse)
    .catch(handleError);

export const post = (url, payload) =>
  axios
    .post(url, payload)
    .then(handleResponse)
    .catch(handleError);
