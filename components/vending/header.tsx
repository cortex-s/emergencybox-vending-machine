export function VendingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">EmergencyBox</h1>
          <p className="text-sm text-muted-foreground">ของจำเป็น เมื่อคุณต้องการมันที่สุด</p>
        </div>
      </div>
    </header>
  );
}
