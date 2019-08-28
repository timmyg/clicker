import GoTrue from 'gotrue-js';

export const auth = new GoTrue({
  APIUrl: 'https://netlify-gotrue-in-vue.netlify.com/.netlify/identity',
  audience: '',
  setCookie: false,
});

const state = {
  currentUser: getSavedState('auth.currentUser'),
  loading: false,
  loggedIn: false,
  token: null,
  notifications: [],
};

function getSavedState(key) {
  return JSON.parse(window.localStorage.getItem(key));
}

export default state;
