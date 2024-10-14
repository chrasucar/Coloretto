import axios from 'axios';

const instance = axios.create({

    baseURL: 'http://coloretto-api.vercel.app',
    withCredentials: true

})

export default instance;