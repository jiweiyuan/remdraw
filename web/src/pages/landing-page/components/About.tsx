

export const About = () => {
  return (
      <section
          id="about"
          className="container py-6 sm:py-12"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Why You might Need Remdraw
          <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">

        </span>
        </h2>
        <div>
          <img src={"/about.png"}/>
        </div>
      </section>
  );
};
