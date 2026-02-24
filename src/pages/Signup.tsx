import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import logoHorizontal from "@/assets/rideline-logo-horizontal.png";

const Signup = () => (
  <>
    <SEOHead
      title="Get Started | RideLine"
      description="Transform your district's school transportation with RideLine."
      path="/signup"
    />
    <div
      className="flex min-h-screen items-center justify-center bg-[#151D33] px-4"
      style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "40px 40px" }}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A2340] p-8 shadow-2xl text-center">
        <div className="mb-8 flex justify-center">
          <img src={logoHorizontal} alt="RideLine" className="h-12" />
        </div>

        <h1 className="mb-3 font-['Playfair_Display'] text-2xl font-bold text-white">
          Ready to Transform Your District's Transportation?
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-white/50">
          RideLine works directly with each district to configure your account. Start with a free route audit to see how much you could save.
        </p>

        <Link
          to="/demo"
          className="inline-block w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
        >
          Request Your Free Route Audit
        </Link>

        <p className="mt-6 text-sm text-white/40">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  </>
);

export default Signup;
