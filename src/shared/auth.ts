import crypto from "crypto";
import axios from 'axios';

const options = {
  url: "https://sso.stage.redhat.com/auth",
  clientId: "cloud-services",
  realm: "redhat-external",
  promiseType: "native",
  onLoad: "check-sso",
  checkLoginIframe: false,
  redirectUri: "https://stage.foo.redhat.com:1337/",
  scope: ['openid']
};

function generateRandomData(len: number) {
  // use web crypto APIs if possible
  let array = null;
  if (crypto && crypto.getRandomValues) {
    array = new Uint8Array(len);
    crypto.getRandomValues(array);
    return array;
  }

  // fallback to Math random
  array = new Array(len);
  for (let j = 0; j < array.length; j++) {
    array[j] = Math.floor(256 * Math.random());
  }
  return array;
}

function generateRandomString(len: number, alphabet: string) {
  const randomData = generateRandomData(len);
  const chars = new Array(len);
  for (let i = 0; i < len; i++) {
    chars[i] = alphabet.charCodeAt(randomData[i] % alphabet.length);
  }
  return String.fromCharCode.apply(null, chars);
}

function createUUID() {
  const hexDigits = "0123456789abcdef";
  const s = generateRandomString(36, hexDigits).split("");
  s[14] = "4";
  const digitIndex = s[19];
  // @ts-ignore
  s[19] = hexDigits.substr((digitIndex & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = "-";
  var uuid = s.join("");
  return uuid;
}

type LoginOptions = typeof options;


const kc = {
  endpoints: {
    authorize: (ssoUrl: string, realm: string) => {
      return  `${ssoUrl}/realms/${realm}/protocol/openid-connect/auth/`
    },
    token: (ssoUrl: string, realm: string) => {
      return  `${ssoUrl}/realms/${realm}/protocol/openid-connect/token`
    }
  }
}

function createLoginUrl(options: LoginOptions) {
  const state = createUUID();
  const nonce = createUUID();

  const redirectUri = options.redirectUri;

  const baseUrl = kc.endpoints.authorize(options.url, options.realm)
  const url = new URL(baseUrl)
  url.searchParams.append('client_id', options.clientId)
  url.searchParams.append('redirect_uri', redirectUri)
  url.searchParams.append('state', state)
  url.searchParams.append('response_mode', 'query')
  url.searchParams.append('response_type', 'code')
  url.searchParams.append('scope', options.scope.join(' '));
  url.searchParams.append('nonce', nonce)

  return url.toString()
}

const auth = () => {
  return createLoginUrl(options)
};

export const getToken = (code: string) => {
  const formData = new URLSearchParams()
  formData.append('code', code)
  formData.append('grant_type', 'authorization_code')
  formData.append('client_id', 'cloud-services',)
  // FIXME: Dynamic redirect URI
  formData.append('redirect_uri', 'https://stage.foo.redhat.com:1337/')
  const tokenUrl = kc.endpoints.token(options.url, options.realm);
  return axios.post<{
    access_token: string
  }>(tokenUrl, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    proxy: {
      protocol: 'http',
      host: 'squid.corp.redhat.com',
      port: 3128
    }
  }).then(({ data }) => {
    return data.access_token
  }).catch(console.log)
}

export default auth;

export type DecodedToken = {
  exp: number;
  session_state?: string;
  email: string;
  username: string;
};

export function decodeToken(str: string): DecodedToken {
  str = str.split('.')[1];
  str = str.replace('/-/g', '+');
  str = str.replace('/_/g', '/');
  switch (str.length % 4) {
    case 0:
      break;
    case 2:
      str += '==';
      break;
    case 3:
      str += '=';
      break;
    default:
      throw 'Invalid token';
  }

  str = (str + '===').slice(0, str.length + (str.length % 4));
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  str = decodeURIComponent(escape(atob(str)));
  const res = JSON.parse(str);

  return res;
}

export function isTokenValid(token?: string) {
  try {
    if (!token) {
      return false;
    }

    const parsed = decodeToken(token);
    if (!parsed.exp) {
      return false;
    }

    // Date.now() has extra precision...
    // it includes milis
    // we need to trim it down to valid seconds from epoch
    // because we compare to KC's exp which is seconds from epoch
    const now = Date.now().toString().substr(0, 10);
    const exp = parsed.exp - parseInt(now);

    console.log(`Token expires in ${exp}`);

    // We want to invalidate tokens if they are getting close
    // to the expiry time
    // So that we can be someone safe from time skew
    // issues on our APIs
    // i.e. the client could have a slight time skew
    // and the API is true (because NTP) and we could send down
    // a JWT that is actually exipred
    if (exp > 90) {
      return true;
    } else {
      if (exp > 0) {
        console.log('token is expiring in < 90 seconds');
      } else {
        console.log('token is expired');
      }

      return false;
    }
  } catch (e: unknown) {
    console.error(e);
    return false;
  }
}