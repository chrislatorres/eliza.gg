export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-dvh size-full pt-14">
      <div className="flex flex-col size-full overflow-hidden">
        <div className="flex grow flex-col size-full shrink-0">{children}</div>
      </div>
    </div>
  );
}
