import axios from 'axios';

const instance = axios.create({

    baseURL: 'https://coloretto-api.onrender.com',
    withCredentials: true

})

export default instance;