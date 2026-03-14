import crypto from 'crypto';

interface PushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

/**
 * Base64 URL encode (without padding)
 */
function base64UrlEncode(buffer: Buffer | string): string {
    const b = typeof buffer === 'string' ? Buffer.from(buffer) : buffer;
    return b.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Assina um JWT para VAPID usando ECDSA P-256
 */
function createVapidJwt(endpoint: string, publicKey: string, privateKey: string, subject: string): string {
    const url = new URL(endpoint);
    const origin = url.origin;

    const header = {
        typ: 'JWT',
        alg: 'ES256'
    };

    const payload = {
        aud: origin,
        exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 horas
        sub: subject
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const tokenStr = `${encodedHeader}.${encodedPayload}`;

    const sign = crypto.createSign('SHA256');
    sign.update(tokenStr);
    sign.end();

    // VAPID expects an EC private key in PEM format usually. 
    // In Vercel we store a raw 32-byte base64url encoded string.
    const rawKey = Buffer.from(privateKey, 'base64url');
    // Wrap it in PKCS#8 or EC parameters
    const header_key = Buffer.from('3041020100301306072a8648ce3d020106082a8648ce3d030107042730250201010420', 'hex');
    const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${Buffer.concat([header_key, rawKey]).toString('base64').match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----\n`;

    const signatureDer = sign.sign(privateKeyPem);
    
    // Normalize DER signature to raw 64 byte Buffer
    const isZeroTolerated = signatureDer[3] === 0x00;
    const rStart = isZeroTolerated ? 4 : 3;
    const rLength = signatureDer[2] === 0x00 ? signatureDer[rStart - 2] - 1 : signatureDer[rStart - 1]; // Length of R
    const r = signatureDer.subarray(rStart, rStart + rLength);

    const sStart = rStart + rLength + 2;
    const sLength = signatureDer[sStart - 1];
    const s = signatureDer.subarray(sStart, sStart + sLength);

    const rawR = Buffer.alloc(32);
    const rawS = Buffer.alloc(32);
    r.copy(rawR, 32 - r.length);
    s.copy(rawS, 32 - s.length);

    const rawSignature = Buffer.concat([rawR, rawS]);
    const encodedSignature = base64UrlEncode(rawSignature);

    return `${tokenStr}.${encodedSignature}`;
}

/**
 * Envia uma Web Push Notification com o payload vazio.
 */
export async function sendPushNotification(subscription: PushSubscription) {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || 'mailto:suporte@stock720x.com';

    if (!publicKey || !privateKey) {
        throw new Error('VAPID keys missing in env.');
    }

    const jwt = createVapidJwt(subscription.endpoint, publicKey, privateKey, subject);

    const headers = {
        'Authorization': `vapid t=${jwt}, k=${publicKey}`,
        'Content-Length': '0'
    };

    const response = await fetch(subscription.endpoint, {
        method: 'POST',
        headers: headers
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Push failed with status ${response.status}: ${errText}`);
    }

    return true;
}
