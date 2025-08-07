"use client";

import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle, Github, Linkedin, Loader, Download, Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ImportStep({
  onNext,
}: {
  onNext: (importedData?: any) => void;
}) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [importedStats, setImportedStats] = useState<any>(null);

  // Get available import sources
  const { data: sourcesData, isLoading: sourcesLoading } = useQuery({
    queryKey: ['import-sources'],
    queryFn: async () => {
      const response = await fetch('/api/import-profile');
      if (!response.ok) throw new Error('Failed to get import sources');
      return response.json();
    },
  });

  // Import profile mutation
  const { mutate: importProfile, isPending: isImporting } = useMutation({
    mutationFn: async (provider: string) => {
      const response = await fetch('/api/import-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import profile');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setImportedStats(data.stats);
      toast.success(`Profile imported from ${selectedProvider}! 🎉`);
      
      // Auto-advance after showing success
      setTimeout(() => {
        onNext(data.importedData);
      }, 2000);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to import profile');
      setSelectedProvider(null);
    },
  });

  const handleImport = (provider: string) => {
    setSelectedProvider(provider);
    importProfile(provider);
  };

  const availableSources = sourcesData?.availableSources || {};
  const hasAnySources = availableSources.github || availableSources.linkedin;

  if (sourcesLoading) {
    return (
      <div className="p-8 text-center">
        <Loader className="animate-spin h-8 w-8 mx-auto mb-4 opacity-60" />
        <p className="text-sm text-muted-foreground">Checking connected accounts...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl tracking-tight mb-2 font-semibold">
          Supercharge your profile
        </h2>
        <p className="leading-snug text-sm opacity-80">
          Import your work, projects, and experience automatically
        </p>
      </div>

      <AnimatePresence mode="wait">
        {importedStats ? (
          // Success state
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Profile enhanced! ✨</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                {importedStats.experience > 0 && (
                  <p>• {importedStats.experience} work experience{importedStats.experience !== 1 ? 's' : ''}</p>
                )}
                {importedStats.projects > 0 && (
                  <p>• {importedStats.projects} project{importedStats.projects !== 1 ? 's' : ''}</p>
                )}
                {importedStats.education > 0 && (
                  <p>• {importedStats.education} education entr{importedStats.education !== 1 ? 'ies' : 'y'}</p>
                )}
                {importedStats.socialLinks > 0 && (
                  <p>• {importedStats.socialLinks} social link{importedStats.socialLinks !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
          </motion.div>
        ) : hasAnySources ? (
          // Import options
          <motion.div
            key="options"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {availableSources.github && (
              <Button
                variant="outline"
                className={cn(
                  "w-full h-14 justify-start gap-4 transition-all",
                  selectedProvider === 'github' && isImporting && "border-blue-500 bg-blue-50 dark:bg-blue-950"
                )}
                onClick={() => handleImport('github')}
                disabled={isImporting}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center">
                    <Github className="w-5 h-5 text-white dark:text-gray-900" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Import from GitHub</p>
                    <p className="text-xs text-muted-foreground">
                      Projects, skills, and bio
                    </p>
                  </div>
                </div>
                {selectedProvider === 'github' && isImporting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 opacity-60" />
                )}
              </Button>
            )}

            {availableSources.linkedin && (
              <Button
                variant="outline"
                className={cn(
                  "w-full h-14 justify-start gap-4 transition-all",
                  selectedProvider === 'linkedin' && isImporting && "border-blue-500 bg-blue-50 dark:bg-blue-950"
                )}
                onClick={() => handleImport('linkedin')}
                disabled={isImporting}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Linkedin className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Import from LinkedIn</p>
                    <p className="text-xs text-muted-foreground">
                      Experience, education, and bio
                    </p>
                  </div>
                </div>
                {selectedProvider === 'linkedin' && isImporting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 opacity-60" />
                )}
              </Button>
            )}

            <div className="pt-4">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => onNext()}
                disabled={isImporting}
              >
                Skip for now
              </Button>
            </div>
          </motion.div>
        ) : (
          // No sources available
          <motion.div
            key="no-sources"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-4"
          >
            <p className="text-sm text-muted-foreground mb-4">
              No connected accounts found for importing.
            </p>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                You can connect GitHub or LinkedIn later to import your profile data.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => onNext()}
            >
              Continue
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}