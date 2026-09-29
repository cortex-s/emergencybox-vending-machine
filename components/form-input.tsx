"use client";

import type { HTMLInputTypeAttribute } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";

interface Props<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  textArea?: boolean;
  uppercase?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function FormInput<T extends FieldValues>({
  label,
  name,
  control,
  placeholder,
  type = "text",
  textArea = false,
  uppercase = false,
  className,
  disabled,
}: Props<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("w-full", className)}>
          <FormLabel className="block">
            {label}
            <FormMessage className="ml-2 inline text-xs" />
          </FormLabel>
          <FormControl>
            {textArea ? (
              <Textarea
                placeholder={placeholder?.trim()}
                {...field}
                value={field.value ?? ""}
                className="max-h-32"
                disabled={disabled}
              />
            ) : (
              <Input
                placeholder={placeholder?.trim()}
                {...field}
                value={field.value ?? ""}
                type={type}
                disabled={disabled}
                onChange={(e) => field.onChange(uppercase ? e.target.value.toUpperCase() : e.target.value)}
              />
            )}
          </FormControl>
        </FormItem>
      )}
    />
  );
}
