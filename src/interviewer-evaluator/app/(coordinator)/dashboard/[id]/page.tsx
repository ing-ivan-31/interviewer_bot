interface DashboardDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardDetailPage({
  params,
}: DashboardDetailPageProps) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-900">Evaluation Detail</h1>
      <p className="mt-2 text-sm text-gray-500">
        Session <span className="font-mono">{id}</span> — coming soon.
      </p>
    </main>
  );
}
