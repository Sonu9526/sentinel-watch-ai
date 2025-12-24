import { Link } from 'react-router-dom';
import { Shield, Activity, AlertTriangle, Lock, ChevronRight, Cpu, Database, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background grid-pattern overflow-hidden">
      {/* Ambient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 cyber-glow">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <span className="font-mono font-bold text-lg text-foreground">FileGuard AI</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/dashboard">
                  <Activity className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/auth">
                  <Lock className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-sm font-mono slide-up">
            <AlertTriangle className="h-4 w-4" />
            <span>ML-POWERED THREAT DETECTION</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight slide-up" style={{ animationDelay: '0.1s' }}>
            <span className="text-foreground">Advanced</span>
            <br />
            <span className="terminal-text">ML-Based Malware</span>
            <br />
            <span className="text-foreground">Detection System</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto slide-up" style={{ animationDelay: '0.2s' }}>
            Real-time monitoring and ML-based classification of file behavior patterns.
            Detect ransomware-like activity before it causes damage.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center slide-up" style={{ animationDelay: '0.3s' }}>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 cyber-glow">
              <Link to={user ? '/dashboard' : '/auth'}>
                <Shield className="h-5 w-5 mr-2" />
                {user ? 'Access Dashboard' : 'Get Started'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-border hover:bg-secondary">
              <a href="#features">
                <Eye className="h-5 w-5 mr-2" />
                Learn More
              </a>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          {[
            { label: 'Detection Rate', value: '99.4%', icon: Activity },
            { label: 'Avg Response Time', value: '<50ms', icon: Cpu },
            { label: 'Files Monitored', value: '1M+', icon: Database },
            { label: 'Threats Blocked', value: '10K+', icon: Shield },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="cyber-card cyber-border p-6 text-center fade-in"
              style={{ animationDelay: `${0.4 + i * 0.1}s` }}
            >
              <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold font-mono text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Core Capabilities</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powered by machine learning algorithms trained on real-world ransomware behavior patterns.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Behavioral Analysis',
              description: 'Monitor file modification rates, entropy changes, and rename patterns in real-time.',
              icon: Activity,
              color: 'primary',
            },
            {
              title: 'ML Classification',
              description: 'Random Forest model trained on ransomware signatures for accurate threat detection.',
              icon: Cpu,
              color: 'accent',
            },
            {
              title: 'Instant Alerts',
              description: 'Receive immediate notifications when suspicious activity is detected.',
              icon: AlertTriangle,
              color: 'destructive',
            },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="cyber-card cyber-border p-8 hover:border-primary/50 transition-all duration-300 fade-in"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className={`p-3 rounded-lg bg-${feature.color}/10 w-fit mb-4`}>
                <feature.icon className={`h-8 w-8 text-${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2024 Ransomware Detection System. Academic MCA Project Demo.</p>
          <p className="mt-2">Uses simulated data for demonstration purposes.</p>
        </div>
      </footer>
    </div>
  );
}
