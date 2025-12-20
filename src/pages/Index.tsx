import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SystemDiagram } from '@/components/dashboard/SystemDiagram';
import { Button } from '@/components/ui/button';
import { getAllDeeds, initializeSampleData } from '@/lib/deedStorage';
import { StoredDeed } from '@/lib/hashUtils';
import { 
  Database, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Plus,
  FileSearch
} from 'lucide-react';

const Index = () => {
  const [deeds, setDeeds] = useState<StoredDeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await initializeSampleData();
      setDeeds(getAllDeeds());
      setIsLoading(false);
    };
    loadData();
  }, []);

  const verifiedCount = deeds.filter(d => d.isVerified === true).length;
  const tamperedCount = deeds.filter(d => d.isVerified === false).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Hero Section */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Blockchain-Based Land Deed Verification
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Secure, transparent, and tamper-proof land registry system using cryptographic 
                hashing for data integrity verification.
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/deeds">
                <Button variant="outline" size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Register Deed
                </Button>
              </Link>
              <Link to="/verify">
                <Button variant="hero" size="lg">
                  <FileSearch className="h-5 w-5 mr-2" />
                  Verify Deed
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatsCard
            title="Total Deeds"
            value={deeds.length}
            description="Registered in system"
            icon={Database}
            variant="default"
          />
          <StatsCard
            title="Verified"
            value={verifiedCount}
            description="Data integrity confirmed"
            icon={CheckCircle2}
            variant="success"
          />
          <StatsCard
            title="Tampered"
            value={tamperedCount}
            description="Data modification detected"
            icon={AlertTriangle}
            variant="danger"
          />
          <StatsCard
            title="On-Chain Records"
            value={deeds.length}
            description="Hashes stored immutably"
            icon={Shield}
            variant="default"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SystemDiagram />
          </div>
          <div>
            <RecentActivity deeds={deeds} />
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-10 rounded-xl border border-border bg-card p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
            How Data Integrity Verification Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                <span className="font-display text-2xl font-bold">1</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Register Deed
              </h3>
              <p className="text-sm text-muted-foreground">
                Enter deed details into the off-chain database. The system generates a unique 
                SHA-256 hash from all data fields.
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent mx-auto mb-4">
                <span className="font-display text-2xl font-bold">2</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Store Hash On-Chain
              </h3>
              <p className="text-sm text-muted-foreground">
                The hash is stored on the blockchain (immutable). Only the hash goes on-chain, 
                keeping sensitive data private off-chain.
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success mx-auto mb-4">
                <span className="font-display text-2xl font-bold">3</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Verify Integrity
              </h3>
              <p className="text-sm text-muted-foreground">
                Re-compute hash from current data and compare with on-chain hash. Any mismatch 
                proves data tampering.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            Land Deed Verification System — Research Prototype for Blockchain-Based Registry
          </p>
          <p className="mt-1">
            Demonstrating off-chain data with on-chain hash verification for tamper detection
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
