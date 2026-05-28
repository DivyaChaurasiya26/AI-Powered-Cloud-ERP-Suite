import { InventoryBatch } from "../models/inventoryBatch.model";

export const consumeFIFOInventory =
  async (
    inventoryItemId: string,
    quantityNeeded: number
  ) => {
    const batches =
      await InventoryBatch.find({
        inventoryItemId,
        remainingQuantity: {
          $gt: 0,
        },
      }).sort({
        receivedDate: 1,
      });

    let remaining =
      quantityNeeded;

    let totalCost = 0;

    for (const batch of batches) {
      if (remaining <= 0) {
        break;
      }

      const consumeQty =
        Math.min(
          remaining,
          batch.remainingQuantity
        );

      totalCost +=
        consumeQty *
        batch.unitCost;

      batch.remainingQuantity -=
        consumeQty;

      await batch.save();

      remaining -= consumeQty;
    }

    return {
      quantityConsumed:
        quantityNeeded -
        remaining,

      totalCost,

      remainingUnfulfilled:
        remaining,
    };
  };