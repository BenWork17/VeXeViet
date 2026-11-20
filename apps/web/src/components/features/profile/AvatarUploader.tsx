'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useToast } from '@/components/error/ToastProvider';
import { useRemoveAvatar, useUploadAvatar } from '@/lib/hooks/useAuth';
import { ACCEPTED_IMAGE_ACCEPT, validateImageFile } from '@/lib/api/media';
import { getErrorMessage } from '@/lib/api/client';

interface AvatarUploaderProps {
  avatarUrl?: string | null;
  initials: string;
  name: string;
}

/**
 * Profile avatar with instant preview (object URL), client validation,
 * loading + error states. The auth cache is patched by the mutation hooks, so
 * the header and profile page update immediately after a successful upload.
 */
export function AvatarUploader({ avatarUrl, initials, name }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const upload = useUploadAvatar();
  const remove = useRemoveAvatar();
  const { showSuccess, showError } = useToast();
  const busy = upload.isPending || remove.isPending;

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const validation = validateImageFile(file);
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    setPreview(URL.createObjectURL(file));
    try {
      await upload.mutateAsync(file);
      showSuccess('Đã cập nhật ảnh đại diện!');
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      showError('Lỗi', message);
    } finally {
      setPreview(null);
    }
  };

  const handleRemove = async () => {
    setError(null);
    try {
      await remove.mutateAsync();
      showSuccess('Đã xoá ảnh đại diện.');
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      showError('Lỗi', message);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <UserAvatar
          src={preview ?? avatarUrl}
          alt={`Ảnh đại diện của ${name}`}
          fallback={initials}
          className="h-20 w-20 border border-border bg-card"
          fallbackClassName="font-display text-2xl text-accent-foreground"
        />
        {busy ? (
          <span
            className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70"
            role="status"
            aria-label="Đang xử lý ảnh"
          >
            <Loader2 className="h-6 w-6 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label="Đổi ảnh đại diện"
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-hn-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Camera className="h-4 w-4" aria-hidden="true" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_ACCEPT}
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </div>
      {avatarUrl && !busy ? (
        <button
          type="button"
          onClick={handleRemove}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary-foreground/80 underline-offset-2 hover:underline"
        >
          <Trash2 className="h-3 w-3" aria-hidden="true" />
          Xoá ảnh
        </button>
      ) : null}
      {error ? (
        <p role="alert" className="max-w-[200px] text-center text-xs font-medium text-error-ink bg-error-soft rounded-sm px-2 py-1">
          {error}
        </p>
      ) : null}
    </div>
  );
}
