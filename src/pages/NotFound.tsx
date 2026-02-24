import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Home, Mail, BookOpen, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <SEOHead title="Page Not Found" description="The page you're looking for doesn't exist. Browse our blog, contact us, or return to the homepage." path={location.pathname} />
      <div className="text-center max-w-md">
        <p className="text-8xl font-display font-bold text-primary/20 mb-2">404</p>
        <h1 className="text-2xl font-display font-bold text-primary mb-3">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          Sorry, the page <span className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">{location.pathname}</span> doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-primary text-primary-foreground">
            <Link to="/"><Home className="w-4 h-4 mr-2" /> Homepage</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contact"><Mail className="w-4 h-4 mr-2" /> Contact Us</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/blog"><BookOpen className="w-4 h-4 mr-2" /> Blog</Link>
          </Button>
        </div>
        <button onClick={() => window.history.back()} className="mt-6 text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mx-auto transition-colors">
          <ArrowLeft className="w-3 h-3" /> Go back
        </button>
      </div>
    </div>
  );
};

export default NotFound;
