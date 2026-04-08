import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="space-y-2">
        <h2 className="text-5xl font-bold text-muted-foreground/30">404</h2>
        <h3 className="text-xl font-semibold">Page or record not found</h3>
        <p className="text-muted-foreground text-sm">
          The item you&apos;re looking for doesn&apos;t exist or may have been deleted.
        </p>
      </div>
      <Link href="/">
        <Button variant="outline">Go back home</Button>
      </Link>
    </div>
  );
}
