import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ToastSoundToggle from "./ToastSoundToggle";

const meta: Meta<typeof ToastSoundToggle> = {
  title: "Components/ToastSoundToggle",
  component: ToastSoundToggle,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ToastSoundToggle>;

export const Default: Story = {};
