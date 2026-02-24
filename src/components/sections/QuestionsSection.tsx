import { useNavigate } from "react-router-dom";
import { ScrollReveal } from "@/components/ScrollReveal";

const questions = [
  "Are we running more routes than we actually need?",
  "Are our contractor rates competitive with neighboring districts?",
  "What would we save by consolidating 10% of our routes?",
  "Are buses actually going where they're supposed to be going?",
  "How many students are currently incorrectly assigned?",
  "What is our precise cost per student per mile transported?",
];

export const QuestionsSection = () => {
  const navigate = useNavigate();

  return (
  <section className="bg-background py-20 md:py-28">
    <div className="mx-auto max-w-[1200px] px-4 md:px-6">
      <ScrollReveal>
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">The Data Gap</p>
          <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl">
            The six questions you can't answer today.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Every one of these requires data you don't have. RideLine gives you the answers.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {questions.map((q, i) => (
          <ScrollReveal key={i} delay={i * 0.07}>
            <div
              onClick={() => navigate("/demo")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate("/demo"); }}
              className="group cursor-pointer rounded-xl border bg-card p-6 transition-all duration-300 hover:border-accent hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 font-display text-lg font-bold text-accent">
                {i + 1}
              </div>
              <p className="font-medium leading-relaxed">{q}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
  );
};
