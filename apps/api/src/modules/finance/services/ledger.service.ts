import { Ledger } from "../models/ledger.model";

export const createLedgerEntry = async (data: any) => {
  return await Ledger.create(data);
};