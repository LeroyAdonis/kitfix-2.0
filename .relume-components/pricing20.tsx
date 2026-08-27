"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "relume-icons";

type Feature = {
  icon: React.ReactNode;
  text: string;
};

type PricingPlan = {
  planName: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: Feature[];
  button: ButtonProps;
};

type Props = {
  tagline: string;
  heading: string;
  description: string;
  pricingPlans: PricingPlan[];
};

export type Pricing20Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Pricing20 = (props: Pricing20Props) => {
  const { tagline, heading, description, pricingPlans } = {
    ...Pricing20Defaults,
    ...props,
  };
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-12 max-w-lg text-center md:mb-18 lg:mb-20">
          <p className="mb-3 font-semibold md:mb-4">{tagline}</p>
          <h1 className="mb-5 text-h2 font-bold md:mb-6">{heading}</h1>
          <p className="text-medium">{description}</p>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <PricingPlan key={index} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

const PricingPlan = ({ plan }: { plan: PricingPlan }) => (
  <Card className="h-full px-6 py-8 md:p-8">
    <h2 className="mb-1 text-h6 font-bold">{plan.planName}</h2>
    <p>{plan.description}</p>
    <div className="my-8 h-px w-full bg-scheme-border" />
    <h3 className="my-2 text-h1 font-bold">
      {plan.monthlyPrice}
      <h4 className="text-h4 font-bold">/mo</h4>
    </h3>
    <p>or {plan.yearlyPrice} yearly</p>
    <div className="mt-6 md:mt-8">
      <Button {...plan.button} className="w-full">
        {plan.button.title}
      </Button>
    </div>
    <div className="my-8 h-px w-full bg-scheme-border" />
    <div className="grid grid-cols-1 gap-y-4 py-2">
      {plan.features.map((feature, index) => (
        <div key={index} className="flex self-start">
          <div className="mr-4 flex-none self-start">{feature.icon}</div>
          <p>{feature.text}</p>
        </div>
      ))}
    </div>
  </Card>
);

export const Pricing20Defaults: Props = {
  tagline: "Tagline",
  heading: "Pricing plan",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  pricingPlans: [
    {
      planName: "Basic plan",
      description: "Lorem ipsum dolor sit amet",
      monthlyPrice: "$19",
      yearlyPrice: "$199",
      features: [
        { icon: <Check className="size-6 text-scheme-text" />, text: "Feature text goes here" },
        { icon: <Check className="size-6 text-scheme-text" />, text: "Feature text goes here" },
        { icon: <Check className="size-6 text-scheme-text" />, text: "Feature text goes here" },
      ],
      button: { title: "Get started" },
    },
    {
      planName: "Business plan",
      description: "Lorem ipsum dolor sit amet",
      monthlyPrice: "$29",
      yearlyPrice: "$299",
      features: [
        { icon: <Check className="size-6 text-scheme-text" />, text: "Feature text goes here" },
        { icon: <Check className="size-6 text-scheme-text" />, text: "Feature text goes here" },
        { icon: <Check className="size-6 text-scheme-text" />, text: "Feature text goes here" },
        { icon: <Check className="size-6 text-scheme-text" />, text: "Feature text goes here" },
      ],
      button: { title: "Get started" },
    },
    {
      planName: "Enterprise plan",
      description: "Lorem ipsum dolor sit amet",
      monthlyPrice: "$49",
      yearlyPrice: "$499",
      features: [
        { icon: <Check className="size-6 text-scheme-text" />, text: "Feature text goes here" },
        { icon: <Check className="size-6 text-scheme-text" />, text: "Feature text goes here" },
        { icon: <Check className="size-6 text-scheme-text" />, text: "Feature text goes here" },
        { icon: <Check className="size-6 text-scheme-text" />, text: "Feature text goes here" },
        { icon: <Check className="size-6 text-scheme-text" />, text: "Feature text goes here" },
      ],
      button: { title: "Get started" },
    },
  ],
};