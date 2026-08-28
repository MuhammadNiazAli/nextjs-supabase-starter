import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ContributorsSection from "./ContributorsSection";

const meta: Meta<typeof ContributorsSection> = {
  title: "Components/ContributorsSection",
  component: ContributorsSection,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof ContributorsSection>;

export const Default: Story = {};
