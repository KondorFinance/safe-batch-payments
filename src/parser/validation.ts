import { BigNumber } from "bignumber.js";
import { utils } from "ethers";

import { AssetTransfer, CollectibleTransfer, Transfer, UnknownTransfer } from "../hooks/useCsvParser";

export const validateRow = (row: Transfer | UnknownTransfer): string[] => {
  switch (row.token_type) {
    case "erc20":
    case "native":
      return validateAssetRow(row);
    case "erc1155":
    case "erc721":
      return validateCollectibleRow(row);
    default:
      return ["Unknown token_type: Must be one of erc20, native or nft"];
  }
};

/**
 * Validates, that addresses are valid, the amount is big enough and a decimal is given or can be found in token lists.
 */
export const validateAssetRow = (row: AssetTransfer) => {
  const warnings = [...areAddressesValid(row), ...isAmountPositive(row), ...isAssetTokenValid(row)];
  return warnings;
};

export const validateCollectibleRow = (row: CollectibleTransfer) => {
  const warnings = [
    ...areAddressesValid(row),
    ...isTokenIdPositive(row),
    ...isCollectibleTokenValid(row),
    ...isTokenValueValid(row),
    ...isTokenValueInteger(row),
    ...isTokenIdInteger(row),
  ];
  return warnings;
};

const areAddressesValid = (row: Transfer): string[] => {
  const warnings: string[] = [];
  if (!(row.tokenAddress === null || utils.isAddress(row.tokenAddress))) {
    warnings.push(`Invalid Token Address: ${row.tokenAddress}`);
  }
  if (row.receiver.includes(":")) {
    warnings.push(`The chain prefix must match the current network: ${row.receiver}`);
  } else {
    if (!utils.isAddress(row.receiver)) {
      warnings.push(`Invalid Receiver Address: ${row.receiver}`);
    }
  }
  return warnings;
};

const isAmountPositive = (row: AssetTransfer): string[] =>
  new BigNumber(row.amount).isGreaterThan(0) ? [] : ["Only positive amounts/values possible: " + row.amount];

const isAssetTokenValid = (row: AssetTransfer): string[] =>
  row.decimals === -1 && row.symbol === "TOKEN_NOT_FOUND" ? [`No token contract was found at ${row.tokenAddress}`] : [];

const isCollectibleTokenValid = (row: CollectibleTransfer): string[] =>
  row.tokenName === "TOKEN_NOT_FOUND" ? [`No token contract was found at ${row.tokenAddress}`] : [];

const isTokenIdPositive = (row: CollectibleTransfer): string[] => {
  const tokenIdAsNumber = new BigNumber(row.tokenId);
  return tokenIdAsNumber.isPositive() ? [] : [`Only positive Token IDs possible: ${tokenIdAsNumber.toFixed()}`];
};
const isTokenIdInteger = (row: CollectibleTransfer): string[] => {
  const tokenIdAsNumber = new BigNumber(row.tokenId);
  return tokenIdAsNumber.isInteger() ? [] : [`Token IDs must be integer numbers: ${tokenIdAsNumber.toFixed()}`];
};
const isTokenValueInteger = (row: CollectibleTransfer): string[] => {
  if (row.amount) {
    const amountAsNumber = new BigNumber(row.amount);
    if (amountAsNumber.isNaN() || !amountAsNumber.isInteger()) {
      return [`Value / amount of ERC1155 must be an integer: ${row.amount}`];
    }
  }
  return [];
};

const isTokenValueValid = (row: CollectibleTransfer): string[] =>
  row.token_type === "erc721" || (typeof row.amount !== "undefined" && new BigNumber(row.amount).isGreaterThan(0))
    ? []
    : [`ERC1155 Tokens need a defined value > 0: ${row.amount}`];
