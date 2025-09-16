import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from "lucide-react";
import { toast } from 'sonner';

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [activeTab, setActiveTab] = useState<'mvpLogin' | 'mainLogin'>('mainLogin');
  const [showSignUp, setShowSignUp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect them.
    // This logic runs on initial render and when `user` object changes.
    if (user) {
        // Simple redirect for now, could be enhanced to remember last login type
        navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: FormEvent, loginType: 'mvp' | 'main') => {
    e.preventDefault();
    try {
      await signIn(email, password);
      // The useEffect above will handle the redirect once the `user` state is updated.
      // For a more immediate redirect, you could navigate here, but it's cleaner to let the effect handle it.
      toast.success('Login successful!');
      if (loginType === 'mvp') {
          navigate('/mvp/matches');
      } else {
          navigate('/dashboard');
      }
    } catch (error) {
      // Error toast is handled in the signIn function
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    try {
        await signUp(email, password, fullName);
        toast.success('Sign up successful! Please check your email to verify.');
        setShowSignUp(false); // Switch back to login view
    } catch (error) {
      // Error toast is handled in the signUp function
    }
  };

  const LoginForm = ({ loginType }: { loginType: 'mvp' | 'main' }) => (
    <form onSubmit={(e) => handleLogin(e, loginType)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`email-${loginType}`}>Email</Label>
        <Input
          id={`email-${loginType}`}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`password-${loginType}`}>Password</Label>
        <Input
          id={`password-${loginType}`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
      </Button>
    </form>
  );

  const SignUpForm = () => (
    <form onSubmit={handleSignUp} className="space-y-4">
        <h3 className="text-lg font-semibold text-center">Create an Account</h3>
        <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="signupEmail">Email</Label>
            <Input id="signupEmail" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="signupPassword">Password</Label>
            <Input id="signupPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
        </Button>
    </form>
  );

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=1200&q=80')` }} />
      <div className="absolute inset-0 bg-black/60" />
      <Card className="w-full max-w-md z-10 bg-card/90 backdrop-blur-sm border-border/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Football Analytics</CardTitle>
          <CardDescription className="text-center text-card-foreground/80">
            Select your login method
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showSignUp ? (
            <SignUpForm />
          ) : (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'mvpLogin' | 'mainLogin')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mainLogin">Main App Login</TabsTrigger>
                <TabsTrigger value="mvpLogin">MVP Login</TabsTrigger>
              </TabsList>
              <TabsContent value="mainLogin" className="mt-4">
                <LoginForm loginType="main" />
              </TabsContent>
              <TabsContent value="mvpLogin" className="mt-4">
                <LoginForm loginType="mvp" />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-card-foreground/80">
            {showSignUp ? (
                <p>Already have an account? <Button variant="link" className="p-0 h-auto" onClick={() => setShowSignUp(false)}>Log In</Button></p>
            ) : (
                <p>Don't have an account? <Button variant="link" className="p-0 h-auto" onClick={() => setShowSignUp(true)}>Sign Up</Button></p>
            )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
