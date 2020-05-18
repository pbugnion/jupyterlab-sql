import { parse } from 'url';

export namespace ConnectionUrl {
  export function sanitize(url: string): string {
    const parsedUrl = parse(url);
    const { auth } = parsedUrl;
    if (((auth !== undefined) && (auth !== null)) && auth.includes(":")) {
        var [username, password] = auth.split(":")
        if (password && password !== '') {
          password = '•••••••';
        }
        return `${parsedUrl.protocol}//${username}:${password}@${parsedUrl.host}${parsedUrl.path}`
    } else {
        return parsedUrl.href
    }
  }
}
