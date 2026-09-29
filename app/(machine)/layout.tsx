import { MachineShell } from "@/components/vending/machine-shell";

export default function MachineLayout({ children }: { children: React.ReactNode }) {
  return <MachineShell>{children}</MachineShell>;
}
