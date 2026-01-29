'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BRAND_COLOR } from '@/lib/constants';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; color: string }) => Promise<void>;
  loading?: boolean;
}

export function CreateProjectModal({ isOpen, onClose, onSubmit, loading }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) return;

    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      color: BRAND_COLOR,
    });

    setName('');
    setDescription('');
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create new project"
      description="Start building your knowledge graph"
    >
      <div className="space-y-4">
        <Input
          label="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Knowledge Graph"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim()) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        <TextArea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of your project..."
          rows={3}
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="brand"
          onClick={handleSubmit}
          disabled={!name.trim()}
          loading={loading}
          icon={<Plus className="h-4 w-4" />}
        >
          Create project
        </Button>
      </div>
    </Modal>
  );
}
