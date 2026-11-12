import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ReducedMotionToggle from "./ReducedMotionToggle";

const meta: Meta<typeof ReducedMotionToggle> = {
  title: "Components/ReducedMotionToggle",
  component: ReducedMotionToggle,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ReducedMotionToggle>;

export const Default: Story = {};
