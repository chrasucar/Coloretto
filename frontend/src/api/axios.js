import axios from 'axios';

const instance = axios.create({

    baseURL: 'https://coloretto-api.vercel.app',
    
})

export default instance;