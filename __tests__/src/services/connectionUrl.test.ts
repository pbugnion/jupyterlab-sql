import { ConnectionUrl } from '../../../src/services';

describe('sanitize', () => {
  it('without password', () => {
    expect(
      ConnectionUrl.sanitize('postgres://localhost:5432/postgres')
    ).toEqual('postgres://localhost:5432/postgres');
  });

  it('with password', () => {
    expect(
      ConnectionUrl.sanitize(
        'postgres://awsuser:password@some.hostname.com/dbname'
      )
    ).toEqual('postgres://awsuser:•••••••@some.hostname.com/dbname');
  });

  it('with user without password', () => {
    expect(
      ConnectionUrl.sanitize(
        'postgres://awsuser@some.hostname.com/dbname'
      )
    ).toEqual('postgres://awsuser@some.hostname.com/dbname')
  })
});
