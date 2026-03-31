export async function createJWT(payload: any, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // 使用Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(`${encodedHeader}.${encodedPayload}`);
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function verifyJWT(token: string, secret: string): Promise<any | null> {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    
    // 使用Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(`${encodedHeader}.${encodedPayload}`);
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signatureBuffer = new Uint8Array([...atob(signature)].map(c => c.charCodeAt(0)));
    const isValid = await crypto.subtle.verify('HMAC', key, signatureBuffer, data);
    
    if (!isValid) {
      return null;
    }
    
    return JSON.parse(atob(encodedPayload));
  } catch (error) {
    return null;
  }
}
