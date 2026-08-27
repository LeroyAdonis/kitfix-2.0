import { Button, type ButtonProps } from "@/components/ui/button";

type Props = {
  heading: string;
  description: string;
  buttons: ButtonProps[];
};

export type Cta25Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Cta25 = (props: Cta25Props) => {
  const { heading, description, buttons } = {
    ...Cta25Defaults,
    ...props,
  };
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container max-w-lg text-center">
        <h2 className="mb-5 text-h2 font-bold md:mb-6">{heading}</h2>
        <p className="text-medium">{description}</p>
        <div className="mt-6 flex items-center justify-center gap-4 md:mt-8">
          {buttons.map((button, index) => (
            <Button key={index} {...button}>
              {button.title}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Cta25Defaults: Props = {
  heading: "Medium length heading goes here",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
  buttons: [{ title: "Button" }, { title: "Button", variant: "secondary" }],
};