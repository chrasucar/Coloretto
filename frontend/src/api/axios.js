import axios from 'axios';

const instance = axios.create({

    baseURL: 'http://coloretto-api.onrender.com',
    withCredentials: true

})

export default instance;