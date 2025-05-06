import { PublicKey, Keypair } from '@solana/web3.js';
import * as nacl from 'tweetnacl';
import request from 'supertest';

describe('Wallet Authentication (e2e)', () => {
  let testWallet: Keypair;
  let nonce: string;
  const baseUrl = 'http://localhost:3035';

  beforeAll(() => {
    // Create a test wallet
    testWallet = Keypair.generate();
  });

  beforeEach(async () => {
    // Get a fresh nonce before each test
    const response = await request(baseUrl).get('/auth/nonce').expect(200);
    nonce = response.body.nonce;
    console.log('nonce', nonce);
  });

  it('should generate a nonce', async () => {
    expect(nonce).toBeDefined();
  });

  it('should verify wallet signature', async () => {
    const message = new TextEncoder().encode(nonce);
    const signature = nacl.sign.detached(message, testWallet.secretKey);

    await request(baseUrl)
      .post('/auth/verify')
      .set('x-wallet-address', testWallet.publicKey.toString())
      .set('x-signature', Buffer.from(signature).toString('base64'))
      .set('x-message', nonce)
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.wallet_address).toBe(
          testWallet.publicKey.toString(),
        );
      });
  });

  it('should reject invalid signature', async () => {
    const fakeWallet = Keypair.generate();
    const message = new TextEncoder().encode(nonce);
    const signature = nacl.sign.detached(message, fakeWallet.secretKey);

    await request(baseUrl)
      .post('/auth/verify')
      .set('x-wallet-address', testWallet.publicKey.toString())
      .set('x-signature', Buffer.from(signature).toString('base64'))
      .set('x-message', nonce)
      .expect(401);
  });

  it('should reject request with missing headers', async () => {
    await request(baseUrl).post('/auth/verify').expect(401);
  });
});
