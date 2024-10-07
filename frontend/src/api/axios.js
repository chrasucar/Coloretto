import axios from 'axios';

const instance = axios.create({

    baseURL: 'http://localhost:3000' || process.env.FRONTEND_URL,
    withCredentials: true

})

export default instance;