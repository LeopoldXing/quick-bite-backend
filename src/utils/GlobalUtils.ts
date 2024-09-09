import SparkMD5 from 'spark-md5';

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const calculateMD5 = (buffer: Buffer): string => {
  const spark = new SparkMD5.ArrayBuffer();
  spark.append(buffer);
  const md5Hash = spark.end();
  const rawHash = hexStringToByteArray(md5Hash);
  const base64String = btoa(String.fromCharCode(...rawHash));
  return base64String;
};

const hexStringToByteArray = (hexString: string) => {
  const result = [];
  for (let i = 0; i < hexString.length; i += 2) {
    result.push(parseInt(hexString.substring(i, i + 2), 16));
  }
  return result;
}

export const calculateSHA256 = async (blob: Blob): Promise<string> => {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};
