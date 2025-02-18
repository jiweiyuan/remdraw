import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "Is this application free?",
    answer: "Yes. It provides a free tier for all users.",
    value: "item-1",
  },
  {
    question: "When will the application be available?",
    answer: "We are currently in the beta phase. The application will be available soon.",
    value: "item-2",
  },
    {
        question: "How can I get access to the beta version?",
        answer: "You can contact us by email at contact@remdraw.com to get access to the beta version.",
        value: "item-3",
    }
];

export const FAQ = () => {
  return (
    <section
      id="faq"
      className="container py-12 sm:py-16"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-4">
        Frequently Asked{" "}Questions
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">

        </span>
      </h2>

      <Accordion
        type="single"
        collapsible
        className="w-full AccordionRoot"
      >
        {FAQList.map(({ question, answer, value }: FAQProps) => (
          <AccordionItem
            key={value}
            value={value}
          >
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <h3 className="font-medium mt-4">
        Still have questions?{" "} Contact us by email at{" "}
        <a
          rel="noreferrer noopener"
          href="#"
          className="text-primary transition-all border-primary hover:border-b-2"
        >
          contact@remdraw.com
        </a>
      </h3>
    </section>
  );
};
