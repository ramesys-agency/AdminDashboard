import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";

interface EntityFormProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  success?: boolean;
  backUrl: string;
  submitLabel?: string;
}

export function EntityForm({
  title,
  description,
  children,
  onSubmit,
  loading,
  success,
  backUrl,
  submitLabel = "Save Changes",
}: EntityFormProps) {
  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-20 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Success!</h2>
          <p className="text-muted-foreground text-lg">
            Record has been created successfully. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Fixed Back Button Position */}
      <div className="mb-6 flex items-center">
        <Link 
          href={backUrl} 
          className="group text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-all"
        >
          <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center group-hover:bg-muted transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </div>
          Back to list
        </Link>
      </div>

      <PageHeader
        title={title}
        description={description}
      />

      <Card className="mt-8 border-none shadow-2xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-slate-900/50 backdrop-blur-md overflow-hidden ring-1 ring-gray-100 dark:ring-white/10">
        <CardContent className="p-8">
          <form onSubmit={onSubmit} className="space-y-8">
            <div className="grid gap-8">
              {children}
            </div>
            
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-border/50">
              <Link href={backUrl}>
                <Button type="button" variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={loading} 
                className="px-10 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all active:scale-95 shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : submitLabel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
