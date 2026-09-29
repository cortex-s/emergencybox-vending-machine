"use client";
import { Control, Path } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Schema } from "zod";
import { Switch } from "./ui/switch";
import { cn } from "@/lib/utils/cn";

interface Props<T, K> {
  name: Path<T>;
  control: Control<T | any>;
  label?: string;
  description?: string;
  schema?: Schema<T>;
  className?: string;
  disabled?: boolean;
}
export default function FormSwitch<T, K extends keyof T>({
  control,
  name,
  label = "",
  description = "",
  schema,
  className,
  disabled = false,
}: Props<T, K>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("block!", className)}>
          <div className="space-y-0.5">
            <FormLabel>{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className="mb-0"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
