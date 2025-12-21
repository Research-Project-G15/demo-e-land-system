import { Header } from '@/components/layout/Header';
import { FileText } from 'lucide-react';
import { DeedRegistrationWizard } from '@/components/deeds/DeedRegistrationWizard';
import { useNavigate } from 'react-router-dom';

const DeedsPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Optionally navigate away or reset
    // For now, we can just reload or stay on the page (the wizard handles its own reset or success state)
    // But typically after success, we might want to go to a dashboard or list view.
    // The wizard has a "Close" button on success dialog.
    // Let's just refresh the page state or navigate to dashboard if preferred.
    // For this implementation, we'll just let the user decide what to do next via UI.
    // But the wizard's onSuccess prop is called when "Close" is clicked on success dialog.
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      <main className="container py-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Land & Deed Registration
          </h1>
          <p className="text-muted-foreground">
            Follow the steps to register a new land property and deed.
          </p>
        </div>

        <DeedRegistrationWizard onSuccess={handleSuccess} />
      </main>
    </div>
  );
};

export default DeedsPage;
