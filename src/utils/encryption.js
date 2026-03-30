import axios from "axios";

let cachedPublicKey = null;

const fetchPublicKey = async () => {
  if (cachedPublicKey) return cachedPublicKey;
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/public-key`);
  cachedPublicKey = res.data.publicKey;
  return cachedPublicKey;
};

const pemToArrayBuffer = (pem) => {
  const base64 = pem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\n/g, "");
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
  return buffer.buffer;
};

export const encryptPassword = async (plainPassword) => {
  const pem = await fetchPublicKey();
  const keyBuffer = pemToArrayBuffer(pem);

  const cryptoKey = await window.crypto.subtle.importKey(
    "spki",
    keyBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    cryptoKey,
    new TextEncoder().encode(plainPassword)
  );

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
};
