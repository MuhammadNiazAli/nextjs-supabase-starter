import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import PasswordInput from "./PasswordInput";

const meta: Meta<typeof PasswordInput> = {
  title: "Components/PasswordInput",
  component: PasswordInput,
  parameters: {
    layout: "centered",
  },
  args: {
    placeholder: "Enter your password",
    value: "",
    onChange: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    value: "hunter2",
  },
};
