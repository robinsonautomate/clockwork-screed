"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  HardHat,
  Inbox,
  Loader2,
  ReceiptText,
  Users,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { getSearchIndex, type SearchItem } from "@/lib/actions/search";

const TYPE_ICON = {
  Contact: Users,
  Enquiry: Inbox,
  Quote: FileText,
  Job: HardHat,
  Invoice: ReceiptText,
} as const;

const GROUP_ORDER: SearchItem["type"][] = [
  "Job",
  "Quote",
  "Enquiry",
  "Contact",
  "Invoice",
];

export const OPEN_SEARCH_EVENT = "cws:open-search";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SearchItem[] | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open && items === null) {
      getSearchIndex()
        .then(setItems)
        .catch(() => setItems([]));
    }
  }, [open, items]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Jump to any job, quote, enquiry, contact or invoice."
    >
      <Command shouldFilter={items !== null}>
        <CommandInput placeholder="Search jobs, quotes, enquiries, contacts…" />
        <CommandList>
          {items === null ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : (
            <>
              <CommandEmpty>No matches found.</CommandEmpty>
              {GROUP_ORDER.map((type) => {
                const group = items.filter((i) => i.type === type);
                if (group.length === 0) return null;
                const Icon = TYPE_ICON[type];
                return (
                  <CommandGroup key={type} heading={`${type}s`}>
                    {group.map((item) => (
                      <CommandItem
                        key={item.href}
                        value={`${item.label} ${item.keywords}`}
                        onSelect={() => go(item.href)}
                      >
                        <Icon className="text-muted-foreground" />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate font-medium">
                            {item.label}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {item.sublabel}
                          </span>
                        </span>
                        <CommandShortcut>{item.type}</CommandShortcut>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
