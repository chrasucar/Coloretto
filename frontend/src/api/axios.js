import axios from 'axios';

const instance = axios.create({

    baseURL: 'http://localhost:3000' || process.env.MONGODB_URI,
    withCredentials: true

})

export default instance;