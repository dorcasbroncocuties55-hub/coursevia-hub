import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Creators = () => (
  <div className="min-h-screen bg-background"><Navbar />
    <div className="container-wide section-spacing">
      <h1 className="text-4xl font-bold text-foreground mb-2">Creators</h1>
      <p className="text-muted-foreground mb-8">Discover talented creators sharing their knowledge on Coursevia.</p>
      <p className="text-muted-foreground">Creator profiles will appear here as more creators join the platform.</p>
    </div>
    <Footer />
  </div>
);
export default Creators;
