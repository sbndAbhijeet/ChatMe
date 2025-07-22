import React from 'react';
import { Link } from 'react-router-dom';

const Starter = () => {

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Chat',
      description: '24/7 intelligent conversations with our advanced language model'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Get responses in milliseconds with our optimized infrastructure'
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description: 'End-to-end encryption and data privacy compliance'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'forever',
      features: ['100 messages/month', 'Basic support', 'Standard response speed'],
      cta: 'Get Started'
    },
    {
      name: 'Pro',
      price: '$20',
      period: 'per month',
      features: ['Unlimited messages', 'Priority support', 'Faster responses', 'API access'],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: ['Dedicated instance', 'SLA guarantees', 'Custom models', 'On-premise option'],
      cta: 'Contact Sales'
    }
  ];

  return (
    <div className="bg-[#F2E3BC]/10 min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-[#96BBBB]/20 to-transparent">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-[#414535] mb-6">
            Revolutionize Your Workflow with <span className="text-[#618985]">Lumin AI</span>
          </h1>
          <p className="text-xl text-[#414535]/90 mb-10">
            Our advanced artificial intelligence helps you automate tasks, generate content, 
            and make data-driven decisions faster than ever before.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/chatbot"
              className="px-8 py-3 bg-[#618985] hover:bg-[#96BBBB] text-white rounded-lg font-medium transition-colors"
            >
              Try Live Demo
            </Link>
            <Link 
              to="#pricing" 
              className="px-8 py-3 border border-[#618985] text-[#618985] hover:bg-[#618985]/10 rounded-lg font-medium transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#414535] mb-4">Powerful Features</h2>
          <p className="text-[#414535]/80 max-w-2xl mx-auto">
            Designed to boost your productivity and transform how you work with AI
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-[#618985] mb-2">{feature.title}</h3>
              <p className="text-[#414535]/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-[#96BBBB]/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#414535] mb-4">How Lumin Works</h2>
            <p className="text-[#414535]/80">
              Get started in minutes and experience the power of AI
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="bg-[#618985] text-white rounded-full h-12 w-12 flex items-center justify-center shrink-0">1</div>
              <div>
                <h3 className="text-xl font-semibold text-[#414535] mb-2">Sign Up</h3>
                <p className="text-[#414535]/80">
                  Create your free account in seconds. No credit card required to start.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="bg-[#618985] text-white rounded-full h-12 w-12 flex items-center justify-center shrink-0">2</div>
              <div>
                <h3 className="text-xl font-semibold text-[#414535] mb-2">Choose Your Interface</h3>
                <p className="text-[#414535]/80">
                  Use our web chat, mobile app, or integrate via API into your existing tools.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="bg-[#618985] text-white rounded-full h-12 w-12 flex items-center justify-center shrink-0">3</div>
              <div>
                <h3 className="text-xl font-semibold text-[#414535] mb-2">Start Creating</h3>
                <p className="text-[#414535]/80">
                  Ask questions, generate content, or automate workflows - the possibilities are endless.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#414535] mb-4">Simple, Transparent Pricing</h2>
          <p className="text-[#414535]/80 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Scale up or down as required.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative rounded-xl p-8 border-2 ${plan.popular ? 'border-[#618985] bg-[#F2E3BC]/10' : 'border-transparent bg-white'} shadow-sm hover:shadow-md transition-shadow`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#618985] text-white text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-xl font-semibold text-[#414535] mb-1">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#618985]">{plan.price}</span>
                {plan.period && <span className="text-[#414535]/60">/{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <svg className="h-5 w-5 text-[#618985] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[#414535]/80">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-colors ${
                  plan.popular 
                    ? 'bg-[#618985] hover:bg-[#96BBBB] text-white' 
                    : 'border border-[#618985] text-[#618985] hover:bg-[#618985]/10'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#618985] text-center text-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Workflow?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals already using Lumin to work smarter.
          </p>
          <Link 
            to="/signup" 
            className="inline-block px-8 py-3 bg-white text-[#618985] hover:bg-[#F2E3BC] rounded-lg font-medium transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Starter;