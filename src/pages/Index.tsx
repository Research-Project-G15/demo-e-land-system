import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Button } from '@/components/ui/button';
import { getAllDeeds, getAuditLogs, initializeSampleData } from '@/lib/deedStorage';
import { Deed, AuditLog } from '@/lib/types';
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Plus,
  FileSearch,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const Index = () => {
  const [deeds, setDeeds] = useState<Deed[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeSampleData();
        const allDeeds = await getAllDeeds();
        setDeeds(allDeeds);
        const allLogs = await getAuditLogs();
        setLogs(allLogs);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const activeCount = deeds.filter(d => d.status === 'ACTIVE').length;
  const transferredCount = deeds.filter(d => d.status === 'TRANSFERRED').length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-10">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 rounded-lg border border-border p-8 mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              National Land Registry System
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mb-6">
              The official digital platform for land deed registration, verification, and management 
              under the Ministry of Lands, Government of Sri Lanka.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/deeds">
                <Button variant="outline" size="lg" className="border-primary/30 hover:bg-primary/5">
                  <Plus className="h-5 w-5 mr-2" />
                  Register New Deed
                </Button>
              </Link>
              <Link to="/verify">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <FileSearch className="h-5 w-5 mr-2" />
                  Search Records
                </Button>
              </Link>
            </div>
          </div>

          {/* Notice */}
          <div className="bg-warning/10 border border-warning/30 rounded-md p-4 mb-8">
            <p className="text-sm text-foreground">
              <strong>Notice:</strong> All land deed registrations must be verified in person at your nearest Divisional Secretariat office. 
              Online submissions are subject to verification.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <StatsCard
            title="Total Registered Deeds"
            value={deeds.length}
            description="In the national registry"
            icon={Database}
            variant="default"
          />
          <StatsCard
            title="Active Deeds"
            value={activeCount}
            description="Currently active ownerships"
            icon={CheckCircle2}
            variant="success"
          />
          <StatsCard
            title="Transferred"
            value={transferredCount}
            description="Ownership transferred"
            icon={AlertTriangle}
            variant="warning"
          />
        </div>

        {/* Main Content Grid */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Recent Activity</h2>
          <RecentActivity logs={logs} />
        </div>

        {/* Services Section */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <Database className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Deed Registration</h3>
              <p className="text-sm text-muted-foreground">
                Register new land deeds and property transfers with official government documentation.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <FileSearch className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Record Verification</h3>
              <p className="text-sm text-muted-foreground">
                Verify authenticity of land ownership documents and search the national registry.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <CheckCircle2 className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Ownership Transfer</h3>
              <p className="text-sm text-muted-foreground">
                Process ownership transfers with secure documentation and legal compliance.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 py-10">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Land Registry Department</h4>
              <p className="text-sm text-muted-foreground">
                Ministry of Lands<br />
                Government of Sri Lanka
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact Information</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  +94 11 2329 000
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  info@landregistry.gov.lk
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Colombo, Sri Lanka
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Office Hours</h4>
              <p className="text-sm text-muted-foreground">
                Monday - Friday: 8:30 AM - 4:15 PM<br />
                Saturday - Sunday: Closed<br />
                Public Holidays: Closed
              </p>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
            <p>© 2024 Land Registry Department, Government of Sri Lanka. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
