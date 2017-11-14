export const callApi = (url, options) =>
  fetch(url, options)
    .then(
      (response) => {
        if (response.status === 204) {
          return '';
        } else if (response.ok) {
          return response.json();
        }
        return Promise.reject(response.text());
        // return response.ok ? response.json() : Promise.reject(response.text());
      },
      error => Promise.reject(error),
    )
    .then(json => ({ json }), error => ({ error }))
    .catch(error => ({ error }));

export default callApi;
