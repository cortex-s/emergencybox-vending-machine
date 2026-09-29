import { z } from "zod";

export const categoryEnum = z.enum(["FIRST_AID", "RAIN", "HYGIENE", "ELECTRONICS"]);

export const createProductSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อสินค้า").max(100),
  description: z.string().min(1, "กรุณากรอกรายละเอียด").max(1000),
  price: z.number().int().positive("ราคาต้องมากกว่า 0"),
  image: z.string().min(1, "กรุณาระบุรูปภาพ"),
  stock: z.number().int().min(0).default(0),
  maxStock: z.number().int().positive("สต็อกสูงสุดต้องมากกว่า 0"),
  slot: z
    .string()
    .regex(/^[A-Z][0-9]{2}$/, "ช่องต้องอยู่ในรูปแบบ A01"),
  category: categoryEnum,
  isActive: z.boolean().optional().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const addStockSchema = z.object({
  amount: z.number().int().positive("จำนวนต้องมากกว่า 0"),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "ตะกร้าว่างเปล่า"),
  cashBreakdown: z.record(z.string(), z.number().int().min(0)),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, "กรุณากรอกชื่อผู้ใช้"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export const adminChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"),
});

export const productFormSchema = z
  .object({
    name: z.string().min(1, "กรุณากรอกชื่อสินค้า").max(100, "ชื่อยาวเกิน 100 ตัวอักษร"),
    description: z.string().min(1, "กรุณากรอกรายละเอียด").max(1000, "รายละเอียดยาวเกิน 1000 ตัวอักษร"),
    price: z.coerce.number({ invalid_type_error: "กรุณากรอกราคา" }).int("ราคาต้องเป็นจำนวนเต็ม").positive("ราคาต้องมากกว่า 0"),
    image: z.string().min(1, "กรุณาระบุรูปภาพ"),
    stock: z.coerce.number().int("ต้องเป็นจำนวนเต็ม").min(0, "สต็อกต้องไม่ติดลบ"),
    maxStock: z.coerce.number().int("ต้องเป็นจำนวนเต็ม").positive("สต็อกสูงสุดต้องมากกว่า 0"),
    slot: z.string().regex(/^[A-Z][0-9]{2}$/, "ช่องต้องอยู่ในรูปแบบ A01"),
    category: categoryEnum,
    isActive: z.boolean(),
  })
  .refine((v) => v.stock <= v.maxStock, {
    message: "สต็อกต้องไม่เกินสต็อกสูงสุด",
    path: ["stock"],
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;
