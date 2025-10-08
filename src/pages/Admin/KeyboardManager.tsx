import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Keyboard } from 'lucide-react';

const KeyboardManager = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Keyboard className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Keyboard Manager</h1>
          <p className="text-muted-foreground">Manage keyboard shortcuts and hotkeys</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
          <CardDescription>Configure keyboard shortcuts for various actions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Keyboard manager configuration coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyboardManager;
