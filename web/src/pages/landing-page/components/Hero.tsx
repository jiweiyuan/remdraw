import { Button } from "@/components/ui/button";

import {Youtube } from 'lucide-react';
export const Hero = () => {
    const handleSubmit = (e: any) => {
        e.preventDefault();
        console.log("Subscribed!");
    };
  return (
      <section className="container grid lg:grid-cols-2 place-items-center py-12 md:py-20 gap-10">
          <div className="text-center lg:text-start space-y-6">
              <main className="text-2xl md:text-3xl font-bold">
                  <div className="bg-clip-text tinline">
                      Make Flashcards in Your Whitboard
                  </div>
              </main>

              <p className="text-xl md:w-10/12 mx-auto lg:mx-0">
                  Remdraw is a knowledge visulazition application with spaced repetition.
              </p>
              <div className={""}>
                  <p className={"py-4 font-bold"}>Remdraw = Excalidraw + Anki</p>
                  <p className={"pt-2"}>Increase your understanding by knowledge visualiation.</p>
                  <p className={""}>Enhance your memory through spaced repetition.</p>
              </div>

              <div className="space-y-2">

                  <div className="">
                      Our application is coming soon. Follow us on YouTube for the latest updates.
                  </div>

                  <form
                      className=" pl-0 flex gap-4 md:gap-2"
                      onSubmit={handleSubmit}
                  >
                      {/*<Input*/}
                      {/*    placeholder="youremail@gmail.com"*/}
                      {/*    className="bg-muted/50 dark:bg-muted/80 "*/}
                      {/*    aria-label="email"*/}
                      {/*/>*/}
                      {/*X*/}
                      <Button variant="outline" className="flex items-center space-x-2"
                              onClick={() => window.location.href = 'https://www.youtube.com/@remdraw'}

                      >
                          <Youtube className="w-4 h-4"/>
                          <span>Remdraw</span>
                      </Button>
                  </form>
              </div>
          </div>

          {/* Hero cards sections */}
          <div className="z-10 w-full h-full border-primary/60 border-4 shadow rounded-2xl ">
              <iframe src="https://www.youtube.com/embed/APOAD7Xh4nw"
                      className={"rounded-xl"}
                      width="100%" height="100%"
                      title="YouTube video player" frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
          </div>

          {/* Shadow effect */}
          <div className="shadow"></div>


      </section>
  );
};
