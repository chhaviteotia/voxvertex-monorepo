import { Upload } from "lucide-react";

interface BrandingContentStepProps {
  formData: {
    description: string;
    image: File | null;
    tags: string[];
  };
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onFormDataUpdate: (data: any) => void;
}

export default function BrandingContentStep({
  formData,
  onInputChange,
  onFormDataUpdate,
}: BrandingContentStepProps) {
  return (
    <div className="space-y-6 pl-6 pr-6">
      {/* Upload Banner Image */}
      <div>
        <div className="relative">
          <label className="absolute left-4 -top-2 bg-white px-2 text-sm font-medium text-[#FF6B35] z-10">
            Upload Banner Image *
          </label>
          <div className="border-2 border-dashed border-[#FF6B35] rounded-lg p-8 text-center bg-gray-50 pt-12">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-[#FF6B35]" />
            </div>
            <p className="text-gray-600 mb-2">Tap to upload Event Banner</p>
            <p className="text-xs text-gray-500 mb-4">
              Supported formats: JPG, PNG (Max 5MB)
            </p>
            <button className="bg-[#FF6B35] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
              Browse File
            </button>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                onFormDataUpdate({ image: file });
              }}
              className="hidden"
              id="banner-image"
            />
            <label
              htmlFor="banner-image"
              className="cursor-pointer absolute inset-0"
            ></label>
            {formData.image && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 font-medium">
                  ✓ {formData.image.name} uploaded successfully
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Description */}
      <div>
        <div className="relative">
          <label
            htmlFor="description"
            className="absolute left-4 -top-2 bg-white px-2 text-sm font-medium text-[#FF6B35] z-10"
          >
            Event Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={onInputChange}
            required
            rows={6}
            className="w-full px-4 py-3 pt-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] resize-none"
            placeholder="Describe your event..."
            suppressHydrationWarning
          />
        </div>
      </div>
    </div>
  );
}
