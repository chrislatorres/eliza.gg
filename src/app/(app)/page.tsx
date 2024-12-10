import { TextareaWithActions } from "@/components/app/textarea-with-actions";
import { Logo } from "@/components/ui/logo";

export const experimental_ppr = true;

export default function Page() {
  return (
    <main className="flex-1 size-full overflow-hidden flex flex-col divide-y divide-zinc-950/5 justify-center items-center gap-8">
      <Logo width={48} height={48} />
      <h1 className="text-3xl font-semibold text-center tracking-tight">
        Ask anything about Eliza
      </h1>
      <div className="max-w-xl mx-auto w-full">
        <TextareaWithActions />
      </div>
    </main>
  );
}
