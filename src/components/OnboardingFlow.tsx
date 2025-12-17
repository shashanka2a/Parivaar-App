'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TreePine, Mail, User, Users2, UserCircle2, Lock, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { AppState } from '@/lib/state-context';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface Props {
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export default function OnboardingFlow({ setAppState }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<'auth' | 'familyName' | 'ancestor'>('auth');
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [familyName, setFamilyName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === 'signup') {
        if (!email || !password || !name || !contact) return;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });

        if (error) {
          toast.error(error.message || 'Failed to sign up. Please try again.');
          return;
        }

        const user = data.user;
        const userName = user?.user_metadata?.name || name || user?.email?.split('@')[0] || '';
        const userEmail = user?.email || email;

        setAppState(prev => ({
          ...prev,
          user: { name: userName, email: userEmail },
        }));

        toast.success('Account created successfully');
        setStep('familyName');
      } else {
        if (!email || !password) return;

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message || 'Failed to log in. Please check your credentials.');
          return;
        }

        const user = data.user;
        const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
        const userEmail = user?.email || email;

        setAppState(prev => ({
          ...prev,
          user: { name: userName, email: userEmail },
        }));

        toast.success('Logged in successfully');
        setStep('familyName');
      }
    } catch (err: any) {
      console.error('Onboarding auth error:', err);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleFamilyNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (familyName) {
      setAppState(prev => ({
        ...prev,
        familyName: familyName,
      }));
      setStep('ancestor');
    }
  };

  const handleSelectAncestor = (type: 'self' | 'parent' | 'grandparent') => {
    localStorage.setItem('parivaar_onboarded', 'true');
    router.push('/trees');
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="p-2.5 bg-[#4CAF50]/10 rounded-2xl shadow-md">
            <TreePine className="size-10 text-[#3D5A3A]" />
          </div>
          <span className="text-2xl text-[#2C3E2A]">Parivaar</span>
        </div>

        {step === 'auth' ? (
          <Card className="p-8 bg-white shadow-xl border-[#D9D5CE]/30">
            <h2 className="text-3xl mb-2 text-center text-[#2C3E2A]">
              {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-[#5A6B57] text-center mb-8">
              {mode === 'signup' 
                ? 'Start building your family tree today'
                : 'Log in to continue your family tree'}
            </p>

            {/* Mode Toggle */}
            <div className="flex gap-2 p-1 bg-[#F5F3EF] rounded-lg mb-6">
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2.5 px-4 rounded-md transition-all text-center ${
                  mode === 'signup'
                    ? 'bg-white text-[#2C3E2A] shadow-sm'
                    : 'text-[#5A6B57] hover:text-[#2C3E2A]'
                }`}
                style={{ fontWeight: 600 }}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 px-4 rounded-md transition-all text-center ${
                  mode === 'login'
                    ? 'bg-white text-[#2C3E2A] shadow-sm'
                    : 'text-[#5A6B57] hover:text-[#2C3E2A]'
                }`}
                style={{ fontWeight: 600 }}
              >
                Login
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuth} className="space-y-5">
              {mode === 'signup' && (
                <div>
                  <Label htmlFor="name" className="text-[#2C3E2A] mb-2">Full Name</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#5A6B57]" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-12 bg-white border-[#D9D5CE] text-[#2C3E2A]"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="email" className="text-[#2C3E2A] mb-2">Email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#5A6B57]" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-white border-[#D9D5CE] text-[#2C3E2A]"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-[#2C3E2A] mb-2">Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#5A6B57]" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-white border-[#D9D5CE] text-[#2C3E2A]"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <Label htmlFor="contact" className="text-[#2C3E2A] mb-2">Contact Number</Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#5A6B57]" />
                    <Input
                      id="contact"
                      type="tel"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="pl-10 h-12 bg-white border-[#D9D5CE] text-[#2C3E2A]"
                      placeholder="Enter your contact number"
                      required
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-[#2C3E2A] hover:bg-[#1F2D1D] text-white h-12 shadow-lg mt-6" 
                size="lg"
              >
                {mode === 'signup' ? 'Create Account' : 'Login'}
              </Button>
            </form>

            <p className="text-center text-sm text-[#5A6B57] mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </Card>
        ) : step === 'familyName' ? (
          <Card className="p-8 bg-white shadow-xl border-[#D9D5CE]/30">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-[#4CAF50]/10 rounded-full">
                <UserCircle2 className="size-8 text-[#3D5A3A]" />
              </div>
            </div>
            <h2 className="text-3xl mb-2 text-center text-[#2C3E2A]">What's Your Family Name?</h2>
            <p className="text-[#5A6B57] text-center mb-8">
              This will help personalize your family tree
            </p>

            <form onSubmit={handleFamilyNameSubmit} className="space-y-6">
              <div>
                <Label htmlFor="familyName" className="text-[#2C3E2A] mb-2">Family Name</Label>
                <div className="relative mt-2">
                  <Input
                    id="familyName"
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className="h-12 bg-white text-center text-lg border-[#D9D5CE] text-[#2C3E2A]"
                    placeholder="e.g., Kumar, Smith, Garcia"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#2C3E2A] hover:bg-[#1F2D1D] text-white h-12 shadow-lg" size="lg">
                Continue
              </Button>
              <Button
                type="button"
                onClick={() => setStep('auth')}
                variant="ghost"
                className="w-full h-12 text-[#2C3E2A] hover:bg-[#F5F3EF]"
              >
                Back
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="p-8 bg-white shadow-xl border-[#D9D5CE]/30">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-[#4CAF50]/10 rounded-full">
                <Users2 className="size-8 text-[#3D5A3A]" />
              </div>
            </div>
            <h2 className="text-3xl mb-2 text-center text-[#2C3E2A]">Choose Your Starting Point</h2>
            <p className="text-[#5A6B57] text-center mb-8">
              Who would you like to start the {familyName} family tree with?
            </p>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectAncestor('self')}
                className="w-full p-6 rounded-xl border-2 border-[#D9D5CE] hover:border-[#4CAF50] hover:bg-[#4CAF50]/5 transition-all text-left group shadow-sm hover:shadow-md bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[#F5F3EF] group-hover:bg-[#4CAF50]/15 transition-colors">
                    <UserCircle2 className="size-6 text-[#3D5A3A] group-hover:text-[#4CAF50] transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-xl mb-2 text-[#2C3E2A]">Start with Myself</h3>
                    <p className="text-[#5A6B57] text-sm">
                      Begin your tree with yourself and add your ancestors and descendants
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectAncestor('parent')}
                className="w-full p-6 rounded-xl border-2 border-[#D9D5CE] hover:border-[#4CAF50] hover:bg-[#4CAF50]/5 transition-all text-left group shadow-sm hover:shadow-md bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[#F5F3EF] group-hover:bg-[#4CAF50]/15 transition-colors">
                    <User className="size-6 text-[#3D5A3A] group-hover:text-[#4CAF50] transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-xl mb-2 text-[#2C3E2A]">Start with a Parent</h3>
                    <p className="text-[#5A6B57] text-sm">
                      Begin with your mother or father and expand from there
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectAncestor('grandparent')}
                className="w-full p-6 rounded-xl border-2 border-[#D9D5CE] hover:border-[#4CAF50] hover:bg-[#4CAF50]/5 transition-all text-left group shadow-sm hover:shadow-md bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[#F5F3EF] group-hover:bg-[#4CAF50]/15 transition-colors">
                    <Users2 className="size-6 text-[#3D5A3A] group-hover:text-[#4CAF50] transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-xl mb-2 text-[#2C3E2A]">Start with a Grandparent</h3>
                    <p className="text-[#5A6B57] text-sm">
                      Start with a grandparent to trace multiple generations
                    </p>
                  </div>
                </div>
              </motion.button>
            </div>

            <Button
              onClick={() => setStep('familyName')}
              variant="ghost"
              className="w-full mt-6 h-12 text-[#2C3E2A] hover:bg-[#F5F3EF]"
            >
              Back
            </Button>
          </Card>
        )}
      </motion.div>
    </div>
  );
}