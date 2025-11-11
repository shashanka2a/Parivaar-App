'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { TreePine, Users, Share2, FileText, Lock, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: TreePine,
      title: 'Interactive Family Tree',
      description: 'Build your family tree with an intuitive drag-and-drop interface',
    },
    {
      icon: Users,
      title: 'Collaborative',
      description: 'Invite family members to contribute and share memories together',
    },
    {
      icon: Share2,
      title: 'Easy Sharing',
      description: 'Export and share your family history in multiple formats',
    },
    {
      icon: FileText,
      title: 'Rich Profiles',
      description: 'Add photos, documents, timelines and stories to each person',
    },
    {
      icon: Lock,
      title: 'Privacy Control',
      description: 'Manage who can view and edit your family tree',
    },
    {
      icon: Sparkles,
      title: 'Beautiful Themes',
      description: 'Customize your tree with elegant themes and layouts',
    },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      text: 'Parivaar helped me connect with relatives I never knew existed. The interface is so intuitive!',
    },
    {
      name: 'Rajesh Kumar',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      text: 'Finally, a family tree app that my entire family can use together. Love the collaborative features!',
    },
    {
      name: 'Anita Desai',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      text: 'Preserving our family history has never been easier. The timeline feature is fantastic!',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TreePine className="size-8 text-emerald-600" />
            <span className="text-xl">Parivaar</span>
          </div>
          <Button onClick={() => router.push('/onboarding')} variant="outline">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl lg:text-6xl mb-6">
              Build Your Family Tree,
              <span className="text-emerald-600"> Preserve Your Legacy</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect generations, share stories, and discover your family history with Parivaar's beautiful and intuitive family tree builder.
            </p>
            <Button 
              onClick={() => router.push('/onboarding')}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Create My Tree
              <ChevronRight className="ml-2 size-5" />
            </Button>
          </motion.div>

          {/* Demo Tree Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="flex flex-col items-center gap-6">
                {/* Grandparents */}
                <div className="flex gap-4">
                  <TreeNodePreview name="Ravi" />
                  <TreeNodePreview name="Lakshmi" />
                </div>
                {/* Connection Lines */}
                <div className="w-px h-8 bg-gray-300" />
                {/* Parent */}
                <TreeNodePreview name="Amit" highlight />
                {/* Connection Lines */}
                <div className="w-px h-8 bg-gray-300" />
                {/* Children */}
                <div className="flex gap-4">
                  <TreeNodePreview name="Priya" />
                  <TreeNodePreview name="Rohan" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl mb-4">Everything You Need to Build Your Family Story</h2>
          <p className="text-xl text-gray-600">
            Powerful features designed for preserving family history
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow bg-white border-gray-100">
                <feature.icon className="size-10 text-emerald-600 mb-4" />
                <h3 className="text-xl mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl mb-4">Loved by Families Worldwide</h2>
            <p className="text-xl text-gray-600">
              See what our users have to say
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="p-6 bg-[#F8FAFC] border-gray-100">
                  <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="size-12 rounded-full object-cover"
                    />
                    <div>
                      <p>{testimonial.name}</p>
                      <p className="text-sm text-gray-500">Parivaar User</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-12 text-center text-white"
        >
          <h2 className="text-4xl mb-4">Start Building Your Family Tree Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of families preserving their heritage
          </p>
          <Button 
            onClick={() => router.push('/onboarding')}
            size="lg"
            variant="secondary"
          >
            Get Started Free
            <ChevronRight className="ml-2 size-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TreePine className="size-6 text-emerald-500" />
                <span className="text-white">Parivaar</span>
              </div>
              <p className="text-sm">
                Building family connections, one tree at a time.
              </p>
            </div>
            <div>
              <h4 className="text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>Features</li>
                <li>Pricing</li>
                <li>Templates</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 Parivaar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TreeNodePreview({ name, highlight }: { name: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${highlight ? 'bg-emerald-100 border-2 border-emerald-500' : 'bg-gray-50 border border-gray-200'} min-w-[100px] text-center transition-all`}>
      <div className="size-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full mx-auto mb-2" />
      <p className="text-sm">{name}</p>
    </div>
  );
}
