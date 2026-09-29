import { PrismaClient, Category } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_MACHINE_CASH } from "../lib/utils/cash";

const prisma = new PrismaClient();

type SeedProduct = {
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  maxStock: number;
  slot: string;
  category: Category;
};

const products: SeedProduct[] = [
  {
    name: "พลาสเตอร์ปิดแผล",
    description: "พลาสเตอร์ปิดแผลกันน้ำ 1 กล่อง 20 ชิ้น",
    price: 30,
    image: "/images/plaster.jpeg",
    stock: 3,
    maxStock: 10,
    slot: "A01",
    category: "FIRST_AID",
  },
  {
    name: "ผ้าก๊อซ",
    description: "ผ้าก๊อซปลอดเชื้อ สำหรับปิดแผลเล็กน้อย",
    price: 40,
    image: "/images/gauze.jpeg",
    stock: 6,
    maxStock: 10,
    slot: "A02",
    category: "FIRST_AID",
  },
  {
    name: "สำลีก้าน",
    description: "สำลีก้าน 100 ก้าน ใช้ทำความสะอาดแผล",
    price: 25,
    image: "/images/cotton-swabs.jpeg",
    stock: 8,
    maxStock: 10,
    slot: "A03",
    category: "FIRST_AID",
  },
  {
    name: "เทปพันแผล",
    description: "เทปแต่งแผลทางการแพทย์ ระบายอากาศได้ ม้วนยาว 5 เมตร",
    price: 35,
    image: "/images/wound-tape.jpeg",
    stock: 4,
    maxStock: 10,
    slot: "A04",
    category: "FIRST_AID",
  },
  {
    name: "ร่มพับ",
    description: "ร่มพับ 3 ตอน ขนาดกะทัดรัด โครงทนลม",
    price: 150,
    image: "/images/umbrella.jpeg",
    stock: 5,
    maxStock: 10,
    slot: "B01",
    category: "RAIN",
  },
  {
    name: "เสื้อกันฝน",
    description: "เสื้อกันฝนแบบใช้แล้วทิ้ง ฟรีไซซ์",
    price: 60,
    image: "/images/raincoat.jpeg",
    stock: 7,
    maxStock: 10,
    slot: "B02",
    category: "RAIN",
  },
  {
    name: "ถุงกันน้ำ",
    description: "ซองกันน้ำแบบซีล สำหรับมือถือและเอกสาร",
    price: 90,
    image: "/images/waterproof-bag.jpeg",
    stock: 4,
    maxStock: 8,
    slot: "B03",
    category: "RAIN",
  },
  {
    name: "ถุงพลาสติก",
    description: "ถุงพลาสติกหนาพิเศษ 50 ใบ ใช้กันของเปียก",
    price: 15,
    image: "/images/plastic-bag.jpeg",
    stock: 10,
    maxStock: 15,
    slot: "B04",
    category: "RAIN",
  },
  {
    name: "หน้ากากอนามัย",
    description: "หน้ากากอนามัย 3 ชั้น แบบใช้แล้วทิ้ง 20 ชิ้น",
    price: 50,
    image: "/images/face-mask.jpeg",
    stock: 8,
    maxStock: 15,
    slot: "C01",
    category: "HYGIENE",
  },
  {
    name: "ทิชชู่",
    description: "ทิชชู่พกพา 2 ชั้น นุ่ม",
    price: 15,
    image: "/images/tissue.jpeg",
    stock: 9,
    maxStock: 15,
    slot: "C02",
    category: "HYGIENE",
  },
  {
    name: "ทิชชู่เปียก",
    description: "ทิชชู่เปียกไม่มีแอลกอฮอล์ 20 แผ่น",
    price: 30,
    image: "/images/wet-wipes.jpeg",
    stock: 6,
    maxStock: 10,
    slot: "C03",
    category: "HYGIENE",
  },
  {
    name: "เจลล้างมือ",
    description: "เจลแอลกอฮอล์ 75% ขวดพกพา 60 มล.",
    price: 35,
    image: "/images/hand-sanitizer.jpeg",
    stock: 5,
    maxStock: 10,
    slot: "C04",
    category: "HYGIENE",
  },
  {
    name: "สายชาร์จ USB-C",
    description: "สายชาร์จและส่งข้อมูล USB-C ยาว 1 เมตร",
    price: 120,
    image: "/images/usb-c-cable.jpeg",
    stock: 2,
    maxStock: 8,
    slot: "D01",
    category: "ELECTRONICS",
  },
  {
    name: "สายชาร์จ Lightning",
    description: "สายชาร์จ Lightning ยาว 1 เมตร",
    price: 120,
    image: "/images/charging-cable.jpeg",
    stock: 3,
    maxStock: 8,
    slot: "D02",
    category: "ELECTRONICS",
  },
  {
    name: "ถ่านไฟฉาย AA/AAA",
    description: "ถ่านอัลคาไลน์ 4 ก้อน (AA/AAA คละ)",
    price: 60,
    image: "/images/batteries.jpeg",
    stock: 7,
    maxStock: 12,
    slot: "D03",
    category: "ELECTRONICS",
  },
  {
    name: "หูฟัง",
    description: "หูฟังแบบมีสาย แจ็ก 3.5 มม. พร้อมไมค์",
    price: 150,
    image: "/images/earphones.jpeg",
    stock: 4,
    maxStock: 8,
    slot: "D04",
    category: "ELECTRONICS",
  },
];

async function main() {
  console.log("Seeding products...");
  for (const product of products) {
    await prisma.product.upsert({
      where: { slot: product.slot },
      update: product,
      create: product,
    });
  }

  console.log("Seeding machine cash (change stock)...");
  for (const [denomination, count] of Object.entries(DEFAULT_MACHINE_CASH)) {
    await prisma.machineCash.upsert({
      where: { denomination: Number(denomination) },
      update: {},
      create: { denomination: Number(denomination), count },
    });
  }

  console.log("Seeding admin account...");
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminAccount.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: adminPasswordHash,
    },
  });

  console.log("Seed complete.");
  console.log(`Admin: admin / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
