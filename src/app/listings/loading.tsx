import { Loader2 } from "lucide-react";

export default function ListingsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">İlanlar yükleniyor...</p>
        </div>
      </div>
    </div>
  );
}