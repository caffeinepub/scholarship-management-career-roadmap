import { Button } from "@/components/ui/button";
import { GraduationCap, X } from "lucide-react";
import React from "react";

interface NoScholarshipsFoundProps {
  onClearFilters?: () => void;
}

export default function NoScholarshipsFound({
  onClearFilters,
}: NoScholarshipsFoundProps) {
  return (
    <div
      data-ocid="scholarships.empty_state"
      className="text-center py-20 flex flex-col items-center gap-4"
    >
      <div className="w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center">
        <GraduationCap className="w-10 h-10 text-muted-foreground/50" />
      </div>
      <div className="space-y-1.5">
        <p className="text-lg font-semibold text-foreground">
          No Scholarships Found
        </p>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Try adjusting your filters or search terms to find matching
          scholarships.
        </p>
      </div>
      {onClearFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="mt-2 gap-2"
        >
          <X className="w-3.5 h-3.5" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
