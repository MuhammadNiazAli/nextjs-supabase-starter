import Spinner from "@/components/Spinner";

// Shown while the dashboard route segment loads, using the same
// spinner the page itself shows while it fetches the user.
export default function Loading() {
  return (
    <div className="flex justify-center items-center py-16">
      <Spinner className="h-6 w-6 text-primary" />
    </div>
  );
}
