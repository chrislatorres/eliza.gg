export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col size-full shrink-0 relative overflow-hidden">
      {children}
    </div>
  );
}
