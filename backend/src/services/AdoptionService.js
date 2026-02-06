import axios from 'axios';
import { env } from '../config/env.js';

export class AdoptionService {
  static async getRecommendedResources(zip) {
    if (!env.ADOPTAPET_BASE_URL || !env.ADOPTAPET_API_KEY) {
      return [];
    }
    const url = `${env.ADOPTAPET_BASE_URL}/pets`;
    const params = {
      key: env.ADOPTAPET_API_KEY,
      location: zip,
      count: 5,
      species: 'cat'
    };
    const { data } = await axios.get(url, { params });
    return data;
  }
}
