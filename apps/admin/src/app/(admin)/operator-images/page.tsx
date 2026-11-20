'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Camera, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import type { OperatorImages, OperatorImageType } from '@vexeviet/types';
import { useAdminSession } from '@/components/session';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingRows,
  PageHeader,
} from '@/components/ui';
import {
  ACCEPTED_IMAGE_TYPES,
  ApiError,
  request,
  resolveMediaUrl,
  uploadFile,
  useApi,
  validateImageFile,
} from '@/lib/api';
import type { AdminOperator, ListResponse } from '@/lib/types';

const MAX_IMAGES_PER_TYPE = 10;
const ACCEPT_ATTR = ACCEPTED_IMAGE_TYPES.join(',');

type Envelope<T> = { success: true; data: T };

function errorText(err: unknown): string {
  if (err instanceof ApiError) return err.failure.message;
  if (err instanceof Error) return err.message;
  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

function OperatorImagesContent() {
  const { session, ready } = useAdminSession();
  const searchParams = useSearchParams();
  const initialOperatorId = searchParams.get('operatorId') ?? '';

  const isAdmin = session?.role === 'ADMIN';
  const [selectedOperatorId, setSelectedOperatorId] = useState(initialOperatorId);

  const operatorsQuery = useApi<ListResponse<AdminOperator>>(
    ready && isAdmin ? '/routes/admin/operators' : null,
    { limit: 100, page: 1 }
  );
  const operators = operatorsQuery.data?.data ?? [];

  useEffect(() => {
    const first = operators[0];
    if (!isAdmin || selectedOperatorId || !first) return;
    setSelectedOperatorId(first.id);
  }, [isAdmin, selectedOperatorId, operators]);

  const effectiveOperatorId = isAdmin ? selectedOperatorId || undefined : undefined;
  const imagesPath =
    ready && (!isAdmin || effectiveOperatorId) ? '/users/operator/images' : null;

  const imagesQuery = useApi<Envelope<OperatorImages>>(
    imagesPath,
    effectiveOperatorId ? { operatorId: effectiveOperatorId } : undefined
  );

  const [images, setImages] = useState<OperatorImages | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(
    null
  );

  useEffect(() => {
    if (imagesQuery.data?.data) {
      setImages(imagesQuery.data.data);
    } else if (imagesPath === null) {
      setImages(null);
    }
  }, [imagesQuery.data, imagesPath]);

  const opQuery = effectiveOperatorId ? { operatorId: effectiveOperatorId } : undefined;

  const handleAvatarUpload = async (file: File | undefined) => {
    if (!file) return;
    const validation = validateImageFile(file);
    if (validation) {
      setFeedback({ type: 'error', message: validation });
      return;
    }
    setFeedback(null);
    setBusyKey('avatar');
    try {
      const res = await uploadFile<Envelope<OperatorImages>>(
        '/users/operator/avatar',
        file,
        'PUT',
        opQuery
      );
      setImages(res.data);
      setFeedback({ type: 'success', message: 'Đã cập nhật ảnh đại diện nhà xe.' });
    } catch (err) {
      setFeedback({ type: 'error', message: errorText(err) });
    } finally {
      setBusyKey(null);
    }
  };

  const handleAvatarDelete = async () => {
    setFeedback(null);
    setBusyKey('avatar-delete');
    try {
      const res = await request<Envelope<OperatorImages>>('/users/operator/avatar', {
        method: 'DELETE',
        query: opQuery,
      });
      setImages(res.data);
      setFeedback({ type: 'success', message: 'Đã xoá ảnh đại diện nhà xe.' });
    } catch (err) {
      setFeedback({ type: 'error', message: errorText(err) });
    } finally {
      setBusyKey(null);
    }
  };

  const handleAddGalleryImage = async (type: OperatorImageType, file: File | undefined) => {
    if (!file) return;
    const validation = validateImageFile(file);
    if (validation) {
      setFeedback({ type: 'error', message: validation });
      return;
    }
    setFeedback(null);
    setBusyKey(`add-${type}`);
    try {
      const res = await uploadFile<Envelope<OperatorImages>>(
        `/users/operator/images/${type}`,
        file,
        'POST',
        opQuery
      );
      setImages(res.data);
      setFeedback({
        type: 'success',
        message:
          type === 'interior' ? 'Đã thêm ảnh nội thất xe.' : 'Đã thêm ảnh chụp xe.',
      });
    } catch (err) {
      setFeedback({ type: 'error', message: errorText(err) });
    } finally {
      setBusyKey(null);
    }
  };

  const handleDeleteGalleryImage = async (type: OperatorImageType, url: string) => {
    setFeedback(null);
    setBusyKey(`del-${type}-${url}`);
    try {
      const res = await request<Envelope<OperatorImages>>(
        `/users/operator/images/${type}`,
        {
          method: 'DELETE',
          query: { url, ...(opQuery ?? {}) },
        }
      );
      setImages(res.data);
      setFeedback({ type: 'success', message: 'Đã xoá ảnh.' });
    } catch (err) {
      setFeedback({ type: 'error', message: errorText(err) });
    } finally {
      setBusyKey(null);
    }
  };

  const avatarUrl = resolveMediaUrl(images?.operatorAvatarUrl);
  const interiorImages = images?.interiorImages ?? [];
  const exteriorImages = images?.exteriorImages ?? [];

  return (
    <>
      <PageHeader
        title="Hình ảnh nhà xe"
        description="Quản lý ảnh đại diện nhà xe, ảnh nội thất xe và ảnh chụp xe hiển thị cho khách hàng."
      />

      {isAdmin ? (
        <Card className="mb-6 flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="min-w-[240px] flex-1">
            <label
              htmlFor="operator-picker"
              className="mb-1.5 block text-small font-semibold text-ink"
            >
              Chọn nhà xe cần quản lý
            </label>
            <select
              id="operator-picker"
              value={selectedOperatorId}
              onChange={(e) => {
                setSelectedOperatorId(e.target.value);
                setFeedback(null);
              }}
              disabled={operatorsQuery.loading}
              className="h-9 w-full max-w-md rounded-control border border-control bg-sheet px-3 text-[13px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              {operators.length === 0 ? (
                <option value="">
                  {operatorsQuery.loading ? 'Đang tải danh sách nhà xe…' : 'Không có nhà xe'}
                </option>
              ) : (
                operators.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name} ({op.contactEmail})
                  </option>
                ))
              )}
            </select>
          </div>
        </Card>
      ) : null}

      {feedback ? (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`mb-6 rounded-control border px-4 py-3 text-[13px] font-medium ${
            feedback.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {!ready || imagesQuery.loading ? (
        <LoadingRows rows={4} />
      ) : imagesQuery.error ? (
        <ErrorState
          message={imagesQuery.error.message}
          code={imagesQuery.error.code}
          status={imagesQuery.status}
          details={imagesQuery.error.details}
          onRetry={imagesQuery.reload}
        />
      ) : isAdmin && !effectiveOperatorId ? (
        <EmptyState
          title="Chưa chọn nhà xe"
          description="Chọn một nhà xe ở phía trên để xem và cập nhật hình ảnh."
        />
      ) : (
        <div className="space-y-6">
          <AvatarCard
            avatarUrl={avatarUrl}
            busy={busyKey === 'avatar' || busyKey === 'avatar-delete'}
            onUpload={handleAvatarUpload}
            onDelete={handleAvatarDelete}
          />

          <GalleryCard
            title="Ảnh nội thất xe"
            description="Hiển thị không gian ghế/giường nằm, tiện nghi bên trong xe (tối đa 10 ảnh)."
            images={interiorImages}
            type="interior"
            busyKey={busyKey}
            onAdd={(file) => handleAddGalleryImage('interior', file)}
            onDelete={(url) => handleDeleteGalleryImage('interior', url)}
          />

          <GalleryCard
            title="Ảnh chụp xe (Ngoại thất)"
            description="Hình ảnh tổng quan bên ngoài xe khách, biển hiệu nhà xe (tối đa 10 ảnh)."
            images={exteriorImages}
            type="exterior"
            busyKey={busyKey}
            onAdd={(file) => handleAddGalleryImage('exterior', file)}
            onDelete={(url) => handleDeleteGalleryImage('exterior', url)}
          />
        </div>
      )}
    </>
  );
}

function AvatarCard({
  avatarUrl,
  busy,
  onUpload,
  onDelete,
}: {
  avatarUrl?: string;
  busy: boolean;
  onUpload: (file: File | undefined) => void;
  onDelete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-rule bg-raised">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Ảnh đại diện nhà xe"
                className="h-full w-full object-cover"
              />
            ) : (
              <Camera className="h-6 w-6 text-muted" aria-hidden="true" />
            )}
            {busy ? (
              <span className="absolute inset-0 flex items-center justify-center bg-white/70">
                <Loader2 className="h-5 w-5 animate-spin text-ink" />
              </span>
            ) : null}
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Ảnh đại diện nhà xe</h2>
            <p className="mt-0.5 text-small text-muted">
              Định dạng JPG, PNG hoặc WebP. Tối đa 5MB.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_ATTR}
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              onUpload(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <Button
            tone="primary"
            isLoading={busy}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            {avatarUrl ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
          </Button>
          {avatarUrl ? (
            <Button tone="secondary" disabled={busy} onClick={onDelete}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Xoá ảnh
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function GalleryCard({
  title,
  description,
  images,
  type,
  busyKey,
  onAdd,
  onDelete,
}: {
  title: string;
  description: string;
  images: string[];
  type: OperatorImageType;
  busyKey: string | null;
  onAdd: (file: File | undefined) => void;
  onDelete: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isAdding = busyKey === `add-${type}`;
  const isFull = images.length >= MAX_IMAGES_PER_TYPE;

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink">
            {title}{' '}
            <span className="text-small font-normal text-muted">
              ({images.length}/{MAX_IMAGES_PER_TYPE})
            </span>
          </h2>
          <p className="mt-0.5 text-small text-muted">{description}</p>
        </div>

        <div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_ATTR}
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              onAdd(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <Button
            tone="primary"
            isLoading={isAdding}
            disabled={isFull || busyKey !== null}
            onClick={() => inputRef.current?.click()}
            title={isFull ? 'Đã đạt giới hạn 10 ảnh' : undefined}
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            Thêm ảnh
          </Button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="rounded-control border border-dashed border-rule bg-raised py-10 text-center text-small text-muted">
          Chưa có ảnh nào. Nhấn &ldquo;Thêm ảnh&rdquo; để tải lên (JPG, PNG, WebP, tối đa 5MB).
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {images.map((rawUrl, index) => {
            const src = resolveMediaUrl(rawUrl);
            const isDeleting = busyKey === `del-${type}-${rawUrl}`;
            return (
              <div
                key={rawUrl}
                className="group relative aspect-[4/3] overflow-hidden rounded-control border border-rule bg-raised"
              >
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={`${title} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <button
                  type="button"
                  disabled={busyKey !== null}
                  onClick={() => onDelete(rawUrl)}
                  aria-label={`Xoá ảnh ${index + 1}`}
                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white opacity-90 transition-opacity hover:bg-red-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default function OperatorImagesPage() {
  return (
    <Suspense fallback={<LoadingRows rows={4} />}>
      <OperatorImagesContent />
    </Suspense>
  );
}
