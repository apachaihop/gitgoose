import { setContext } from '@apollo/client/link/context';
import Cookies from 'js-cookie';

export const authLink = setContext((_, { headers }) => {
  const token = Cookies.get('token');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});