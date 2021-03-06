import { Injectable } from '@nestjs/common';
import data from './mock-users.json';
import posts from './mock-posts.json';

const chunks = (arr, n) => {
  const chunksArr = [];
  if (arr != null && arr != undefined) {
    for (let i = 0; i < arr.length; i += n) {
      if (arr.length - i >= n) chunksArr.push(arr.slice(i, i + n));
      else chunksArr.push(arr.slice(i, arr.length));
    }
    return chunksArr;
  }
};

export interface PollingResponse {
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any[];
}

interface GenericResponse {
  message: string;
}

const initialState = {
  status: 'pending',
  message: 'Still collecting data... try again in a few seconds',
} as const;

let state: PollingResponse;

@Injectable()
export class AppService {
  getData(): GenericResponse {
    return { message: 'Welcome to polling-api!' };
  }

  prepare(): GenericResponse {
    state = initialState;
    setTimeout(() => {
      const shouldError = Math.random() > 0.8;
      if (shouldError) {
        state = {
          status: 'error',
          message: 'failed collecting data',
        };
      } else {
        state = {
          status: 'success',
          message: 'Here is your data',
          data,
        };
      }
    }, 10000);
    return {
      message:
        'successfully started the data collection process, please check in every few seconds.',
    };
  }

  pollData(): PollingResponse {
    return state;
  }

  getPosts(page: number) {
    const postsByPage = [...chunks(posts, 10)];

    return postsByPage[page - 1];
  }
}
