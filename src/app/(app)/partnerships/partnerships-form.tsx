"use client";

import { Button } from "@/components/ui/button";
import { Field, Label } from "@/components/ui/fieldset";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { submitPartnership } from "./actions";

type Category =
  | "Infrastructure"
  | "DeFi"
  | "L1/L2"
  | "Gaming"
  | "Community"
  | "Ecosystem"
  | "NFT"
  | "Web2";

const CATEGORIES: Category[] = [
  "Infrastructure",
  "DeFi",
  "L1/L2",
  "Gaming",
  "Community",
  "Ecosystem",
  "NFT",
  "Web2",
];

export function PartnershipsForm() {
  async function handleSubmit(formData: FormData) {
    const result = await submitPartnership(formData);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Partnership request submitted successfully!");
    const form = document.getElementById("partnership-form") as HTMLFormElement;
    form.reset();
  }

  return (
    <main className="flex flex-col min-h-dvh">
      <div className="flex-1 relative mx-auto w-full">
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="w-full max-w-2xl px-4 py-8 md:px-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Partnership Program</h1>
              <p className="text-muted-foreground">
                Submit your partnership or collaboration request for the Eliza
                ecosystem.
              </p>
            </div>

            <form
              id="partnership-form"
              action={handleSubmit}
              className="space-y-6"
            >
              <Field>
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your organization name"
                  required
                />
              </Field>

              <Field>
                <Label htmlFor="category">Category</Label>
                <Select name="category" id="category" required defaultValue="">
                  <option value="" disabled>
                    Select a category
                  </option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field>
                <Label htmlFor="interests">Partnership Interests</Label>
                <Textarea
                  id="interests"
                  name="interests"
                  placeholder="Describe your partnership interests and goals"
                  required
                  rows={4}
                />
              </Field>

              <Field>
                <Label htmlFor="contactInfo">Contact Information</Label>
                <Input
                  id="contactInfo"
                  name="contactInfo"
                  placeholder="Email or other contact information"
                  required
                />
              </Field>

              <Button type="submit" color="orange" className="w-full !py-2">
                Submit Partnership Request
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
