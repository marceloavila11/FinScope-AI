import UploadForm from "../pages/UploadForm";

interface ModalNewRecordProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalNewRecord({ isOpen, onClose }: ModalNewRecordProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold text-primary mb-4">
          Nuevo Registro Financiero
        </h2>
        <UploadForm onSuccess={onClose} />
      </div>
    </div>
  );
}
