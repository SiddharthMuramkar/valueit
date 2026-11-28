import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="grid min-h-svh place-items-center p-6">
      <Card className="w-full max-w-xl">
        <span aria-hidden="true" className="h-2 w-12 bg-primary" />
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            ValueIt
          </h1>
          <p className="text-lg text-muted-foreground">
            A guided course in finance.
          </p>
        </div>
      </Card>
    </main>
  );
}
