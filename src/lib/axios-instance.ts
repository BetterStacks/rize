import axios from "axios";

const instance = axios.create({
  baseURL: `${process.env.NEXTAUTH_URL}/api`,
});

export default instance;
