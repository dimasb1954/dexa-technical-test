import { useRef, useState, type ChangeEvent } from 'react';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

interface Props {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  maxSizeMB?: number;
}

export default function PhotoUpload({
  file,
  onChange,
  disabled = false,
  maxSizeMB = 5,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
    onChange(null);
  };

  const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!ALLOWED.includes(selected.type)) {
      setError('Format harus JPG, PNG, atau WEBP');
      return reset();
    }
    if (selected.size > maxSizeMB * 1024 * 1024) {
      setError(`Ukuran foto maksimal ${maxSizeMB} MB`);
      return reset();
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
    onChange(selected);
  };

  // Preview hanya tampil selama parent masih memegang file
  const shown = file ? preview : null;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleSelect}
        disabled={disabled}
        hidden
      />

      {shown ? (
        <div className="flex flex-col items-start gap-3">
          <img
            src={shown}
            alt="Pratinjau foto bukti WFH"
            className="max-h-72 w-full rounded-3xl border border-line object-cover"
          />
          <button
            type="button"
            className="btn btn-soft"
            onClick={reset}
            disabled={disabled}
          >
            Ganti foto
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-3xl border-2 border-dashed border-line bg-soft/60 px-4 py-10 text-sm font-semibold transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          Klik untuk memilih foto bukti WFH
          <small className="font-normal text-muted">
            JPG, PNG, atau WEBP, maksimal {maxSizeMB} MB
          </small>
        </button>
      )}

      {error && <p className="text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}