import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BlockchainRegistry } from '@/components/blockchain/BlockchainRegistry';
import { getAllDeeds, initializeSampleData } from '@/lib/deedStorage';
import { getAllOnChainRecords } from '@/lib/hashUtils';
import { Link2, Shield, Database, Hash, Lock } from 'lucide-react';

const BlockchainPage = () => {
  const [recordCount, setRecordCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      await initializeSampleData();
      getAllDeeds(); // Ensure deeds are loaded (which populates on-chain registry)
      setRecordCount(getAllOnChainRecords().length);
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg">
              <Link2 className="h-7 w-7" />
            </div>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            On-Chain Registry
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simulated blockchain ledger containing immutable deed hashes. 
            Each record represents a block with the deed's unique fingerprint.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <Database className="h-8 w-8 mx-auto mb-3 text-primary" />
            <p className="font-display text-3xl font-bold text-foreground">{recordCount}</p>
            <p className="text-sm text-muted-foreground">Total Blocks</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <Hash className="h-8 w-8 mx-auto mb-3 text-accent" />
            <p className="font-display text-3xl font-bold text-foreground">SHA-256</p>
            <p className="text-sm text-muted-foreground">Hash Algorithm</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <Lock className="h-8 w-8 mx-auto mb-3 text-success" />
            <p className="font-display text-3xl font-bold text-foreground">Immutable</p>
            <p className="text-sm text-muted-foreground">Data Integrity</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-8 p-6 rounded-xl border border-accent/30 bg-accent/5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                Simulated Blockchain Environment
              </h3>
              <p className="text-sm text-muted-foreground">
                This is a demonstration of on-chain hash storage. In a production system, 
                these hashes would be stored on a real blockchain (e.g., Hyperledger Fabric) 
                making them immutable and tamper-proof. The off-chain database stores the 
                actual deed data, while only the cryptographic hash is stored on-chain.
              </p>
            </div>
          </div>
        </div>

        {/* Blockchain Registry */}
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Blockchain Ledger
          </h2>
          <BlockchainRegistry />
        </div>

        {/* Technical Explanation */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">
              What is Stored On-Chain?
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
                <span><strong>Deed ID:</strong> Unique identifier for each deed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
                <span><strong>Hash:</strong> SHA-256 fingerprint of all deed data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
                <span><strong>Timestamp:</strong> When the hash was recorded</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
                <span><strong>Block Number:</strong> Sequential block reference</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">
              What Stays Off-Chain?
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Owner personal information (name, NIC)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Land location and extent details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Transaction history and previous owners</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Survey plans and supporting documents</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground border-t border-border pt-4">
              This hybrid approach ensures PDPA compliance by keeping personal data 
              off-chain while maintaining verification capability through on-chain hashes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlockchainPage;
