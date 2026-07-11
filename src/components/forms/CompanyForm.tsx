import { useState } from "react";
import { createCompany } from "../../services/companyService";

export default function CompanyForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [companyName, setCompanyName] =
    useState("");

  const [website, setWebsite] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [status, setStatus] =
    useState("Active");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!companyName.trim()) {
      alert("Company Name Required");
      return;
    }

    await createCompany({
      company_name: companyName,
      website,
      address,
      status,
    });

    onSuccess();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border rounded-lg p-4 mb-4"
    >
      <h3 className="text-xl font-bold mb-4">
        Add Company
      </h3>

      <input
        type="text"
        placeholder="Company Name"
        value={companyName}
        onChange={(e) =>
          setCompanyName(e.target.value)
        }
        className="border p-2 w-full mb-3 rounded"
      />

      <input
        type="text"
        placeholder="Website"
        value={website}
        onChange={(e) =>
          setWebsite(e.target.value)
        }
        className="border p-2 w-full mb-3 rounded"
      />

      <textarea
        placeholder="Address"
        value={address}
        onChange={(e) =>
          setAddress(e.target.value)
        }
        className="border p-2 w-full mb-3 rounded"
      />

      <select
        value={status}
        onChange={(e) =>
          setStatus(e.target.value)
        }
        className="border p-2 w-full mb-3 rounded"
      >

      

        <option value="Active">
          Active
        </option>

        <option value="Inactive">
          Inactive
        </option>
      </select>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Save Company
      </button>
    </form>
  );
}