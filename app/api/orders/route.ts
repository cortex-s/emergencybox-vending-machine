import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling, ApiError } from "@/lib/api/response";
import { createOrderSchema } from "@/lib/validations/schemas";
import {
  WALLET_DENOMINATIONS,
  emptyCounts,
  makeChange,
  normalizeCounts,
  sumCounts,
  type CashCounts,
} from "@/lib/utils/cash";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const data = createOrderSchema.parse(body);

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const productIds = data.items.map((i) => i.productId);
    const products = await tx.product.findMany({ where: { id: { in: productIds } } });

    const productMap = new Map(products.map((p: (typeof products)[number]) => [p.id, p]));

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new ApiError("ข้อมูลไม่ถูกต้อง", 404, {
          [item.productId]: "ไม่พบสินค้า",
        });
      }
      if (!product.isActive) {
        throw new ApiError("ข้อมูลไม่ถูกต้อง", 400, {
          [item.productId]: `${product.name} ไม่พร้อมจำหน่าย`,
        });
      }
      if (product.stock < item.quantity) {
        throw new ApiError("ข้อมูลไม่ถูกต้อง", 409, {
          [item.productId]: `${product.name} หมดแล้ว`,
        });
      }
    }

    let totalAmount = 0;
    const lineItems = data.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      return {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        subtotal,
        slot: product.slot,
      };
    });

    // The server adds up the cash itself; the client only says which notes/coins went in.
    let cashReceived = 0;
    let changeAmount = 0;

    const inserted = normalizeCounts(data.cashBreakdown);
    if (!inserted) {
      throw new ApiError("ข้อมูลไม่ถูกต้อง", 400, { cashReceived: "ข้อมูลเงินที่หยอดไม่ถูกต้อง" });
    }
    cashReceived = sumCounts(inserted);
    if (cashReceived < totalAmount) {
      throw new ApiError("ข้อมูลไม่ถูกต้อง", 400, {
        cashReceived: `เงินไม่พอ ขาดอีก ${totalAmount - cashReceived} บาท`,
      });
    }
    changeAmount = cashReceived - totalAmount;

    const rows = await tx.machineCash.findMany();
    const available = emptyCounts();
    for (const row of rows) available[row.denomination] = row.count;

    const plan = makeChange(changeAmount, available);
    if (!plan) {
      throw new ApiError("ข้อมูลไม่ถูกต้อง", 409, {
        cashReceived: `ตู้ทอนเงิน ${changeAmount} บาทไม่ได้ ระบบคืนเงินให้แล้ว`,
      });
    }
    const changeBreakdown: CashCounts = plan;

    for (const d of WALLET_DENOMINATIONS) {
      const delta = inserted[d] - plan[d];
      if (delta === 0) continue;
      await tx.machineCash.upsert({
        where: { denomination: d },
        update: { count: { increment: delta } },
        create: { denomination: d, count: Math.max(delta, 0) },
      });
    }

    for (const item of data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const order = await tx.order.create({
      data: {
        totalAmount,
        cashReceived,
        changeAmount,
        items: { create: lineItems },
      },
      include: { items: true },
    });

    return { order, changeBreakdown };
  });

  return ok({ ...result.order, changeBreakdown: result.changeBreakdown }, 201);
});
