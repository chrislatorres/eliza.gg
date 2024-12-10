export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex grow flex-col size-full shrink-0">{children}</div>
  );
}
