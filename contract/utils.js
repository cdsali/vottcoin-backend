import { Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import fs from "fs";

const envItems = [
  "CUSTOM_PROGRAM_ID",
  "SELLER_PUBLIC_KEY",
  "TOKEN_PUBKEY",
  "SELLER_TOKEN_ACCOUNT_PUBKEY",
  "TEMP_TOKEN_ACCOUNT_PUBKEY",
  "TOKEN_SALE_PROGRAM_ACCOUNT_PUBKEY",
];

export function updateEnv() {
  const eol = "\n";
  const envContents = envItems.map((item) => `${item}=${process.env[item]}`).join(eol);
  fs.writeFileSync(".env", envContents);
}

export const getKeypair = (publicKey, privateKey) =>
  new Keypair({
    publicKey: new PublicKey(publicKey).toBytes(),
    secretKey: privateKey,
  });

export const getTokenBalance = async (pubkey, connection) => {
  return parseInt((await connection.getTokenAccountBalance(pubkey)).value.amount);
};

export const createAccountInfo = (pubkey, isSigner, isWritable) => {
  return {
    pubkey: pubkey,
    isSigner: isSigner,
    isWritable: isWritable,
  };
};

export const checkAccountInitialized = async (connection, customAccountPubkey) => {
  const customAccount = await connection.getAccountInfo(customAccountPubkey);

  if (customAccount === null || customAccount.data.length === 0) {
    console.error("Account of custom program has not been initialized properly");
    // process.exit(1);
  }

  return customAccount;
};

export const checkAccountDataIsValid = (
  customAccountData,
  expectedCustomAccountState
) => {
  const keysOfAccountData = Object.keys(customAccountData);
  const data = {};

  keysOfAccountData.forEach((key) => {
    const value = customAccountData[key];
    const expectedValue = expectedCustomAccountState[key];

    //PublicKey
    if (value instanceof Uint8Array && expectedValue instanceof PublicKey) {
      if (!new PublicKey(value).equals(expectedValue)) {
        console.log(`${key} is not matched expected one`);
        // process.exit(1);
      }
    } else if (value instanceof Uint8Array && typeof expectedValue === "number") {
      //value is undefined
      if (!value) {
        console.log(`${key} flag has not been set`);
        // process.exit(1);
      }

      //value is not matched expected one.
      const isBufferSame = Buffer.compare(value, Buffer.from(new BN(expectedValue).toArray("le", value.length)));

      if (isBufferSame !== 0) {
        console.log(`[${key}] : expected value is ${expectedValue}, but current value is ${value}`);
        // process.exit(1);
      }
    }

    data[key] = expectedValue.toString();
  });
  console.table([data]);
};
