import axios from "axios";

export const cloudinaryAxios = axios.create({
  withCredentials: false,
});
