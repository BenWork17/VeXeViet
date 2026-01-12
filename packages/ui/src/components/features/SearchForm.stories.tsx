import type { Meta, StoryObj } from '@storybook/react';
import { SearchForm } from '../../../../apps/web/src/components/features/search/SearchForm/SearchForm';

const meta = {
  title: 'Features/SearchForm',
  component: SearchForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isLoading: {
      control: 'boolean',
      description: 'Loading state of the form',
    },
  },
} satisfies Meta<typeof SearchForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: (values) => {
      console.log('Form submitted:', values);
      alert(`Searching routes from ${values.origin} to ${values.destination}`);
    },
    isLoading: false,
  },
};

export const WithInitialValues: Story = {
  args: {
    initialValues: {
      origin: 'Hanoi',
      destination: 'Ho Chi Minh City',
      departureDate: new Date(2026, 1, 15),
      passengers: 2,
    },
    onSubmit: (values) => {
      console.log('Form submitted:', values);
    },
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    onSubmit: (values) => {
      console.log('Form submitted:', values);
    },
    isLoading: true,
  },
};

export const WithReturnDate: Story = {
  args: {
    initialValues: {
      origin: 'Hanoi',
      destination: 'Da Nang',
      departureDate: new Date(2026, 1, 20),
      returnDate: new Date(2026, 1, 25),
      passengers: 1,
    },
    onSubmit: (values) => {
      console.log('Form submitted:', values);
    },
    isLoading: false,
  },
};
