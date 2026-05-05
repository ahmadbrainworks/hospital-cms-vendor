"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Alert,
  Topbar,
} from "@/components/ui";
import { ArrowLeft } from "lucide-react";

interface FormData {
  name: string;
  city: string;
  state: string;
  country: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  description?: string;
}

export default function NewHospitalPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    city: "",
    state: "",
    country: "USA",
    contactEmail: "",
    contactPhone: "",
    address: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Hospital name is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.contactEmail.includes("@"))
      newErrors.contactEmail = "Valid email is required";
    if (!formData.contactPhone.trim())
      newErrors.contactPhone = "Phone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
      const res = await fetch(`${baseUrl}/hospitals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create hospital");
      }

      const data = await res.json();
      router.push(`/hospitals/${data.data._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create hospital");
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <Topbar
        title="Add New Hospital"
        subtitle="Register a new hospital in the system"
        rightSlot={
          <Link href="/hospitals">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
              Back
            </Button>
          </Link>
        }
        sticky
      />

      <div className="p-8 max-w-3xl mx-auto">
        {error && (
          <Alert
            variant="error"
            title="Error"
            dismissible
            onClose={() => setError(null)}
            className="mb-6"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Hospital Information */}
          <Card className="mb-6">
            <CardHeader>
              <h3 className="font-semibold">Hospital Information</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Hospital Name"
                name="name"
                placeholder="e.g., St. Mary Medical Center"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />

              <Textarea
                label="Description"
                name="description"
                placeholder="Brief description of the hospital..."
                value={formData.description}
                onChange={handleChange}
              />

              <Input
                label="Address"
                name="address"
                placeholder="123 Medical Plaza Drive"
                value={formData.address}
                onChange={handleChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="City"
                  name="city"
                  placeholder="New York"
                  value={formData.city}
                  onChange={handleChange}
                  error={errors.city}
                  required
                />
                <Input
                  label="State"
                  name="state"
                  placeholder="NY"
                  value={formData.state}
                  onChange={handleChange}
                  error={errors.state}
                  required
                />
                <Input
                  label="Country"
                  name="country"
                  placeholder="USA"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="mb-6">
            <CardHeader>
              <h3 className="font-semibold">Contact Information</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Contact Email"
                type="email"
                name="contactEmail"
                placeholder="admin@hospital.com"
                value={formData.contactEmail}
                onChange={handleChange}
                error={errors.contactEmail}
                required
              />

              <Input
                label="Contact Phone"
                type="tel"
                name="contactPhone"
                placeholder="(555) 123-4567"
                value={formData.contactPhone}
                onChange={handleChange}
                error={errors.contactPhone}
                required
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <Card>
            <CardFooter className="flex gap-3 justify-end">
              <Link href="/hospitals">
                <Button variant="ghost">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Hospital"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
