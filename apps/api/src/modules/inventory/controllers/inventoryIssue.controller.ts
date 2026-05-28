import { Request, Response } from "express";

import { consumeFIFOInventory } from "../services/fifo.service";
import { checkAndReorder } from "../services/reorder.service";
export const issueInventory =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        inventoryItemId,
        quantity,
      } = req.body;

      const result =
        await consumeFIFOInventory(
          inventoryItemId,
          quantity
        );
await checkAndReorder(
  inventoryItemId
);
      res.json({
        message:
          "Inventory issued",
        result,
      });

    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
  