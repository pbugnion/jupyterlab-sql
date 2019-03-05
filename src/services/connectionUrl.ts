import * as urlparse from 'url-parse';

export namespace ConnectionUrl {
  export function sanitize(url: string): string {
    const parsedUrl = urlparse(url)
    parsedUrl.set('password', '•••••••');
    return parsedUrl.href
  }
}
