import axios from 'axios';

const instance = axios.create({

    baseURL: process.env.MONGODB_URI || 'http://localhost:3000',
    withCredentials: true

})

export default instance;