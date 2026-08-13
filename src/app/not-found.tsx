import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold gradient-text">404</h1>
      <p className="mt-4 text-xl font-medium">Page Not Found</p>
      <p className="mt-2 text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <Link href="/" className={cn(buttonVariants(), "mt-6 rounded-full")}>Go Home</Link>
    </div>
  );
}
