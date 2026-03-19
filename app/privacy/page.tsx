export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-12 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      <div className="prose text-gray-600 space-y-4">
        <p>Your privacy matters. Here is how we handle your data:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Images you upload are sent directly to the remove.bg API for processing.</li>
          <li>We do not store, log, or retain any images on our servers.</li>
          <li>Processed images are returned directly to your browser and never saved.</li>
          <li>We do not collect any personal information or require account creation.</li>
        </ul>
        <p>
          Background removal is powered by{" "}
          <a href="https://www.remove.bg" className="text-purple-600 underline" target="_blank" rel="noopener noreferrer">
            remove.bg
          </a>
          . Please refer to their{" "}
          <a href="https://www.remove.bg/privacy" className="text-purple-600 underline" target="_blank" rel="noopener noreferrer">
            privacy policy
          </a>{" "}
          for details on how they handle uploaded images.
        </p>
      </div>
      <a href="/" className="mt-8 inline-block text-sm text-purple-600 hover:underline">← Back to Home</a>
    </div>
  );
}
