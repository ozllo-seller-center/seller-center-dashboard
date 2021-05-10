import axios from 'axios';

//process.env.API_URL,

const api = axios.create({
  baseURL: 'https://ozllo-seller-center.herokuapp.com/'
});

export default api;
