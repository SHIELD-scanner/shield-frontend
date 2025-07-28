
import type { Meta } from "@storybook/react";
import { Button } from "./button";

export default {
  title: "shadcn-ui/Button",
  component: Button,
} as Meta<typeof Button>;

export const Default = {
  args: {
    children: "Button",
  },
};
