export const callApi = url =>
  axios
    .get(url)
    .then(response => ({ json: response.data }))
    .catch(error => {
      if (error.response) {
        return {
          error: {
            status: error.response.status,
            data: error.response.data
          }
        };
      }
      return { error };
    });

export default callApi;
