import urlparse from 'url-parse';

export namespace ConnectionUrl {
  export function sanitize(url: string): string {
    const parsedUrl = urlparse(url);
    const { password } = parsedUrl;
    if (password && password !== '') {
      parsedUrl.set('password', '•••••••');
    }
    return parsedUrl.href;
  }
}
