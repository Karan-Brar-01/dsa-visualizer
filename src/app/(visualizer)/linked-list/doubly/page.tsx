// Placeholder for routes not yet implemented
// This is a shared placeholder used by all unimplemented visualizer pages

export default function ComingSoonPage({
  params,
}: {
  params: { slug?: string }
}) {
  return (
    <div className="flex h-full items-center justify-center bg-[hsl(225,20%,6%)]">
      <div className="text-center">
        <p className="text-5xl mb-4">🚧</p>
        <h2 className="text-xl font-semibold text-[hsl(210,20%,92%)] mb-2">
          Coming Soon
        </h2>
        <p className="text-sm text-[hsl(210,8%,45%)]">
          This visualizer is being built. Check back shortly.
        </p>
      </div>
    </div>
  )
}
