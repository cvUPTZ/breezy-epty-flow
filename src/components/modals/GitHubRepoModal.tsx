import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github } from 'lucide-react';

interface GitHubRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVisualize: (repoUrl: string) => void;
}

export const GitHubRepoModal: React.FC<GitHubRepoModalProps> = ({ isOpen, onClose, onVisualize }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState('');

  const handleVisualizeClick = () => {
    // Basic validation
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL.');
      return;
    }
    // More specific validation could be added here
    if (!repoUrl.includes('github.com')) {
        setError('Please enter a valid GitHub repository URL.');
        return;
    }
    setError('');
    onVisualize(repoUrl);
  };

  const handleClose = () => {
    setRepoUrl('');
    setError('');
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Github className="w-5 h-5 mr-2" />
            Visualize GitHub Repository
          </DialogTitle>
          <DialogDescription>
            Enter the URL of a public GitHub repository to visualize its structure.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="github-url"
              placeholder="e.g., https://github.com/facebook/react"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="col-span-4 bg-gray-800 border-gray-600 focus:ring-cyan-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm col-span-4">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="border-gray-600 hover:bg-gray-700">
            Cancel
          </Button>
          <Button onClick={handleVisualizeClick} className="bg-cyan-600 hover:bg-cyan-700">
            Visualize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
