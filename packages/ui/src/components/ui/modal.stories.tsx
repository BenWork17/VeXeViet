import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
} from './modal';
import { Button } from './button';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalHeader>
            <ModalTitle>Modal Title</ModalTitle>
            <ModalDescription>
              This is a modal description explaining what this modal is about.
            </ModalDescription>
          </ModalHeader>
          <ModalContent>
            <p>This is the modal content area.</p>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

export const WithForm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Form Modal</Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalHeader>
            <ModalTitle>Create Account</ModalTitle>
            <ModalDescription>
              Fill in the form below to create your account.
            </ModalDescription>
          </ModalHeader>
          <ModalContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Create
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

export const DangerConfirmation: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete Account
        </Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalHeader>
            <ModalTitle>Are you sure?</ModalTitle>
            <ModalDescription>
              This action cannot be undone. This will permanently delete your account.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};
