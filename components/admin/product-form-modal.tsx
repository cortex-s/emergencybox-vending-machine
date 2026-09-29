"use client";

import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/form-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  productFormSchema as schema,
  type ProductFormValues,
} from "@/lib/validations/schemas";
import { CATEGORY_LABELS } from "@/lib/utils/format";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import type { Product } from "@/components/providers/cart-provider";
import FormSwitch from "../form-switch";

export function ProductFormModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price,
      image: product?.image ?? "/images/placeholder.svg",
      stock: product?.stock ?? 0,
      maxStock: product?.maxStock ?? 10,
      slot: product?.slot ?? "",
      category:
        (product?.category as ProductFormValues["category"]) ?? "FIRST_AID",
      isActive: product?.isActive ?? true,
    },
  });

  const { isSubmitting, errors } = form.formState;

  async function onSubmit(values: ProductFormValues) {
    try {
      await apiFetch(
        product ? `/api/products/${product.id}` : "/api/products",
        {
          method: product ? "PATCH" : "POST",
          body: JSON.stringify(values),
        },
      );
      onSaved();
    } catch (err) {
      // error จาก server (เช่น ช่องซ้ำ) แสดงใต้ช่องที่เกี่ยวข้องด้วยระบบเดียวกัน
      if (err instanceof ApiClientError && err.fields) {
        for (const [field, message] of Object.entries(err.fields)) {
          form.setError(field as FieldPath<ProductFormValues>, { message });
        }
      } else {
        form.setError("root", {
          message: err instanceof Error ? err.message : "บันทึกสินค้าไม่สำเร็จ",
        });
      }
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}</DialogTitle>
          <DialogDescription>
            {product
              ? `แก้ไขข้อมูลของ ${product.name}`
              : "กรอกข้อมูลสินค้าที่ต้องการเพิ่มเข้าตู้"}
          </DialogDescription>
        </DialogHeader>

        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormInput
                control={form.control}
                name="name"
                label="ชื่อสินค้า"
                placeholder="เช่น พลาสเตอร์ปิดแผล"
              />
              <FormInput
                control={form.control}
                name="description"
                label="รายละเอียด"
                placeholder="เช่น พลาสเตอร์ปิดแผลกันน้ำ 1 กล่อง 20 ชิ้น"
                textArea
              />
              <FormInput
                control={form.control}
                name="price"
                label="ราคา (บาท)"
                type="number"
                placeholder="เช่น 30"
              />
              <FormInput
                control={form.control}
                name="slot"
                label="ช่องสินค้า (Slot)"
                placeholder="เช่น A01"
                uppercase
              />
              <FormInput
                control={form.control}
                name="stock"
                label="จำนวนสต็อกปัจจุบัน"
                type="number"
                placeholder="เช่น 5"
              />
              <FormInput
                control={form.control}
                name="maxStock"
                label="สต็อกสูงสุด (ความจุของช่อง)"
                type="number"
                placeholder="เช่น 10"
              />
              <FormInput
                control={form.control}
                name="image"
                label="รูปภาพ (URL หรือ path)"
                placeholder="/images/placeholder.svg"
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>หมวดหมู่</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {Object.entries(CATEGORY_LABELS).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormSwitch
                control={form.control as never}
                schema={schema}
                name={"isActive"}
                label="เปิดขายหน้าตู้"
              />

              {errors.root?.message && (
                <p className="text-sm text-destructive">
                  {errors.root.message}
                </p>
              )}

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={onClose}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
