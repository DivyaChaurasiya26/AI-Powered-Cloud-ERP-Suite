import { Request, Response } from "express";

import { JournalEntry } from "../models/journalEntry.model";

import { validateJournal } from "../services/journal.service";

export const createJournalEntry =
  async (
    req: Request,
    res: Response
  ) => {
    try {

      const user =
        (req as any).user;

      const {
        description,
        lines,
      } = req.body;

      const isValid =
        validateJournal(lines);

      if (!isValid) {
        return res.status(400).json({
          message:
            "Debits and credits must balance",
        });
      }

      const entry =
        await JournalEntry.create({
          tenantId:
            user.tenantId,

          description,

          lines,
        });

      res.status(201).json({
        message:
          "Journal entry created",

        entry,
      });

    } catch (error: any) {

      res.status(500).json({
        message:
          error.message,
      });
    }
  };