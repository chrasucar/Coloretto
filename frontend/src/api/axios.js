import axios from 'axios';

const instance = axios.create({

    baseURL: 'https://coloretto.vercel.app',
    withCredentials: true

})

export default instance;